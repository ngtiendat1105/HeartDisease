import React from 'react';
import { AlertTriangle, ShieldCheck, HeartPulse, RefreshCw } from 'lucide-react';
import { CustomButton } from './CustomButton';

interface ResultAlertProps {
  riskLevel: 'Low' | 'Medium' | 'High';
  score: number;
  onReset: () => void;
  recommendations: string[];
}

export const ResultAlert: React.FC<ResultAlertProps> = ({
  riskLevel,
  score,
  onReset,
  recommendations,
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
        <div className="flex justify-end pt-4 border-t border-neutral-200/30 border-dashed mt-2">
          <CustomButton variant="red" onClick={onReset} className="gap-2 shadow-sm">
            <RefreshCw size={14} className="stroke-[2.5]" />
            Thực hiện Chẩn đoán Khác
          </CustomButton>
        </div>
      </div>
    </div>
  );
};
