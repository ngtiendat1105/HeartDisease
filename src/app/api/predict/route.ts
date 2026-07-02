import { NextRequest, NextResponse } from 'next/server';
import * as ort from 'onnxruntime-node';
import path from 'path';

// Định nghĩa interface cho dữ liệu đầu vào
interface PredictRequest {
  Sex: number;       // 1 = Nam, 0 = Nữ
  Age: number;       // 1 - 13 nhóm tuổi
  HighBP: number;    // 1 = Có, 0 = Không
  HighChol: number;  // 1 = Có, 0 = Không
  BMI: number;       // Chỉ số khối cơ thể
  Smoker: number;    // 1 = Có, 0 = Không
  modelType?: 'xgboost' | 'random_forest' | 'logistic_regression';
}

// Caching các phiên làm việc của từng mô hình để tối ưu hóa hiệu năng
const sessions: Record<string, ort.InferenceSession> = {};

// Cấu hình bản đồ ánh xạ mô hình
const MODEL_CONFIG = {
  xgboost: {
    fileName: 'heart_model.onnx',
    displayName: 'XGBoost Ensemble',
    outputNames: ['label', 'probabilities']
  },
  random_forest: {
    fileName: 'heart_rf_model.onnx',
    displayName: 'Random Forest',
    // Chỉ lấy output_label vì output_probability trả về Sequence of Maps (không được hỗ trợ bởi onnxruntime-node)
    outputNames: ['output_label']
  },
  logistic_regression: {
    fileName: 'heart_lr_model.onnx',
    displayName: 'Logistic Regression',
    // Chỉ lấy output_label vì tương tự Random Forest
    outputNames: ['output_label']
  }
};

async function getInferenceSession(modelType: 'xgboost' | 'random_forest' | 'logistic_regression'): Promise<ort.InferenceSession> {
  const config = MODEL_CONFIG[modelType];
  if (!config) {
    throw new Error(`Thuật toán không được hỗ trợ: ${modelType}`);
  }

  if (!sessions[modelType]) {
    const modelPath = path.join(process.cwd(), 'public', config.fileName);
    try {
      sessions[modelType] = await ort.InferenceSession.create(modelPath);
      console.log(`ONNX Model [${config.displayName}] loaded successfully from:`, modelPath);
    } catch (err: any) {
      console.error(`Failed to load ONNX model [${config.displayName}] from:`, modelPath, err);
      throw new Error(`Không thể khởi tạo mô hình ${config.displayName}: ${err.message}`);
    }
  }
  return sessions[modelType];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { Sex, Age, HighBP, HighChol, BMI, Smoker, modelType = 'xgboost' } = body as Partial<PredictRequest>;

    // 1. Kiểm tra sự tồn tại của các trường dữ liệu bắt buộc
    if (
      Sex === undefined ||
      Age === undefined ||
      HighBP === undefined ||
      HighChol === undefined ||
      BMI === undefined ||
      Smoker === undefined
    ) {
      return NextResponse.json(
        { error: 'Thiếu trường dữ liệu đầu vào. Vui lòng cung cấp đầy đủ: Sex, Age, HighBP, HighChol, BMI, Smoker.' },
        { status: 400 }
      );
    }

    // Kiểm tra tính hợp lệ của modelType
    const validModelTypes = ['xgboost', 'random_forest', 'logistic_regression'];
    if (modelType && !validModelTypes.includes(modelType)) {
      return NextResponse.json(
        { error: `Loại thuật toán '${modelType}' không hợp lệ. Vui lòng chọn một trong: xgboost, random_forest, logistic_regression.` },
        { status: 400 }
      );
    }

    // 2. Validate dữ liệu chi tiết
    if (
      typeof Sex !== 'number' || (Sex !== 0 && Sex !== 1) ||
      typeof Age !== 'number' || Age < 1 || Age > 13 ||
      typeof HighBP !== 'number' || (HighBP !== 0 && HighBP !== 1) ||
      typeof HighChol !== 'number' || (HighChol !== 0 && HighChol !== 1) ||
      typeof BMI !== 'number' || BMI <= 0 || BMI > 100 ||
      typeof Smoker !== 'number' || (Smoker !== 0 && Smoker !== 1)
    ) {
      return NextResponse.json(
        { error: 'Dữ liệu đầu vào không hợp lệ. Vui lòng kiểm tra lại kiểu dữ liệu và khoảng giá trị của từng trường.' },
        { status: 400 }
      );
    }

    // 3. Khởi tạo/Lấy phiên làm việc của mô hình tương ứng
    const resolvedModelType = modelType as 'xgboost' | 'random_forest' | 'logistic_regression';
    const inferenceSession = await getInferenceSession(resolvedModelType);
    const config = MODEL_CONFIG[resolvedModelType];

    // 4. Tạo input tensor với đúng thứ tự: Sex, Age, HighBP, HighChol, BMI, Smoker
    const inputData = Float32Array.from([Sex, Age, HighBP, HighChol, BMI, Smoker]);
    const inputTensor = new ort.Tensor('float32', inputData, [1, 6]);
    const feeds = { float_input: inputTensor };

    // 5. Chạy suy luận (inference) an toàn với danh sách output được tối ưu
    const results = await inferenceSession.run(feeds, config.outputNames);

    // 6. Trích xuất nhãn dự đoán nhị phân (0 hoặc 1)
    const labelTensor = results.label || results.output_label;
    if (!labelTensor) {
      throw new Error(`Mô hình ${config.displayName} không trả về output label.`);
    }
    const predictedLabel = Number(labelTensor.data[0]); // 0 hoặc 1 (từ BigInt64Array)

    // 7. Trích xuất xác suất hoặc tính toán heuristic score tương đương
    let score = 0;
    if (resolvedModelType === 'xgboost') {
      const probabilitiesTensor = results.probabilities;
      if (probabilitiesTensor && probabilitiesTensor.data) {
        const prob1 = Number(probabilitiesTensor.data[1]);
        score = Math.round(prob1 * 100);
      } else {
        score = predictedLabel === 1 ? 75 : 15;
      }
    } else {
      // Đối với Random Forest và Logistic Regression, ta tính heuristic score dựa trên nhãn dự đoán và các chỉ số sức khỏe của người dùng
      let calculatedScore = predictedLabel === 1 ? 70 : 10;
      if (HighBP === 1) calculatedScore += 10;
      if (HighChol === 1) calculatedScore += 8;
      if (Smoker === 1) calculatedScore += 7;
      if (Sex === 1) calculatedScore += 3;
      calculatedScore += Age * 1.5;
      if (BMI >= 30) calculatedScore += 8;
      else if (BMI >= 25) calculatedScore += 4;
      
      score = Math.round(Math.max(5, Math.min(98, calculatedScore)));
    }

    // 8. Xây dựng logic phân cấp mức độ nguy cơ theo yêu cầu
    let riskLevel: 'Thấp' | 'Trung bình' | 'Cao' = 'Thấp';
    let advice = '';

    if (predictedLabel === 1) {
      riskLevel = 'Cao';
      advice = 'Hệ thống phát hiện nguy cơ tim mạch ở mức báo động. Bạn nên đến gặp bác sĩ chuyên khoa để kiểm tra chuyên sâu.';
    } else if (HighBP === 1 || HighChol === 1) {
      riskLevel = 'Trung bình';
      advice = 'Bạn có chỉ số huyết áp hoặc cholesterol cao. Nên hạn chế đồ ăn dầu mỡ và kiểm tra sức khỏe định kỳ.';
    } else {
      riskLevel = 'Thấp';
      advice = 'Chỉ số sức khỏe của bạn rất tốt. Hãy tiếp tục duy trì chế độ ăn uống và sinh hoạt lành mạnh!';
    }

    return NextResponse.json({
      riskLevel,
      advice,
      score,
      executedModel: config.displayName
    });

  } catch (error: any) {
    console.error('Lỗi xảy ra trong quá trình xử lý POST API /api/predict:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi trên máy chủ khi phân tích chẩn đoán: ' + (error.message || error) },
      { status: 500 }
    );
  }
}
