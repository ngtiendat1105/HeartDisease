import React, { useEffect } from 'react';
import { X, Cpu } from 'lucide-react';

interface HyperparamsModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelType: 'xgboost' | 'random_forest' | 'logistic_regression' | null;
}

const PARAM_DATA = {
  xgboost: {
    title: 'XGBoost Ensemble',
    params: [
      { name: 'n_estimators', value: '300', desc: 'Số lượng cây quyết định' },
      { name: 'learning_rate', value: '0.05', desc: 'Tốc độ học, kiểm soát quá khớp' },
      { name: 'max_depth', value: '6', desc: 'Độ sâu tối đa của một cây' },
      { name: 'subsample', value: '0.8', desc: 'Tỷ lệ lấy mẫu dữ liệu hàng' },
      { name: 'colsample_bytree', value: '0.8', desc: 'Tỷ lệ lấy mẫu số cột đặc trưng' },
    ]
  },
  random_forest: {
    title: 'Random Forest',
    params: [
      { name: 'n_estimators', value: '500', desc: 'Số cây trong rừng quyết định' },
      { name: 'max_depth', value: '12', desc: 'Giới hạn độ sâu để tránh nhiễu' },
      { name: 'min_samples_split', value: '5', desc: 'Mẫu tối thiểu để phân nhánh' },
      { name: 'criterion', value: "'gini'", desc: 'Hàm đo lường chất lượng phân tách' },
    ]
  },
  logistic_regression: {
    title: 'Logistic Regression',
    params: [
      { name: 'penalty', value: "'l2'", desc: 'Chính quy hóa Ridge để thu nhỏ trọng số nhiễu' },
      { name: 'C', value: '1.0', desc: 'Hệ số nghịch đảo cường độ chính quy hóa' },
      { name: 'solver', value: "'lbfgs'", desc: 'Thuật toán tối ưu hóa bậc hai giúp hội tụ nhanh' },
    ]
  }
};

export function HyperparamsModal({ isOpen, onClose, modelType }: HyperparamsModalProps) {
  // Ngăn cuộn trang phía sau khi modal đang hiển thị
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !modelType) return null;

  const data = PARAM_DATA[modelType];
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Lớp nền mờ phía sau Overlay */}
      <div 
        className="absolute inset-0 backdrop-blur-lg bg-black/20 transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Hộp thoại Modal Container */}
      <div className="bg-white/85 backdrop-blur-md border border-white/60 shadow-2xl rounded-2xl p-6 max-w-md w-full shadow-red-500/10 relative z-10 transform transition-all duration-300 scale-100 flex flex-col gap-5 animate-scale-up">
        
        {/* Tiêu đề Header */}
        <div className="flex justify-between items-center border-b border-neutral-200/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-red-500/10 border border-red-500/20 text-red-650 p-2 rounded-xl flex items-center justify-center">
              <Cpu size={18} className="text-red-600 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-black tracking-wider text-neutral-400 block">Siêu tham số</span>
              <h3 className="font-black text-sm uppercase text-neutral-800 leading-none mt-0.5">{data.title}</h3>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-neutral-400 hover:text-red-650 p-1.5 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
          >
            <X size={18} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Nội dung danh sách Siêu tham số */}
        <div className="flex flex-col gap-4 py-2">
          {data.params.map((p, idx) => (
            <div key={idx} className="flex justify-between items-start border-b border-neutral-200/10 pb-3 last:border-0 last:pb-0">
              <div className="flex flex-col gap-0.5 max-w-[70%]">
                <span className="font-mono text-xs font-bold text-neutral-800">{p.name}</span>
                <span className="text-[10px] text-neutral-400 font-semibold leading-relaxed">{p.desc}</span>
              </div>
              <div className="font-mono text-xs font-black text-red-650 bg-red-500/5 border border-red-500/10 px-2 py-0.5 rounded-lg shrink-0">
                {p.value}
              </div>
            </div>
          ))}
        </div>

        {/* Nút đóng chân Modal */}
        <div className="pt-2 border-t border-neutral-200/40">
          <button
            onClick={onClose}
            className="w-full bg-red-600 text-white font-extrabold uppercase text-[10px] tracking-wider py-2.5 rounded-xl border border-red-500/20 shadow-md shadow-red-500/15 hover:shadow-lg hover:shadow-red-500/25 transition-all cursor-pointer text-center"
          >
            Đóng cấu hình
          </button>
        </div>
      </div>
    </div>
  );
}
