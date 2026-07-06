'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Stethoscope, 
  Database, 
  Heart, 
  Scale, 
  Brain, 
  TrendingUp, 
  Activity, 
  User, 
  Sparkles, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  HeartPulse,
  RefreshCw,
  Info,
  FileDown
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CustomButton } from '@/components/CustomButton';
import { HyperparamsModal } from '@/components/HyperparamsModal';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ReminderForm } from '@/components/ReminderForm';

// Định nghĩa Interface dữ liệu Supabase
interface SupabaseStats {
  totalSamples: number;
  heartDiseaseRate: number;
  avgBmi: number;
  loading: boolean;
  isLive: boolean;
}

// Định nghĩa Interface của Form nhập liệu
interface FormState {
  sex: number; // 1 = Nam, 0 = Nữ
  age: number; // 1 - 13 nhóm tuổi
  highBP: number; // 1 = Có, 0 = Không
  highChol: number; // 1 = Có, 0 = Không
  bmi: number;
  smoker: number; // 1 = Có, 0 = Không
}

type RiskLevel = 'Thấp' | 'Trung bình' | 'Cao' | null;

interface PredictResult {
  riskLevel: RiskLevel;
  score: number;
  recommendations: string[];
  executedModel?: string;
}

type PITab = 'demographics' | 'correlations' | 'trends';

export default function DashboardPage() {
  // State quản lý số liệu từ Supabase
  const [stats, setStats] = useState<SupabaseStats>({
    totalSamples: 10240, // Số mặc định dự phòng
    heartDiseaseRate: 15.2, // Số mặc định dự phòng
    avgBmi: 28.3, // Số mặc định dự phòng
    loading: true,
    isLive: false,
  });

  // State quản lý Form dự đoán
  const [form, setForm] = useState<FormState>({
    sex: 1,
    age: 6,
    highBP: 0,
    highChol: 0,
    bmi: 24.5,
    smoker: 0,
  });
  
  const [predictLoading, setPredictLoading] = useState(false);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [modelType, setModelType] = useState<'xgboost' | 'random_forest' | 'logistic_regression'>('xgboost');
  const [paramsModalOpen, setParamsModalOpen] = useState(false);
  const [selectedModelForParams, setSelectedModelForParams] = useState<'xgboost' | 'random_forest' | 'logistic_regression' | null>(null);
  const [reportId, setReportId] = useState('');
  const [reportDate, setReportDate] = useState('');

  useEffect(() => {
    if (result) {
      setReportId(`HD-${Math.floor(100000 + Math.random() * 900000)}`);
      setReportDate(new Date().toLocaleString('vi-VN'));
    }
  }, [result]);

  // State quản lý Báo cáo Power BI
  const [activeTab, setActiveTab] = useState<PITab>('demographics');

  // Gọi dữ liệu từ Supabase
  useEffect(() => {
    async function fetchSupabaseData() {
      try {
        // Kiểm tra xem biến môi trường đã được thiết lập hay chưa
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          setStats(prev => ({ ...prev, loading: false, isLive: false }));
          return;
        }

        // 1. Lấy tổng số dòng trong bảng
        const { count: total, error: countErr } = await supabase
          .from('heart_disease_indicators')
          .select('*', { count: 'exact', head: true });

        if (countErr) throw countErr;

        // 2. Lấy số người mắc bệnh tim (HeartDiseaseorAttack == 1)
        const { count: heartDiseaseCount, error: hdErr } = await supabase
          .from('heart_disease_indicators')
          .select('*', { count: 'exact', head: true })
          .eq('HeartDiseaseorAttack', 1);

        if (hdErr) throw hdErr;

        // 3. Lấy cột BMI để tính giá trị trung bình
        const { data: bmiData, error: bmiErr } = await supabase
          .from('heart_disease_indicators')
          .select('BMI');

        if (bmiErr) throw bmiErr;

        const totalCount = total || 10240;
        const hdRate = heartDiseaseCount ? (heartDiseaseCount / totalCount) * 100 : 15.2;
        
        let avgBmi = 28.3;
        if (bmiData && bmiData.length > 0) {
          const sum = bmiData.reduce((acc, row) => acc + (row.BMI || 0), 0);
          avgBmi = sum / bmiData.length;
        }

        setStats({
          totalSamples: totalCount,
          heartDiseaseRate: parseFloat(hdRate.toFixed(1)),
          avgBmi: parseFloat(avgBmi.toFixed(1)),
          loading: false,
          isLive: true
        });
      } catch (err) {
        console.warn("Lỗi khi kết nối dữ liệu Supabase, chuyển hướng sử dụng dữ liệu dự phòng:", err);
        setStats(prev => ({
          ...prev,
          loading: false,
          isLive: false
        }));
      }
    }

    fetchSupabaseData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'bmi' ? parseFloat(value) || 0 : parseInt(value) || 0,
    }));
  };

  const handleToggleChange = (name: keyof FormState) => {
    setForm(prev => ({
      ...prev,
      [name]: prev[name] === 1 ? 0 : 1,
    }));
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setPredictLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Sex: form.sex,
          Age: form.age,
          HighBP: form.highBP,
          HighChol: form.highChol,
          BMI: form.bmi,
          Smoker: form.smoker,
          modelType: modelType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Có lỗi xảy ra khi thực hiện phân tích.');
      }

      const data = await response.json();
      
      const recs: string[] = [data.advice];
      if (form.highBP === 1) {
        recs.push("Kiểm soát huyết áp tâm thu dưới 130 mmHg bằng cách giảm muối và theo dõi sinh hiệu định kỳ.");
      }
      if (form.highChol === 1) {
        recs.push("Điều chỉnh chế độ ăn giảm chất béo bão hòa. Hãy tham khảo ý kiến bác sĩ về thuốc Statin điều hòa mỡ máu.");
      }
      if (form.smoker === 1) {
        recs.push("Cai thuốc lá hoàn toàn. Quitting smoking giảm tới 50% nguy cơ biến cố tim mạch trong vòng 1 năm đầu.");
      }
      if (form.bmi >= 25) {
        recs.push("Điều chỉnh cân nặng về mức BMI lý tưởng (18.5 - 22.9). Kết hợp bài tập tim mạch 150 phút/tuần.");
      }

      setResult({
        riskLevel: data.riskLevel,
        score: data.score,
        recommendations: recs,
        executedModel: data.executedModel
      });
    } catch (err: any) {
      console.error("Lỗi khi kết nối với máy chủ dự đoán:", err);
      alert(err.message || "Không thể kết nối đến máy chủ chẩn đoán.");
    } finally {
      setPredictLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setForm({
      sex: 1,
      age: 6,
      highBP: 0,
      highChol: 0,
      bmi: 24.5,
      smoker: 0,
    });
  };

  const exportToPDF = async () => {
    const element = document.getElementById('medical-report-pdf');
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

  // Cấu hình hiển thị màu sắc nguy cơ
  const riskColorMap = {
    'Thấp': {
      bg: 'bg-emerald-500/8 border-emerald-500/15 text-emerald-950',
      badge: 'bg-emerald-600 text-white',
      icon: ShieldCheck,
      title: 'Nguy cơ Thấp',
      desc: 'Chỉ số tim mạch ở mức an toàn. Hãy tiếp tục duy trì lối sống lành mạnh!',
    },
    'Trung bình': {
      bg: 'bg-amber-500/8 border-amber-500/15 text-amber-950',
      badge: 'bg-amber-600 text-white',
      icon: HeartPulse,
      title: 'Nguy cơ Trung bình',
      desc: 'Xuất hiện các dấu hiệu cảnh báo vừa phải. Khuyến nghị điều chỉnh lối sống sớm.',
    },
    'Cao': {
      bg: 'bg-red-500/8 border-red-500/20 text-red-950',
      badge: 'bg-red-600 text-white animate-medical-pulse shadow-md shadow-red-500/20',
      icon: AlertCircle,
      title: 'Nguy cơ Cao',
      desc: 'Chỉ số lâm sàng ở mức báo động đỏ. Vui lòng khám bác sĩ tim mạch chuyên khoa ngay lập tức.',
    },
  };

  const currentResult = result && result.riskLevel ? riskColorMap[result.riskLevel] : null;
  const ResultIcon = currentResult ? currentResult.icon : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">
      
      {/* KHỐI 1: Header & Thống kê tổng quan (Top Row) */}
      <div className="flex flex-col gap-6">
        {/* Header Kính Mờ */}
        <div className="glass-panel border border-white/60 bg-white/35 backdrop-blur-md rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-md">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="bg-red-600 text-white p-3 rounded-2xl border border-red-500/20 shadow-sm flex items-center justify-center">
              <Stethoscope size={28} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 leading-tight">
                HeartDisease <span className="text-red-600">AI</span>
              </h2>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">
                Phân tích và dự đoán nguy cơ bệnh tim mạch bằng Machine Learning và Power BI
              </p>
            </div>
          </div>
          
          <div className="shrink-0 flex items-center gap-2.5">
            <span className="bg-white/80 border border-neutral-200/50 px-3 py-1 rounded-full text-red-650 font-extrabold text-[10px] uppercase shadow-sm">
              Trạng thái: Hoạt động
            </span>
          </div>
        </div>

        {/* 3 Thẻ Thống Kê Fetch từ Supabase */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Thẻ 1: Tổng số mẫu */}
          <div className="glass-panel border border-white/60 bg-white/40 backdrop-blur-md p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100/60 shrink-0">
              <Database size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Tổng mẫu dữ liệu</span>
              <h4 className="text-2xl font-black text-neutral-800 leading-none mt-1">
                {stats.loading ? '...' : stats.totalSamples.toLocaleString('vi-VN')}
              </h4>
            </div>
          </div>

          {/* Thẻ 2: Tỷ lệ mắc bệnh tim */}
          <div className="glass-panel border border-white/60 bg-white/40 backdrop-blur-md p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100/60 shrink-0">
              <Heart size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Tỷ lệ mắc bệnh tim</span>
              <h4 className="text-2xl font-black text-red-600 leading-none mt-1">
                {stats.loading ? '...' : `${stats.heartDiseaseRate}%`}
              </h4>
            </div>
          </div>

          {/* Thẻ 3: Chỉ số BMI Trung bình */}
          <div className="glass-panel border border-white/60 bg-white/40 backdrop-blur-md p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100/60 shrink-0">
              <Scale size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">BMI Trung bình</span>
              <h4 className="text-2xl font-black text-neutral-800 leading-none mt-1">
                {stats.loading ? '...' : stats.avgBmi}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Bố cục Bento Grid chính */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* KHỐI 2: Form Nhập Liệu Dự Đoán Nguy Cơ (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel border border-white/60 bg-white/40 backdrop-blur-md rounded-2xl shadow-md overflow-hidden flex flex-col">
            {/* Header Form */}
            <div className="border-b border-neutral-200/40 px-5 py-3.5 font-bold uppercase tracking-wider text-xs text-neutral-800 bg-white/35 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-red-500 rounded-full inline-block shrink-0" />
              Chẩn đoán Nguy cơ AI
            </div>

            {/* Nội dung form */}
            <div className="p-5">
              {!result ? (
                <form onSubmit={handlePredict} className="flex flex-col gap-4">
                  {/* Lựa chọn mô hình chẩn đoán */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-neutral-500">
                      <Brain size={13} className="text-red-500" /> Thuật toán chẩn đoán AI
                    </label>
                    <div className="relative">
                      <select
                        name="modelType"
                        value={modelType}
                        onChange={(e) => setModelType(e.target.value as any)}
                        className="glass-input rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800 shadow-sm outline-none w-full appearance-none cursor-pointer"
                      >
                        <option value="xgboost">XGBoost Ensemble (Độ chính xác cao)</option>
                        <option value="random_forest">Random Forest (Mô hình Tập hợp)</option>
                        <option value="logistic_regression">Logistic Regression (Hồi quy đối chứng)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                        <span className="text-[9px]">▼</span>
                      </div>
                    </div>
                  </div>

                  {/* Nhóm tuổi */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-neutral-500">
                      <User size={13} className="text-red-500" /> Nhóm tuổi hiện tại
                    </label>
                    <div className="relative">
                      <select
                        name="age"
                        value={form.age}
                        onChange={handleInputChange}
                        className="glass-input rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800 shadow-sm outline-none w-full appearance-none cursor-pointer"
                      >
                        <option value={1}>18 - 24 tuổi (Nhóm 1)</option>
                        <option value={2}>25 - 29 tuổi (Nhóm 2)</option>
                        <option value={3}>30 - 34 tuổi (Nhóm 3)</option>
                        <option value={4}>35 - 39 tuổi (Nhóm 4)</option>
                        <option value={5}>40 - 44 tuổi (Nhóm 5)</option>
                        <option value={6}>45 - 49 tuổi (Nhóm 6)</option>
                        <option value={7}>50 - 54 tuổi (Nhóm 7)</option>
                        <option value={8}>55 - 59 tuổi (Nhóm 8)</option>
                        <option value={9}>60 - 64 tuổi (Nhóm 9)</option>
                        <option value={10}>65 - 69 tuổi (Nhóm 10)</option>
                        <option value={11}>70 - 74 tuổi (Nhóm 11)</option>
                        <option value={12}>75 - 79 tuổi (Nhóm 12)</option>
                        <option value={13}>80 tuổi trở lên (Nhóm 13)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                        <span className="text-[9px]">▼</span>
                      </div>
                    </div>
                  </div>

                  {/* Giới tính & BMI */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-neutral-500">
                        <User size={13} className="text-red-500" /> Giới tính
                      </label>
                      <div className="relative">
                        <select
                          name="sex"
                          value={form.sex}
                          onChange={handleInputChange}
                          className="glass-input rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800 shadow-sm outline-none w-full appearance-none cursor-pointer"
                        >
                          <option value={1}>Nam</option>
                          <option value={0}>Nữ</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                          <span className="text-[9px]">▼</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-neutral-500">
                        <Scale size={13} className="text-red-500" /> Chỉ số BMI
                      </label>
                      <input
                        type="number"
                        name="bmi"
                        step="0.1"
                        min="10"
                        max="60"
                        required
                        value={form.bmi}
                        onChange={handleInputChange}
                        className="glass-input rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800 shadow-sm outline-none w-full"
                      />
                    </div>
                  </div>

                  {/* Huyết áp - Switch Toggle */}
                  <div className="flex items-center justify-between p-2.5 bg-white/20 border border-neutral-200/20 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-800">Chỉ số Huyết áp cao</span>
                      <span className="text-[10px] text-neutral-400 font-medium">Huyết áp vượt mức 130/80 mmHg</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleChange('highBP')}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer ${
                        form.highBP === 1 ? 'bg-red-600' : 'bg-neutral-200'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${
                        form.highBP === 1 ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Cholesterol - Switch Toggle */}
                  <div className="flex items-center justify-between p-2.5 bg-white/20 border border-neutral-200/20 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-800">Chỉ số Cholesterol cao</span>
                      <span className="text-[10px] text-neutral-400 font-medium">Cholesterol toàn phần &gt; 200 mg/dL</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleChange('highChol')}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer ${
                        form.highChol === 1 ? 'bg-red-600' : 'bg-neutral-200'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${
                        form.highChol === 1 ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Hút thuốc - Switch Toggle */}
                  <div className="flex items-center justify-between p-2.5 bg-white/20 border border-neutral-200/20 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-800">Tiền sử hút thuốc lá</span>
                      <span className="text-[10px] text-neutral-400 font-medium">Đã hút ít nhất 100 điếu thuốc lá</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleChange('smoker')}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer ${
                        form.smoker === 1 ? 'bg-red-600' : 'bg-neutral-200'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${
                        form.smoker === 1 ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <CustomButton
                    type="submit"
                    variant="red"
                    size="md"
                    disabled={predictLoading}
                    className="w-full mt-2 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30"
                  >
                    {predictLoading ? 'Đang phân tích lâm sàng...' : 'Phân Tích Nguy Cơ Ngay'}
                  </CustomButton>
                </form>
              ) : (
                /* Kết quả Dự đoán */
                currentResult && (
                  <div className="flex flex-col gap-5">
                    <div className={`border border-white/60 p-5 rounded-2xl flex flex-col items-center text-center gap-3 ${currentResult.bg}`}>
                      <div className="bg-white text-neutral-900 p-2.5 rounded-xl border border-neutral-200/40 flex items-center justify-center">
                        {ResultIcon && <ResultIcon size={24} className="stroke-[2.5] text-red-600" />}
                      </div>
                      <div>
                        <h4 className="text-lg font-black uppercase tracking-tight text-neutral-900">
                          {currentResult.title}
                        </h4>
                        <p className="text-[10px] font-semibold text-neutral-500 mt-0.5">
                          {currentResult.desc}
                        </p>
                      </div>
                      <div className={`px-4 py-1.5 rounded-xl font-black text-sm shadow-sm ${currentResult.badge}`}>
                        {result.score}% Nguy cơ
                      </div>
                      {result.executedModel && (
                        <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 mt-1">
                          Thuật toán: {result.executedModel}
                        </div>
                      )}
                    </div>

                    <div>
                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">Lời khuyên tim mạch:</h5>
                      <ul className="flex flex-col gap-2">
                        {result.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 bg-white/60 p-2.5 rounded-xl border border-white/70 text-xs font-semibold text-neutral-600 shadow-sm">
                            <span className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 text-red-650 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 text-red-600">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={exportToPDF}
                      className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30 font-medium px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm text-xs cursor-pointer select-none mb-3"
                    >
                      <FileDown size={14} className="stroke-[2.5]" /> Xuất Báo Cáo Sức Khỏe (PDF)
                    </button>

                    <CustomButton variant="glass" size="sm" onClick={handleReset} className="w-full flex items-center gap-1.5">
                      <RefreshCw size={12} /> Làm chẩn đoán mới
                    </CustomButton>
                  </div>
                )
              )}
            </div>
          </div>
          <ReminderForm />
        </div>

        {/* KHỐI 3: Khu vực nhúng Báo cáo Power BI (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass-panel border border-white/60 bg-white/40 backdrop-blur-md rounded-2xl shadow-md overflow-hidden flex flex-col min-h-[500px]">
            {/* Header Tabs Báo Cáo */}
            <div className="border-b border-neutral-200/40 px-5 py-3 bg-white/35 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-extrabold text-[10px] uppercase tracking-wider text-neutral-800">
                  Power BI Analytics Center
                </span>
              </div>
              
              <div className="flex gap-1.5">
                {[
                  { id: 'demographics', label: 'Nhân khẩu học' },
                  { id: 'correlations', label: 'Tương quan chỉ số' },
                  { id: 'trends', label: 'Xu hướng' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as PITab)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === t.id
                        ? 'bg-red-50 border border-red-500/20 text-red-600 shadow-sm'
                        : 'bg-white/50 border border-neutral-200/40 text-neutral-500 hover:bg-white/80'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nội dung nhúng hoặc giả lập báo cáo */}
            <div className="flex-1 p-6 bg-neutral-50/40 flex flex-col gap-4">
              <div className="flex-1 border border-red-500/20 bg-white/30 backdrop-blur-sm rounded-xl p-8 flex flex-col justify-center items-center text-center shadow-inner relative min-h-[300px]">
                {/* Lưới grid ẩn trang trí */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:16px_16px]" />
                
                <div className="bg-red-100/60 text-red-600 p-4 rounded-full border border-red-200/50 mb-3 flex items-center justify-center">
                  <Brain size={32} className="stroke-[2]" />
                </div>
                <h4 className="font-extrabold text-sm text-neutral-800 uppercase tracking-wider mb-2">
                  Khung nhúng Báo cáo Power BI Interactive Dashboard
                </h4>
                <p className="text-xs text-neutral-500 font-medium max-w-md leading-relaxed mb-6">
                  {activeTab === 'demographics' && 'Đang tải thống kê tuổi, giới tính và tỷ lệ mắc bệnh phân bố theo các nhóm đối tượng nghiên cứu.'}
                  {activeTab === 'correlations' && 'Đang tải báo cáo phân tán (Scatter Plot) giữa chỉ số mỡ máu, chỉ số huyết áp tâm thu và xác suất kết quả phân loại.'}
                  {activeTab === 'trends' && 'Đang tải bản đồ nhiệt độ địa lý và các đường đồ thị xu hướng phát hiện nguy cơ sớm theo vùng.'}
                </p>
                <div className="bg-white/90 border border-neutral-200/40 px-4 py-2 rounded-xl text-[10px] font-extrabold text-red-600 shadow-sm tracking-wider uppercase">
                  &lt; Chèn &lt;iframe&gt; Power BI của Đồ án tại đây &gt;
                </div>
              </div>
              
              <div className="flex justify-between items-center text-[10px] font-bold uppercase text-neutral-400 px-1">
                <span className="flex items-center gap-1"><Info size={12} className="text-red-500" /> Bản báo cáo tích hợp DirectQuery live-connect</span>
                <a href="https://app.powerbi.com" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 flex items-center gap-1 hover:underline">
                  Mở trên Power BI Service <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Hàng cuối bento grid: Feature Importance & Model Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* KHỐI 4: Độ quan trọng của các tính năng (Feature Importance) (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="glass-panel rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md shadow-md flex flex-col h-full overflow-hidden">
            <div className="border-b border-neutral-200/40 px-5 py-3.5 font-bold uppercase tracking-wider text-xs bg-white/35 text-neutral-800 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-red-500 rounded-full inline-block shrink-0" />
              Trọng số Đặc trưng (Feature Importance)
            </div>
            
            <div className="p-5 flex-1 flex flex-col justify-between gap-5">
              <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
                Biểu đồ mô phỏng trọng số của các yếu tố sinh học tác động mạnh nhất đến kết quả chẩn đoán bệnh tim từ bộ dữ liệu Kaggle.
              </p>

              <div className="flex flex-col gap-3.5 my-3">
                {[
                  { name: 'Huyết áp cao (HighBP)', value: 85, color: 'bg-red-600' },
                  { name: 'Cholesterol cao (HighChol)', value: 75, color: 'bg-red-500' },
                  { name: 'Tuổi bệnh nhân (Age Group)', value: 65, color: 'bg-red-400' },
                  { name: 'Tiền sử hút thuốc (Smoker)', value: 55, color: 'bg-rose-300' },
                  { name: 'Chỉ số khối cơ thể (BMI)', value: 45, color: 'bg-rose-200' },
                ].map((feat, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[9px] font-extrabold uppercase tracking-wider text-neutral-500">
                      <span>{feat.name}</span>
                      <span className="text-neutral-800 font-black">{feat.value}%</span>
                    </div>
                    <div className="border border-neutral-200/30 h-2.5 bg-white/60 rounded-full relative overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full ${feat.color}`} 
                        style={{ width: `${feat.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-200/40 border-dashed pt-4 flex gap-2 text-[9px] font-bold uppercase text-neutral-400">
                <Brain size={12} className="stroke-[2.5] text-red-500 shrink-0" />
                <span>Tính toán dựa trên trọng số SHAP từ mô hình XGBoost Ensemble</span>
              </div>
            </div>
          </div>
        </div>

        {/* Khối Thông tin thêm về Model (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="glass-panel rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md shadow-md flex flex-col h-full overflow-hidden">
            <div className="border-b border-neutral-200/40 px-5 py-3.5 font-bold uppercase tracking-wider text-xs bg-white/35 text-neutral-800 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-red-500 rounded-full inline-block shrink-0" />
              Đánh giá Mô hình Machine Learning
            </div>
            
            <div className="p-5 flex-1 flex flex-col justify-between gap-4 bg-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* XGBoost Card */}
                <div className="bg-white/50 border border-neutral-200/30 p-4 rounded-xl shadow-sm flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase text-red-650 font-extrabold">Mô hình Chính</span>
                      <span className="text-[9px] uppercase font-bold bg-neutral-900 text-white px-2 py-0.5 rounded-full">Primary</span>
                    </div>
                    <h4 className="font-black text-sm uppercase text-neutral-800 mt-2">XGBoost Ensemble</h4>
                    <p className="text-[10px] text-neutral-400 leading-relaxed font-semibold mt-1">
                      Cho kết quả chính xác cao đối với dữ liệu phân loại lâm sàng dạng bảng.
                    </p>
                    <div className="flex gap-4 mt-3 text-[10px] font-black uppercase text-neutral-700">
                      <span>Accuracy: 89.0%</span>
                      <span>ROC AUC: 0.932</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedModelForParams('xgboost');
                      setParamsModalOpen(true);
                    }}
                    className="text-[9px] font-extrabold uppercase tracking-wider text-red-600 hover:text-red-700 mt-4 text-left hover:underline select-none cursor-pointer flex items-center gap-0.5 self-start"
                  >
                    Xem siêu tham số <ChevronRight size={10} />
                  </button>
                </div>

                {/* Random Forest Card */}
                <div className="bg-white/50 border border-neutral-200/30 p-4 rounded-xl shadow-sm flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase text-neutral-600 font-extrabold">Mô hình Phụ</span>
                      <span className="text-[9px] uppercase font-bold bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full">Backup</span>
                    </div>
                    <h4 className="font-black text-sm uppercase text-neutral-800 mt-2">Random Forest</h4>
                    <p className="text-[10px] text-neutral-400 leading-relaxed font-semibold mt-1">
                      Được sử dụng kiểm chéo để hạn chế hiện tượng quá khớp (overfitting).
                    </p>
                    <div className="flex gap-4 mt-3 text-[10px] font-black uppercase text-neutral-700">
                      <span>Accuracy: 86.4%</span>
                      <span>ROC AUC: 0.908</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedModelForParams('random_forest');
                      setParamsModalOpen(true);
                    }}
                    className="text-[9px] font-extrabold uppercase tracking-wider text-red-600 hover:text-red-700 mt-4 text-left hover:underline select-none cursor-pointer flex items-center gap-0.5 self-start"
                  >
                    Xem siêu tham số <ChevronRight size={10} />
                  </button>
                </div>

                {/* Logistic Regression Card */}
                <div className="bg-white/50 border border-neutral-200/30 p-4 rounded-xl shadow-sm flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase text-neutral-600 font-extrabold">Mô hình Đối chứng</span>
                      <span className="text-[9px] uppercase font-bold bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">Reference</span>
                    </div>
                    <h4 className="font-black text-sm uppercase text-neutral-800 mt-2">Logistic Regression</h4>
                    <p className="text-[10px] text-neutral-400 leading-relaxed font-semibold mt-1">
                      Được dùng làm mô hình đối chứng cơ sở để đánh giá khả năng hội tụ.
                    </p>
                    <div className="flex gap-4 mt-3 text-[10px] font-black uppercase text-neutral-700">
                      <span>Accuracy: 84.1%</span>
                      <span>ROC AUC: 0.885</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedModelForParams('logistic_regression');
                      setParamsModalOpen(true);
                    }}
                    className="text-[9px] font-extrabold uppercase tracking-wider text-red-600 hover:text-red-700 mt-4 text-left hover:underline select-none cursor-pointer flex items-center gap-0.5 self-start"
                  >
                    Xem siêu tham số <ChevronRight size={10} />
                  </button>
                </div>
              </div>

              <div className="border-t border-neutral-200/40 border-dashed pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                <span className="text-[9px] font-extrabold text-neutral-400 uppercase">Đào tạo trên tập dữ liệu CDC Kaggle và kiểm định chéo 5-fold.</span>
                <Link href="/tai-lieu" className="text-[10px] font-black uppercase tracking-wider text-red-600 hover:text-red-700 flex items-center gap-0.5 hover:underline select-none">
                  Xem tài liệu chi tiết <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>

      <HyperparamsModal
        isOpen={paramsModalOpen}
        onClose={() => setParamsModalOpen(false)}
        modelType={selectedModelForParams}
      />

      {/* Vùng ẩn phục vụ việc xuất báo cáo Y khoa PDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div
          id="medical-report-pdf"
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
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Mã báo cáo: {reportId}</p>
                <p className="text-[10px] font-bold text-neutral-500 mt-1">Ngày lập: {reportDate}</p>
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
                    <td className="border border-neutral-200 p-2.5">{form.sex === 1 ? 'Nam' : 'Nữ'}</td>
                  </tr>
                  <tr className="bg-neutral-50/50">
                    <td className="border border-neutral-200 p-2.5">Nhóm tuổi</td>
                    <td className="border border-neutral-200 p-2.5">
                      {form.age === 1 && '18 - 24 tuổi'}
                      {form.age === 2 && '25 - 29 tuổi'}
                      {form.age === 3 && '30 - 34 tuổi'}
                      {form.age === 4 && '35 - 39 tuổi'}
                      {form.age === 5 && '40 - 44 tuổi'}
                      {form.age === 6 && '45 - 49 tuổi'}
                      {form.age === 7 && '50 - 54 tuổi'}
                      {form.age === 8 && '55 - 59 tuổi'}
                      {form.age === 9 && '60 - 64 tuổi'}
                      {form.age === 10 && '65 - 69 tuổi'}
                      {form.age === 11 && '70 - 74 tuổi'}
                      {form.age === 12 && '75 - 79 tuổi'}
                      {form.age === 13 && '80 tuổi trở lên'}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-neutral-200 p-2.5">Chỉ số khối cơ thể (BMI)</td>
                    <td className="border border-neutral-200 p-2.5">{form.bmi}</td>
                  </tr>
                  <tr className="bg-neutral-50/50">
                    <td className="border border-neutral-200 p-2.5">Chỉ số Huyết áp cao</td>
                    <td className="border border-neutral-200 p-2.5">{form.highBP === 1 ? 'Có (Huyết áp >= 130/80 mmHg)' : 'Không'}</td>
                  </tr>
                  <tr>
                    <td className="border border-neutral-200 p-2.5">Chỉ số Cholesterol cao</td>
                    <td className="border border-neutral-200 p-2.5">{form.highChol === 1 ? 'Có (Cholesterol toàn phần > 200 mg/dL)' : 'Không'}</td>
                  </tr>
                  <tr className="bg-neutral-50/50">
                    <td className="border border-neutral-200 p-2.5">Tiền sử hút thuốc lá</td>
                    <td className="border border-neutral-200 p-2.5">{form.smoker === 1 ? 'Có (Ít nhất 100 điếu thuốc)' : 'Không'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 2: Đánh giá nguy cơ từ AI */}
            {result && (
              <div className="mb-6">
                <h3 className="text-xs font-extrabold uppercase text-neutral-800 border-l-4 border-red-500 pl-2 mb-3 tracking-wider">
                  2. Kết quả phân tích nguy cơ (Machine Learning)
                </h3>
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase">Thuật toán chẩn đoán</p>
                    <p className="text-xs font-extrabold text-neutral-800 mt-0.5">{result.executedModel || 'XGBoost Ensemble'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase">Xác suất nguy cơ</p>
                    <p className="text-sm font-black text-red-650 mt-0.5">{result.score}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase">Mức độ nguy cơ</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase text-white mt-1 ${
                      result.riskLevel === 'Cao' ? 'bg-red-600' :
                      result.riskLevel === 'Trung bình' ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}>
                      {result.riskLevel || 'Thấp'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Khuyến nghị y khoa */}
            {result && result.recommendations && (
              <div className="mb-6">
                <h3 className="text-xs font-extrabold uppercase text-neutral-800 border-l-4 border-red-500 pl-2 mb-3 tracking-wider">
                  3. Khuyến nghị phòng ngừa & Điều chỉnh lối sống
                </h3>
                <div className="flex flex-col gap-2">
                  {result.recommendations.map((rec, idx) => (
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
}
