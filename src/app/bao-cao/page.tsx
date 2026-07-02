import React from 'react';
import { PowerBIDashboard } from '@/components/PowerBIDashboard';

export default function PowerBIPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="border-b border-neutral-200/40 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
        <div>
          <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-red-100/60 inline-block mb-2">
            Phân tích dữ liệu trực quan
          </span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900">
            Báo cáo Trực quan Power BI
          </h2>
        </div>
        <p className="text-xs sm:text-sm font-semibold text-neutral-500 max-w-md leading-relaxed">
          Khám phá số liệu thống kê bệnh nhân, hệ số tương quan nguy cơ và xu hướng phân bố địa lý được tích hợp trực tiếp từ Power BI.
        </p>
      </div>
      <PowerBIDashboard />
    </div>
  );
}
