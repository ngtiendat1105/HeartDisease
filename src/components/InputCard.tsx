import React from 'react';

interface InputCardProps {
  title: string;
  headerColor?: 'yellow' | 'cyan' | 'orange' | 'green' | 'purple' | 'pink';
  children: React.ReactNode;
  className?: string;
}

export const InputCard: React.FC<InputCardProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <div className={`glass-panel shadow-md shadow-red-100/5 rounded-2xl overflow-hidden flex flex-col border border-white/60 ${className}`}>
      {/* Header với dải điểm nhấn màu đỏ y khoa */}
      <div className="border-b border-neutral-200/40 px-5 py-3.5 font-bold uppercase tracking-wider text-xs text-neutral-800 bg-white/35 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-red-500 rounded-full inline-block shrink-0" />
        {title}
      </div>
      <div className="p-5 flex-1 flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
};
