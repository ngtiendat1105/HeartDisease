import React from 'react';
import { AlertTriangle, ShieldCheck, HeartPulse, RefreshCw, FileDown, Stethoscope } from 'lucide-react';
import { CustomButton } from './CustomButton';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface FormState {
  age: number;
  gender: 'male' | 'female';
  systolicBP: number;
  diastolicBP: number;
  cholesterol: number;
  bmi: number;
  smokingStatus: 'never' | 'former' | 'active';
  maxHeartRate: number;
  angina: 'yes' | 'no';
  fastingSugar: 'yes' | 'no';
}

interface ResultAlertProps {
  riskLevel: 'Low' | 'Medium' | 'High';
  score: number;
  onReset: () => void;
  recommendations: string[];
  form: FormState;
}

export const ResultAlert: React.FC<ResultAlertProps> = ({
  riskLevel,
  score,
  onReset,
  recommendations,
  form,
}) => {
  const colorMap = {
    Low: {
      bg: 'bg-emerald-500/8 border-emerald-500/15 text-emerald-950',
      badge: 'bg-emerald-600 text-white',
      iconBg: 'bg-emerald-100 text-emerald-600 border border-emerald-200',
      icon: ShieldCheck,
      title: 'Nguy cơ Thấp',
      desc: 'Chỉ số tim mạch ở mức an toàn. Hãy tiếp tục duy trì lối sống lành mạnh!',
    },
    Medium: {
      bg: 'bg-amber-500/8 border-amber-500/15 text-amber-950',
      badge: 'bg-amber-600 text-white',
      iconBg: 'bg-amber-100 text-amber-600 border border-amber-200',
      icon: HeartPulse,
      title: 'Nguy cơ Trung bình',
      desc: 'Xuất hiện các dấu hiệu cảnh báo vừa phải. Khuyến nghị điều chỉnh lối sống sớm.',
    },
    High: {
      bg: 'bg-red-500/8 border-red-500/20 text-red-950',
      badge: 'bg-red-600 text-white animate-medical-pulse shadow-md shadow-red-500/30',
      iconBg: 'bg-red-100 text-red-600 border border-red-200',
      icon: AlertTriangle,
      title: 'Nguy cơ Cao',
      desc: 'Chỉ số lâm sàng ở mức báo động đỏ. Vui lòng khám bác sĩ tim mạch chuyên khoa ngay lập tức.',
    },
  };

  const current = colorMap[riskLevel];
  const IconComponent = current.icon;

  const exportToPDF = async () => {
    const element = document.getElementById('medical-report-pdf-form');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('Bao_Cao_Suc_Khoe_HeartDisease.pdf');
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
      alert('Không thể xuất báo cáo PDF. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className={`glass-panel border border-white/60 rounded-2xl shadow-xl shadow-red-100/10 overflow-hidden flex flex-col`}>
      {/* Alert Header */}
      <div className={`border-b border-neutral-200/30 p-6 flex flex-col md:flex-row items-center gap-4 ${current.bg}`}>
        <div className={`p-3 rounded-xl ${current.iconBg}`}>
          <IconComponent size={32} className="stroke-[2]" />
        </div>
        <div className="text-center md:text-left flex-1">
          <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-900">
            {current.title}
          </h3>
          <p className="font-semibold text-xs text-neutral-500 mt-1">
            {current.desc}
          </p>
        </div>
        <div className={`shrink-0 px-4 py-2 border border-white/20 rounded-xl font-black text-xl shadow-sm ${current.badge}`}>
          {score}% <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Điểm</span>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6 bg-white/20">
        {/* Progress Gauge */}
        <div>
          <h4 className="text-sm font-black uppercase tracking-wider text-neutral-700 mb-3 flex items-center gap-2">
            <span className="w-1 h-3 bg-red-500 rounded-full inline-block" />
            Chi tiết Điểm số Nguy cơ
          </h4>
          <div className="border border-neutral-200/50 h-6 bg-white/60 rounded-full overflow-hidden relative shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-rose-600 transition-all duration-700 rounded-full"
              style={{ width: `${score}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center font-bold text-xs text-neutral-800">
              {score} / 100
            </span>
          </div>
        </div>

        {/* Clinical Suggestions */}
        <div>
          <h4 className="text-sm font-black uppercase tracking-wider text-neutral-700 mb-3 flex items-center gap-2">
            <span className="w-1 h-3 bg-red-500 rounded-full inline-block" />
            Khuyến nghị Lâm sàng Cá nhân hóa
          </h4>
          <ul className="flex flex-col gap-3">
            {recommendations.map((rec, index) => (
              <li
                key={index}
                className="flex items-start gap-3 bg-white/45 p-3.5 rounded-xl border border-white/80 font-medium text-xs text-neutral-600 shadow-sm"
              >
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 w-5.5 h-5.5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-neutral-200/30 border-dashed mt-2">
          <button
            type="button"
            onClick={exportToPDF}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30 font-medium px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm text-xs cursor-pointer select-none"
          >
            <FileDown size={14} className="stroke-[2.5]" /> Xuất Báo Cáo Sức Khỏe (PDF)
          </button>

          <CustomButton variant="red" onClick={onReset} className="gap-2 shadow-sm">
            <RefreshCw size={14} className="stroke-[2.5]" />
            Thực hiện Chẩn đoán Khác
          </CustomButton>
        </div>
      </div>

      {/* Vùng ẩn phục vụ việc xuất báo cáo Y khoa PDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div
          id="medical-report-pdf-form"
          className="bg-white text-black p-12 w-[794px] min-h-[1123px] flex flex-col justify-between"
          style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
        >
          {/* Header */}
          <div>
            <div className="flex justify-between items-center border-b-2 border-red-650 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="bg-red-600 text-white p-2 rounded-xl flex items-center justify-center">
                  <Stethoscope size={24} className="stroke-[2.5]" />
                </div>
                <div>
                  <h1 className="font-extrabold text-xl uppercase tracking-tight text-neutral-900 leading-none">
                    HEARTDISEASE <span className="text-red-600">AI</span>
                  </h1>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                    Hỗ trợ quyết định lâm sàng
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Mã báo cáo: HD-{Math.floor(100000 + Math.random() * 900000)}</p>
                <p className="text-[10px] font-bold text-neutral-500 mt-1">Ngày lập: {new Date().toLocaleString('vi-VN')}</p>
              </div>
            </div>

            {/* Title */}
            <div className="text-center my-6">
              <h2 className="text-xl font-black uppercase text-red-600 tracking-wide">
                BÁO CÁO PHÂN TÍCH NGUY CƠ TIM MẠCH - CARDIOAI
              </h2>
              <div className="w-16 h-1 bg-red-500 mx-auto mt-2 rounded-full" />
            </div>

            {/* Section 1: Thông tin chỉ số lâm sàng */}
            <div className="mb-6">
              <h3 className="text-xs font-extrabold uppercase text-neutral-800 border-l-4 border-red-500 pl-2 mb-3 tracking-wider">
                1. Thông số lâm sàng & Lối sống
              </h3>
              <table className="w-full border-collapse border border-neutral-200 text-xs">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-700 font-extrabold">
                    <th className="border border-neutral-200 p-2.5 text-left w-1/2">Chỉ số sinh học / Lối sống</th>
                    <th className="border border-neutral-200 p-2.5 text-left w-1/2">Giá trị ghi nhận</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-600 font-semibold">
                  <tr>
                    <td className="border border-neutral-200 p-2.5">Giới tính</td>
                    <td className="border border-neutral-200 p-2.5">{form.gender === 'male' ? 'Nam' : 'Nữ'}</td>
                  </tr>
                  <tr className="bg-neutral-50/50">
                    <td className="border border-neutral-200 p-2.5">Tuổi bệnh nhân</td>
                    <td className="border border-neutral-200 p-2.5">{form.age} tuổi</td>
                  </tr>
                  <tr>
                    <td className="border border-neutral-200 p-2.5">Chỉ số khối cơ thể (BMI)</td>
                    <td className="border border-neutral-200 p-2.5">{form.bmi}</td>
                  </tr>
                  <tr className="bg-neutral-50/50">
                    <td className="border border-neutral-200 p-2.5">Huyết áp đo được</td>
                    <td className="border border-neutral-200 p-2.5">
                      {form.systolicBP}/{form.diastolicBP} mmHg ({form.systolicBP >= 130 || form.diastolicBP >= 85 ? 'Huyết áp cao' : 'Bình thường'})
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-neutral-200 p-2.5">Cholesterol toàn phần</td>
                    <td className="border border-neutral-200 p-2.5">
                      {form.cholesterol} mg/dL ({form.cholesterol >= 200 ? 'Cholesterol cao' : 'Bình thường'})
                    </td>
                  </tr>
                  <tr className="bg-neutral-50/50">
                    <td className="border border-neutral-200 p-2.5">Nhịp tim tối đa</td>
                    <td className="border border-neutral-200 p-2.5">{form.maxHeartRate} bpm</td>
                  </tr>
                  <tr>
                    <td className="border border-neutral-200 p-2.5">Tình trạng hút thuốc</td>
                    <td className="border border-neutral-200 p-2.5">
                      {form.smokingStatus === 'active' && 'Đang hút thuốc'}
                      {form.smokingStatus === 'former' && 'Đã bỏ thuốc'}
                      {form.smokingStatus === 'never' && 'Không hút thuốc'}
                    </td>
                  </tr>
                  <tr className="bg-neutral-50/50">
                    <td className="border border-neutral-200 p-2.5">Đau ngực gắng sức / Đường đói &gt; 120mg</td>
                    <td className="border border-neutral-200 p-2.5">
                      Đau ngực: {form.angina === 'yes' ? 'Có' : 'Không'} | Đường đói cao: {form.fastingSugar === 'yes' ? 'Có' : 'Không'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 2: Đánh giá nguy cơ từ AI */}
            <div className="mb-6">
              <h3 className="text-xs font-extrabold uppercase text-neutral-800 border-l-4 border-red-500 pl-2 mb-3 tracking-wider">
                2. Kết quả phân tích nguy cơ (Machine Learning)
              </h3>
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">Thuật toán chẩn đoán</p>
                  <p className="text-xs font-extrabold text-neutral-800 mt-0.5">XGBoost Ensemble Model</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">Xác suất nguy cơ</p>
                  <p className="text-sm font-black text-red-650 mt-0.5">{score}%</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">Mức độ nguy cơ</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase text-white mt-1 ${
                    riskLevel === 'High' ? 'bg-red-600' :
                    riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}>
                    {riskLevel === 'High' ? 'Cao' : riskLevel === 'Medium' ? 'Trung bình' : 'Thấp'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Khuyến nghị y khoa */}
            {recommendations && (
              <div className="mb-6">
                <h3 className="text-xs font-extrabold uppercase text-neutral-800 border-l-4 border-red-500 pl-2 mb-3 tracking-wider">
                  3. Khuyến nghị phòng ngừa & Điều chỉnh lối sống
                </h3>
                <div className="flex flex-col gap-2">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="flex gap-2.5 bg-neutral-50/50 p-3 rounded-lg border border-neutral-100 text-xs font-semibold text-neutral-700">
                      <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-650 flex items-center justify-center text-[10px] font-black shrink-0">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed flex-1">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-200 pt-4 mt-6">
            <p className="text-[9px] text-neutral-400 leading-relaxed font-bold uppercase text-center max-w-xl mx-auto">
              Lưu ý an toàn: Báo cáo này được lập tự động bởi hệ thống AI hỗ trợ quyết định lâm sàng HeartDisease. 
              Mọi kết quả mang tính chất tham khảo học thuật, hoàn toàn không thay thế cho các chỉ định lâm sàng hoặc chẩn đoán điều trị chuyên môn của bác sĩ chuyên khoa tim mạch.
            </p>
            <p className="text-[8px] text-neutral-400 font-medium text-center mt-2.5 uppercase">
              © 2026 HEARTDISEASEAI. BẢN QUYỀN ĐÃ ĐƯỢC BẢO HỘ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
