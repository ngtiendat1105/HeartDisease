'use client';

import React, { useState } from 'react';
import { Cpu, CheckCircle2, ChevronRight } from 'lucide-react';
import { HyperparamsModal } from './HyperparamsModal';

export const ModelInsights: React.FC = () => {
  const [paramsModalOpen, setParamsModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'xgboost' | 'random_forest' | 'logistic_regression' | null>(null);

  const models = [
    {
      name: 'Bộ Phân Loại XGBoost',
      type: 'Mô hình Chính',
      desc: 'Mô hình cây quyết định tăng cường gradient (Gradient Boosted Trees) tối ưu hóa cho dữ liệu lâm sàng dạng bảng. Đạt độ nhạy (sensitivity) và khả năng tổng quát hóa cao nhất.',
      accuracy: '89.0%',
      auc: '0.932',
      color: 'red' as const,
      id: 'xgboost' as const,
    },
    {
      name: 'Ensemble Random Forest',
      type: 'Mô hình Phụ',
      desc: 'Bộ phân loại ensemble dạng bagging được sử dụng để đánh giá phương sai lâm sàng, thực hiện kỹ thuật bootstrap và đối chiếu chéo các nhánh phân tách cây quyết định.',
      accuracy: '86.4%',
      auc: '0.908',
      color: 'rose' as const,
      id: 'random_forest' as const,
    },
    {
      name: 'Hồi Quy Logistic',
      type: 'Mô hình Đối chứng',
      desc: 'Bộ ước lượng cơ sở có chính quy hóa (Regularized Baseline) dùng để xác thực hệ số log-odds, mối quan hệ tuyến tính của biến số và mức độ ý nghĩa thống kê (p-value).',
      accuracy: '81.2%',
      auc: '0.845',
      color: 'gray' as const,
      id: 'logistic_regression' as const,
    },
  ];

  const features = [
    { name: 'Nhịp tim tối đa (gắng sức)', value: 24.2, color: 'bg-red-600' },
    { name: 'Tuổi bệnh nhân', value: 18.5, color: 'bg-red-500' },
    { name: 'Cholesterol huyết thanh', value: 16.1, color: 'bg-red-400' },
    { name: 'Huyết áp tâm thu', value: 14.0, color: 'bg-red-400' },
    { name: 'Tình trạng hút thuốc', value: 11.8, color: 'bg-rose-300' },
    { name: 'Chỉ số khối cơ thể (BMI)', value: 9.8, color: 'bg-rose-300' },
    { name: 'Đau thắt ngực gắng sức', value: 5.6, color: 'bg-rose-200' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Cột danh sách mô hình */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="bg-red-50/40 border border-red-200/35 p-4 rounded-2xl flex items-start gap-3 shadow-sm shadow-red-100/5">
          <div className="bg-red-100 text-red-600 p-1.5 rounded-lg border border-red-200 shrink-0">
            <Cpu className="stroke-red-650" size={20} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-neutral-800">Kiến trúc Mô hình Phân loại</h4>
            <p className="text-xs text-neutral-500 mt-1 font-medium leading-relaxed">
              Hệ thống đã huấn luyện 3 bộ phân loại chính. Các đặc trưng lâm sàng đầu vào được chuẩn hóa (StandardScaler) và kiểm tra đa cộng tuyến trước khi đào tạo.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {models.map((model, idx) => {
            const isPrimary = model.color === 'red';
            const isSecondary = model.color === 'rose';
            
            const leftBg = isPrimary 
              ? 'bg-red-600 text-white' 
              : isSecondary 
              ? 'bg-red-50 text-red-900 border-r border-red-100/60' 
              : 'bg-neutral-50 text-neutral-800 border-r border-neutral-200/50';

            const badgeBg = isPrimary 
              ? 'bg-black/20 text-white' 
              : 'bg-red-100 text-red-700';

            return (
              <div 
                key={idx} 
                className="glass-panel border border-white/60 rounded-2xl shadow-md shadow-red-100/5 overflow-hidden flex flex-col sm:flex-row"
              >
                {/* Bên trái: Tên & Chỉ số */}
                <div className={`w-full sm:w-1/3 p-5 flex flex-col justify-between ${leftBg}`}>
                  <div>
                    <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full inline-block ${badgeBg}`}>
                      {model.type}
                    </span>
                    <h4 className="font-black text-base uppercase tracking-tight leading-tight mt-2">
                      {model.name}
                    </h4>
                  </div>
                  <div className="flex gap-4 mt-4 text-xs font-black uppercase">
                    <div>
                      <span className="block text-[8px] font-bold opacity-60">Độ chính xác</span>
                      <span>{model.accuracy}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold opacity-60">ROC AUC</span>
                      <span>{model.auc}</span>
                    </div>
                  </div>
                </div>

                {/* Bên phải: Mô tả chi tiết */}
                <div className="w-full sm:w-2/3 p-5 flex flex-col justify-between bg-white/20">
                  <p className="text-xs font-semibold text-neutral-500 leading-relaxed">
                    {model.desc}
                  </p>
                  <button 
                    onClick={() => {
                      setSelectedModel(model.id);
                      setParamsModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-[10px] font-black uppercase text-red-650 mt-4 cursor-pointer hover:text-red-700 transition-colors bg-transparent border-0 select-none self-start"
                  >
                    <span>Xem Siêu tham số (Hyperparameters)</span>
                    <ChevronRight size={12} className="stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cột mức độ quan trọng đặc trưng (SHAP Values) */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="glass-panel rounded-2xl border border-white/60 shadow-xl shadow-red-100/5 flex flex-col h-full overflow-hidden">
          <div className="border-b border-neutral-200/40 px-5 py-3.5 font-bold uppercase tracking-wider text-xs bg-white/35 text-neutral-800 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-500 rounded-full inline-block shrink-0" />
            Tỷ lệ Trọng số Đặc trưng (XGBoost SHAP)
          </div>
          <div className="p-5 flex-1 flex flex-col justify-between gap-5 bg-white/10">
            <p className="text-xs font-semibold text-neutral-500 leading-relaxed mb-1">
              Chỉ số SHAP (SHapley Additive exPlanations) thể hiện đóng góp có trọng số của mỗi yếu tố sinh học vào kết quả phân tích nguy cơ cuối cùng.
            </p>

            <div className="flex flex-col gap-4 flex-1 justify-center">
              {features.map((feat, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    <span>{feat.name}</span>
                    <span className="text-neutral-800 font-extrabold">{feat.value}%</span>
                  </div>
                  <div className="border border-neutral-200/40 h-3 bg-white/60 rounded-full relative overflow-hidden shadow-inner">
                    <div 
                      className={`h-full rounded-full ${feat.color}`} 
                      style={{ width: `${feat.value * 3.5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200/40 border-dashed pt-4 flex gap-3 text-[10px] font-bold uppercase text-neutral-400">
              <CheckCircle2 size={14} className="stroke-[2.5] text-red-500 shrink-0 mt-0.5" />
              <span>Đã kiểm nghiệm chéo 5 lần (5-fold cross-validation) để tăng độ ổn định.</span>
            </div>
          </div>
        </div>
      </div>
      <HyperparamsModal
        isOpen={paramsModalOpen}
        onClose={() => setParamsModalOpen(false)}
        modelType={selectedModel}
      />
    </div>
  );
};
