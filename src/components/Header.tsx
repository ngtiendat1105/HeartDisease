'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Stethoscope } from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Tổng quan', href: '/' },
    { label: 'Dự đoán Nguy cơ', href: '/du-doan' },
    { label: 'Báo cáo Power BI', href: '/bao-cao' },
    { label: 'Trợ lý AI', href: '/tro-ly' },
    { label: 'Tài liệu Kỹ thuật', href: '/tai-lieu' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/75 backdrop-blur-md p-4 shadow-sm shadow-red-100/5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 select-none">
          {/* Doctor's stethoscope logo in a medical-red circle wrapper */}
          <div className="bg-red-600 text-white p-2 rounded-xl border border-red-550/20 shadow-sm shadow-red-550/25 flex items-center justify-center">
            <Stethoscope size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-black uppercase tracking-tight text-lg sm:text-xl leading-none text-neutral-900">
              HeartDisease <span className="text-red-600">AI</span>
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">
              Dự đoán ML & Báo cáo Power BI
            </span>
          </div>
        </Link>
        
        <nav className="flex items-center gap-1 sm:gap-2 text-xs font-black uppercase tracking-wider">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`px-3 py-2 rounded-lg transition-all border ${
                  isActive 
                    ? 'bg-red-500/10 text-red-600 border-red-500/20 font-extrabold shadow-sm' 
                    : 'text-neutral-600 border-transparent hover:bg-neutral-100/50 hover:text-red-600'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
