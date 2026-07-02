import React from 'react';
import { ModelInsights } from '@/components/ModelInsights';

export default function ModelDocsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="border-b border-neutral-200/40 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
        <div>
          <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-red-100/60 inline-block mb-2">
            Tài liệu kỹ thuật
          </span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900">
            Đánh giá &amp; Phân tích Mô hình
          </h2>
        </div>
        <p className="text-xs sm:text-sm font-semibold text-neutral-500 max-w-md leading-relaxed">
          Báo cáo chi tiết về kiến trúc mô hình học máy, các chỉ số đánh giá chéo và xếp hạng mức độ ảnh hưởng của các chỉ số sinh học.
        </p>
      </div>
      <ModelInsights />
    </div>
  );
}
