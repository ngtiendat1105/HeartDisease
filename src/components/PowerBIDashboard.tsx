'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, Globe, Info, ExternalLink } from 'lucide-react';
import { CustomButton } from './CustomButton';

type ViewTab = 'demographics' | 'correlations' | 'geography';

export const PowerBIDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewTab>('demographics');

  const tabs = [
    { id: 'demographics', label: 'Phân tích Nhân khẩu học', icon: BarChart3 },
    { id: 'correlations', label: 'Tương quan Yếu tố Nguy cơ', icon: TrendingUp },
    { id: 'geography', label: 'Xu hướng Địa lý', icon: Globe },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ViewTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? 'bg-red-50 border border-red-500/25 text-red-600 shadow-sm shadow-red-100/50'
                  : 'bg-white/50 border border-neutral-200/40 text-neutral-500 hover:bg-white/90 hover:text-neutral-800'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Power BI Container */}
      <div className="glass-panel rounded-2xl shadow-xl shadow-red-100/5 overflow-hidden flex flex-col min-h-[500px] border border-white/60">
        {/* Header bar */}
        <div className="border-b border-neutral-200/30 bg-white/40 backdrop-blur-md px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-500 w-2 h-2 rounded-full animate-pulse" />
            <h3 className="font-extrabold text-neutral-800 tracking-wider text-xs uppercase">
              PHÂN TÍCH POWER BI — CHẾ ĐỘ XEM {activeTab === 'demographics' ? 'NHÂN KHẨU HỌC' : activeTab === 'correlations' ? 'HỆ SỐ TƯƠNG QUAN' : 'BẢN ĐỒ ĐỊA LÝ'}
            </h3>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            <span>Workspace: Grad_Project_V1</span>
            <span className="bg-red-50 text-red-600 px-2 py-0.5 border border-red-100 rounded-full font-extrabold">Kết nối Trực tiếp</span>
          </div>
        </div>

        {/* Embedded content space */}
        <div className="flex-1 bg-neutral-50/50 p-6 flex flex-col lg:flex-row gap-6 relative overflow-hidden">
          {/* Faint Grid background */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* Interactive Report View */}
          <div className="flex-1 border border-neutral-200/40 bg-white shadow-sm rounded-2xl relative overflow-hidden flex flex-col z-10">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50/30 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                Khung báo cáo Tương tác
              </span>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-neutral-200" />
                <span className="w-2 h-2 rounded-full bg-neutral-200" />
                <span className="w-2 h-2 rounded-full bg-neutral-200" />
              </div>
            </div>

            <div className="flex-1 p-6 flex flex-col justify-center items-center">
              {activeTab === 'demographics' && (
                <div className="w-full h-full flex flex-col gap-6 justify-center">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-neutral-200/40 p-4 flex flex-col justify-between rounded-xl shadow-sm">
                      <span className="text-[10px] uppercase text-neutral-400 font-bold">Tổng cỡ mẫu Bệnh án</span>
                      <span className="text-2xl font-black text-neutral-800 mt-1">10.240</span>
                      <span className="text-[9px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">▲ Tăng 12% học kỳ này</span>
                    </div>
                    <div className="bg-white border border-neutral-200/40 p-4 flex flex-col justify-between rounded-xl shadow-sm">
                      <span className="text-[10px] uppercase text-neutral-400 font-bold">Tuổi trung bình</span>
                      <span className="text-2xl font-black text-red-600 mt-1">54,3 tuổi</span>
                      <span className="text-[9px] text-neutral-400 font-semibold mt-1">Độ lệch chuẩn: 11,2 tuổi</span>
                    </div>
                    <div className="bg-white border border-neutral-200/40 p-4 flex flex-col justify-between rounded-xl shadow-sm">
                      <span className="text-[10px] uppercase text-neutral-400 font-bold">Tỷ lệ Giới tính</span>
                      <span className="text-2xl font-black text-neutral-800 mt-1">52,8% / 47,2%</span>
                      <span className="text-[9px] text-neutral-400 font-semibold mt-1">5.406 Nam | 4.834 Nữ</span>
                    </div>
                  </div>

                  <div className="flex-1 bg-white border border-neutral-200/40 p-4 flex flex-col rounded-xl shadow-sm">
                    <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-4 block">
                      Tỷ lệ mắc bệnh tim mạch theo nhóm tuổi & giới tính
                    </span>
                    <div className="flex-1 flex items-end gap-4 h-40 pt-4 border-b border-l border-neutral-100">
                      {[
                        { age: '20-39', male: 12, female: 8 },
                        { age: '40-49', male: 34, female: 22 },
                        { age: '50-59', male: 68, female: 45 },
                        { age: '60-69', male: 89, female: 72 },
                        { age: '70+', male: 95, female: 91 },
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <div className="w-full flex justify-center items-end gap-1 h-full">
                            <div 
                              className="w-1/3 bg-red-500 rounded-t-sm hover:opacity-80 transition-all cursor-pointer relative group" 
                              style={{ height: `${item.male}%` }}
                            >
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-[8px] px-1 py-0.5 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                Nam: {item.male}%
                              </span>
                            </div>
                            <div 
                              className="w-1/3 bg-red-300 rounded-t-sm hover:opacity-80 transition-all cursor-pointer relative group" 
                              style={{ height: `${item.female}%` }}
                            >
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-[8px] px-1 py-0.5 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                Nữ: {item.female}%
                              </span>
                            </div>
                          </div>
                          <span className="text-[9px] uppercase font-bold text-neutral-400 mt-1">{item.age}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4 justify-center mt-3 text-[9px] font-bold uppercase text-neutral-500">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-red-500 inline-block rounded-sm" />
                        <span>Bệnh nhân Nam</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-red-300 inline-block rounded-sm" />
                        <span>Bệnh nhân Nữ</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'correlations' && (
                <div className="w-full h-full flex flex-col gap-6 justify-center">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white border border-neutral-200/40 p-4 rounded-xl shadow-sm">
                      <span className="text-[10px] uppercase text-neutral-400 font-bold block mb-1">Yếu tố ảnh hưởng chính</span>
                      <span className="text-xl font-black text-red-600">HA Tâm thu & Cholesterol</span>
                      <p className="text-[9px] text-neutral-400 mt-2 font-semibold">
                        Bản đồ tương quan phân tích ensemble xác nhận Huyết áp tâm thu có mức độ liên quan tuyến tính cao nhất (Pearson r = 0.48), tiếp sau là Cholesterol huyết thanh (r = 0.39).
                      </p>
                    </div>
                    <div className="bg-white border border-neutral-200/40 p-4 rounded-xl shadow-sm">
                      <span className="text-[10px] uppercase text-neutral-400 font-bold block mb-1">Hiệu ứng Nhịp tim gắng sức</span>
                      <span className="text-xl font-black text-neutral-850">Tương quan nghịch -0.34</span>
                      <p className="text-[9px] text-neutral-400 mt-2 font-semibold">
                        Chỉ số nhịp tim tối đa đạt được tỷ lệ nghịch rõ rệt với xác suất mắc bệnh mạch vành, khẳng định giá trị của cơ chế dự trữ tim khi chịu tải vật lý.
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 bg-white border border-neutral-200/40 p-4 flex flex-col relative rounded-xl shadow-sm min-h-[160px]">
                    <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-2 block">
                      Bản đồ phân tán: Cholesterol vs Huyết áp tâm thu & Mức độ nguy cơ
                    </span>
                    <div className="flex-1 border-b border-l border-neutral-100 relative m-2 min-h-[100px]">
                      {/* Điểm xanh - Thấp */}
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white shadow-sm left-[15%] bottom-[20%] animate-pulse" title="HA: 115, Chol: 180 (Nguy cơ Thấp)" />
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white shadow-sm left-[25%] bottom-[30%]" title="HA: 120, Chol: 195 (Nguy cơ Thấp)" />
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white shadow-sm left-[35%] bottom-[15%]" title="HA: 125, Chol: 170 (Nguy cơ Thấp)" />
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white shadow-sm left-[10%] bottom-[45%]" title="HA: 110, Chol: 220 (Nguy cơ Thấp)" />
                      
                      {/* Điểm cam - Vừa */}
                      <div className="absolute w-3 h-3 rounded-full bg-amber-500 border border-white shadow-sm left-[45%] bottom-[50%]" title="HA: 138, Chol: 210 (Nguy cơ Vừa)" />
                      <div className="absolute w-3 h-3 rounded-full bg-amber-500 border border-white shadow-sm left-[55%] bottom-[35%]" title="HA: 142, Chol: 190 (Nguy cơ Vừa)" />
                      <div className="absolute w-3 h-3 rounded-full bg-amber-500 border border-white shadow-sm left-[30%] bottom-[65%]" title="HA: 128, Chol: 260 (Nguy cơ Vừa)" />
                      <div className="absolute w-3 h-3 rounded-full bg-amber-500 border border-white shadow-sm left-[65%] bottom-[40%]" title="HA: 150, Chol: 200 (Nguy cơ Vừa)" />
                      
                      {/* Điểm đỏ - Cao */}
                      <div className="absolute w-3.5 h-3.5 rounded-full bg-red-600 border border-white shadow-md left-[75%] bottom-[75%] animate-bounce" style={{ animationDuration: '2.5s' }} title="HA: 165, Chol: 280 (Nguy cơ Cao)" />
                      <div className="absolute w-3.5 h-3.5 rounded-full bg-red-600 border border-white shadow-md left-[85%] bottom-[60%]" title="HA: 175, Chol: 240 (Nguy cơ Cao)" />
                      <div className="absolute w-3.5 h-3.5 rounded-full bg-red-600 border border-white shadow-md left-[70%] bottom-[85%]" title="HA: 160, Chol: 310 (Nguy cơ Cao)" />
                      <div className="absolute w-3.5 h-3.5 rounded-full bg-red-600 border border-white shadow-md left-[90%] bottom-[88%]" title="HA: 185, Chol: 330 (Nguy cơ Cao)" />

                      <span className="absolute bottom-1 right-2 text-[7px] font-black text-neutral-400 uppercase">HA Tâm thu ➔</span>
                      <span className="absolute left-2 top-2 text-[7px] font-black text-neutral-400 uppercase origin-left rotate-90 whitespace-nowrap">Cholesterol mg/dL ➔</span>
                    </div>
                    <div className="flex gap-4 justify-center mt-2 text-[9px] font-bold uppercase text-neutral-450">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-emerald-500 inline-block rounded-full" />
                        <span>Nguy cơ Thấp</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-amber-500 inline-block rounded-full" />
                        <span>Nguy cơ Trung bình</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-red-650 inline-block rounded-full" />
                        <span>Nguy cơ Cao</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'geography' && (
                <div className="w-full h-full flex flex-col gap-6 justify-center">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-neutral-200/40 p-4 text-center rounded-xl shadow-sm">
                      <span className="text-[9px] uppercase text-neutral-400 font-bold block">Vùng Nguy Cơ Cao Nhất</span>
                      <span className="text-lg font-black text-red-600 block mt-1">Phân khu Phía Đông</span>
                      <span className="text-xs font-semibold text-neutral-500">Tỷ lệ mắc: 14.8%</span>
                    </div>
                    <div className="bg-white border border-neutral-200/40 p-4 text-center rounded-xl shadow-sm">
                      <span className="text-[9px] uppercase text-neutral-400 font-bold block">Vùng Nguy Cơ Thấp Nhất</span>
                      <span className="text-lg font-black text-emerald-600 block mt-1">Thung lũng Phía Tây</span>
                      <span className="text-xs font-semibold text-neutral-500">Tỷ lệ mắc: 6.2%</span>
                    </div>
                    <div className="bg-white border border-neutral-200/40 p-4 text-center rounded-xl shadow-sm">
                      <span className="text-[9px] uppercase text-neutral-400 font-bold block">Thành thị / Nông thôn</span>
                      <span className="text-lg font-black text-neutral-800 block mt-1">Đô thị hóa lớn (1.8x)</span>
                      <span className="text-xs font-semibold text-neutral-500">Đô thị: 11.4% | Nông thôn: 6.3%</span>
                    </div>
                  </div>

                  <div className="flex-1 bg-white border border-neutral-200/40 p-4 flex flex-col justify-center items-center rounded-xl shadow-sm">
                    <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-4 self-start">
                      Bản đồ phân phối tỷ lệ mắc bệnh theo vùng địa lý
                    </span>
                    
                    {/* Bản đồ mô phỏng */}
                    <div className="w-full max-w-[400px] h-32 border border-neutral-200/60 relative bg-neutral-50/20 rounded-xl overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 opacity-[0.05] border border-neutral-400" style={{ backgroundImage: 'linear-gradient(to right, gray 1px, transparent 1px), linear-gradient(to bottom, gray 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
                      
                      <div className="absolute top-2 left-6 w-20 h-16 bg-red-500/5 border border-red-500/20 rounded-lg flex items-center justify-center text-[8px] font-black uppercase text-neutral-600">
                        Bắc (9.8%)
                      </div>
                      <div className="absolute top-4 right-8 w-24 h-20 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-center text-[8px] font-black uppercase text-red-700">
                        Đông (14.8%)
                      </div>
                      <div className="absolute bottom-2 left-10 w-28 h-12 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex items-center justify-center text-[8px] font-black uppercase text-emerald-700">
                        Tây (6.2%)
                      </div>
                      <div className="absolute bottom-4 right-16 w-20 h-14 bg-red-500/5 border border-red-500/20 rounded-lg flex items-center justify-center text-[8px] font-black uppercase text-neutral-600">
                        Nam (10.5%)
                      </div>
                      <div className="absolute w-12 h-12 bg-red-500/15 border border-red-500/30 rounded-full flex items-center justify-center text-[7px] font-black uppercase text-red-650 animate-pulse">
                        Trung tâm
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cột thông tin phụ bên cạnh */}
          <div className="w-full lg:w-72 bg-white/70 border border-white/80 text-neutral-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm shadow-red-100/5 z-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Info size={14} className="text-red-500" />
                <span className="font-extrabold text-[10px] uppercase tracking-wider text-red-600">
                  Đặc điểm Tương tác
                </span>
              </div>
              <h4 className="font-extrabold text-sm uppercase tracking-tight leading-tight mb-2 text-neutral-900">
                Báo cáo Phân tích Dữ liệu
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed mb-4 font-semibold">
                Bảng thông tin trực quan này tích hợp tính năng DirectQuery kết nối live đến cơ sở dữ liệu bệnh viện SQL Server, hỗ trợ xử lý lọc dữ liệu theo thời gian thực và phân tích địa lý của mẫu bệnh nhân.
              </p>
              <div className="border-t border-neutral-100 pt-3">
                <h5 className="font-bold text-[9px] uppercase text-neutral-400 mb-2">Bộ lọc Đang áp dụng:</h5>
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-red-50 text-red-600 text-[8px] px-2 py-0.5 border border-red-100 rounded-full font-extrabold">Tuổi: 20-80+</span>
                  <span className="bg-red-50 text-red-600 text-[8px] px-2 py-0.5 border border-red-100 rounded-full font-extrabold">Tập mẫu: US-Europe</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 mt-4 lg:mt-0">
              <a 
                href="https://app.powerbi.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full text-xs font-black uppercase tracking-wider border border-red-500/20 bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm shadow-red-500/15"
              >
                <span>Mở trong Power BI</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
