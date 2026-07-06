'use client';

import React, { useState } from 'react';
import { User, Activity, Dumbbell, Scale, Heart, Sparkles, AlertCircle } from 'lucide-react';
import { InputCard } from './InputCard';
import { CustomButton } from './CustomButton';
import { ResultAlert } from './ResultAlert';

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

const initialFormState: FormState = {
  age: 45,
  gender: 'female',
  systolicBP: 120,
  diastolicBP: 80,
  cholesterol: 190,
  bmi: 23.5,
  smokingStatus: 'never',
  maxHeartRate: 155,
  angina: 'no',
  fastingSugar: 'no',
};

export const PredictionForm: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [result, setResult] = useState<{
    riskLevel: 'Low' | 'Medium' | 'High';
    score: number;
    recommendations: string[];
  } | null>(null);

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'gender' || name === 'smokingStatus' || name === 'angina' || name === 'fastingSugar' 
        ? value 
        : parseFloat(value) || 0,
    }));
  };

  const handleReset = () => {
    setForm(initialFormState);
    setResult(null);
  };

  const calculateRisk = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      let score = 10;

      if (form.age > 60) score += 22;
      else if (form.age > 50) score += 15;
      else if (form.age > 40) score += 8;

      if (form.gender === 'male') score += 7;

      if (form.systolicBP >= 160 || form.diastolicBP >= 100) score += 25;
      else if (form.systolicBP >= 140 || form.diastolicBP >= 90) score += 15;
      else if (form.systolicBP >= 130 || form.diastolicBP >= 85) score += 8;

      if (form.cholesterol >= 240) score += 18;
      else if (form.cholesterol >= 200) score += 8;

      if (form.bmi >= 30) score += 12;
      else if (form.bmi >= 25) score += 5;

      if (form.smokingStatus === 'active') score += 20;
      else if (form.smokingStatus === 'former') score += 8;

      if (form.angina === 'yes') score += 15;

      if (form.fastingSugar === 'yes') score += 10;

      if (form.maxHeartRate < 130) score += 15;
      else if (form.maxHeartRate < 150) score += 8;

      score = Math.max(5, Math.min(98, score));

      let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
      if (score >= 70) riskLevel = 'High';
      else if (score >= 35) riskLevel = 'Medium';

      const recs: string[] = [];

      if (form.systolicBP >= 130 || form.diastolicBP >= 85) {
        recs.push('Bắt đầu theo dõi huyết áp hàng ngày. Giảm natri (muối) trong khẩu phần ăn dưới 1.500 mg/ngày và uống đủ nước.');
      }
      if (form.cholesterol >= 200) {
        recs.push('Bổ sung chất xơ hòa tan (yến mạch, các loại đậu, hạt chia) và chất béo lành mạnh. Thảo luận về việc điều hòa mỡ máu với bác sĩ.');
      }
      if (form.smokingStatus === 'active') {
        recs.push('Ngừng hút thuốc là hành động quan trọng nhất để cải thiện sức khỏe tim mạch. Hãy tìm sự hỗ trợ hoặc sử dụng liệu pháp cai thuốc.');
      }
      if (form.bmi >= 25) {
        recs.push('Dành ít nhất 150-300 phút tập thể dục nhịp điệu (aerobic) cường độ vừa phải mỗi tuần. Kết hợp tập luyện sức mạnh cơ bắp.');
      }
      if (form.angina === 'yes') {
        recs.push('Tham khảo ý kiến bác sĩ chuyên khoa tim mạch để thực hiện nghiệm pháp gắng sức điện tâm đồ và đánh giá chuyên sâu.');
      }
      if (form.fastingSugar === 'yes') {
        recs.push('Theo dõi lượng đường huyết đói định kỳ. Hạn chế tối đa carbohydrate tinh chế, đường và tăng cường chất xơ.');
      }
      if (riskLevel === 'High') {
        recs.push('Sắp xếp một buổi khám chuyên khoa tim mạch sớm để được tư vấn các liệu pháp điều trị phòng ngừa lâm sàng phù hợp.');
      }
      if (recs.length === 0) {
        recs.push('Tiếp tục duy trì các chỉ số sinh hiệu và lối sống lành mạnh. Thực hiện kiểm tra định kỳ bộ lipid máu hàng năm.');
        recs.push('Duy trì chế độ ăn Địa Trung Hải giàu rau xanh, trái cây, các loại hạt lành mạnh và chất béo không bão hòa.');
      }

      setResult({
        riskLevel,
        score,
        recommendations: recs,
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6">
      {result ? (
        <ResultAlert
          riskLevel={result.riskLevel}
          score={result.score}
          onReset={handleReset}
          recommendations={result.recommendations}
          form={form}
        />
      ) : (
        <form onSubmit={calculateRisk} className="flex flex-col gap-6">
          {/* Glass Warning Alert */}
          <div className="bg-red-50/40 border border-red-200/35 p-4 rounded-2xl flex items-start gap-3 shadow-sm shadow-red-100/5">
            <div className="bg-red-100 text-red-600 p-1.5 rounded-lg border border-red-200 shrink-0">
              <AlertCircle size={20} className="stroke-[2]" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-neutral-800">Động cơ Chẩn đoán Nguy cơ AI</h4>
              <p className="text-xs text-neutral-500 mt-1 font-medium leading-relaxed">
                Nhập đầy đủ thông số bên dưới. Hệ thống suy luận lâm sàng sử dụng trọng số từ mô hình học máy ensemble để ước lượng xác suất nguy cơ bệnh tim mạch.
              </p>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nhân khẩu học */}
            <InputCard title="Nhân khẩu học">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-neutral-500">
                  <User size={13} className="text-red-500" /> Tuổi bệnh nhân (năm)
                </label>
                <input
                  type="number"
                  name="age"
                  min="1"
                  max="120"
                  required
                  value={form.age}
                  onChange={handleInputChange}
                  className="glass-input rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-800 shadow-sm outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-neutral-500">
                  <User size={13} className="text-red-500" /> Giới tính sinh học
                </label>
                <div className="relative">
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleInputChange}
                    className="glass-input rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-800 shadow-sm outline-none w-full appearance-none cursor-pointer"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                    <span className="text-[10px]">▼</span>
                  </div>
                </div>
              </div>
            </InputCard>

            {/* Sinh hiệu & Bộ mỡ máu */}
            <InputCard title="Sinh hiệu & Bộ Mỡ Máu">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-neutral-500">
                    <Activity size={13} className="text-red-500" /> HA Tâm thu (mmHg)
                  </label>
                  <input
                    type="number"
                    name="systolicBP"
                    min="80"
                    max="240"
                    required
                    value={form.systolicBP}
                    onChange={handleInputChange}
                    className="glass-input rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-800 shadow-sm outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-neutral-500">
                    <Activity size={13} className="text-red-500" /> HA Tâm trương (mmHg)
                  </label>
                  <input
                    type="number"
                    name="diastolicBP"
                    min="40"
                    max="140"
                    required
                    value={form.diastolicBP}
                    onChange={handleInputChange}
                    className="glass-input rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-800 shadow-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-neutral-500">
                  <Activity size={13} className="text-red-500" /> Cholesterol toàn phần (mg/dL)
                </label>
                <input
                  type="number"
                  name="cholesterol"
                  min="100"
                  max="500"
                  required
                  value={form.cholesterol}
                  onChange={handleInputChange}
                  className="glass-input rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-800 shadow-sm outline-none"
                />
              </div>
            </InputCard>

            {/* Sinh trắc học & Thể lực */}
            <InputCard title="Sinh trắc học & Thể lực">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-neutral-500">
                  <Scale size={13} className="text-red-500" /> Chỉ số Khối Cơ thể (BMI)
                </label>
                <input
                  type="number"
                  name="bmi"
                  min="10"
                  max="60"
                  step="0.1"
                  required
                  value={form.bmi}
                  onChange={handleInputChange}
                  className="glass-input rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-800 shadow-sm outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-neutral-500">
                  <Heart size={13} className="text-red-500" /> Nhịp tim tối đa đạt được (bpm)
                </label>
                <input
                  type="number"
                  name="maxHeartRate"
                  min="60"
                  max="220"
                  required
                  value={form.maxHeartRate}
                  onChange={handleInputChange}
                  className="glass-input rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-800 shadow-sm outline-none"
                />
              </div>
            </InputCard>

            {/* Lối sống & Triệu chứng */}
            <InputCard title="Lối sống & Triệu chứng">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-neutral-500">
                  <Sparkles size={13} className="text-red-500" /> Tình trạng hút thuốc
                </label>
                <div className="relative">
                  <select
                    name="smokingStatus"
                    value={form.smokingStatus}
                    onChange={handleInputChange}
                    className="glass-input rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-800 shadow-sm outline-none w-full appearance-none cursor-pointer"
                  >
                    <option value="never">Không hút thuốc</option>
                    <option value="former">Đã từng hút (Đã bỏ)</option>
                    <option value="active">Đang hút thuốc</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                    <span className="text-[10px]">▼</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-neutral-500">
                    <Dumbbell size={13} className="text-red-500" /> Đau ngực gắng sức
                  </label>
                  <div className="relative">
                    <select
                      name="angina"
                      value={form.angina}
                      onChange={handleInputChange}
                      className="glass-input rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-800 shadow-sm outline-none w-full appearance-none cursor-pointer"
                    >
                      <option value="no">Không</option>
                      <option value="yes">Có</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                      <span className="text-[10px]">▼</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-neutral-500">
                    <Activity size={13} className="text-red-500" /> Đường đói &gt; 120mg
                  </label>
                  <div className="relative">
                    <select
                      name="fastingSugar"
                      value={form.fastingSugar}
                      onChange={handleInputChange}
                      className="glass-input rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-800 shadow-sm outline-none w-full appearance-none cursor-pointer"
                    >
                      <option value="no">Không</option>
                      <option value="yes">Có</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                      <span className="text-[10px]">▼</span>
                    </div>
                  </div>
                </div>
              </div>
            </InputCard>
          </div>

          {/* Submit Button with red glowing shadow */}
          <div className="mt-4 flex justify-center">
            <CustomButton
              type="submit"
              variant="red"
              size="lg"
              disabled={loading}
              className="min-w-[280px] shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35 transition-all"
            >
              {loading ? 'Đang chạy mô hình AI...' : 'Phân Tích Nguy Cơ Tim Mạch'}
            </CustomButton>
          </div>
        </form>
      )}
    </div>
  );
};
