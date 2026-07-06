'use client';

import React, { useState } from 'react';
import { Pill, Calendar, Clock, Send, BellRing, AlertCircle, CheckCircle } from 'lucide-react';

export const ReminderForm: React.FC = () => {
  const [telegramChatId, setTelegramChatId] = useState('');
  const [reminderType, setReminderType] = useState<'medication' | 'appointment'>('medication');
  const [content, setContent] = useState('');
  const [remindAt, setRemindAt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramChatId,
          reminderType,
          content,
          remindAt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo lịch nhắc nhở.');
      }

      setMessage({
        type: 'success',
        text: 'Đặt lịch nhắc nhở thành công! Hệ thống sẽ gửi tin nhắn đến Telegram của bạn khi đến giờ.',
      });
      
      // Reset form
      setTelegramChatId('');
      setContent('');
      setRemindAt('');
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Lỗi kết nối máy chủ.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel border border-white/60 bg-white/40 backdrop-blur-md rounded-2xl shadow-xl p-6 flex flex-col gap-5 w-full">
      <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-200/40">
        <div className="bg-red-50 text-red-650 p-2.5 rounded-xl border border-red-100/60 shadow-sm flex items-center justify-center bg-red-600/5 text-red-600">
          <BellRing size={20} className="stroke-[2.2]" />
        </div>
        <div>
          <h3 className="font-black uppercase tracking-tight text-neutral-900 text-sm sm:text-base leading-none">
            Đặt Lịch Nhắc Nhở Sức Khỏe
          </h3>
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 mt-1 block">
            Gửi tin nhắn thông báo tự động qua Telegram
          </span>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-2.5 text-xs font-semibold border ${
          message.type === 'success' 
            ? 'bg-emerald-50/50 border-emerald-200/40 text-emerald-700' 
            : 'bg-red-50/50 border-red-200/40 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={16} className="shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Telegram Chat ID */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-neutral-500">
            Telegram Chat ID
          </label>
          <input
            type="text"
            required
            placeholder="Ví dụ: 123456789"
            value={telegramChatId}
            onChange={(e) => setTelegramChatId(e.target.value)}
            className="glass-input rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-800 shadow-sm outline-none w-full"
          />
          <span className="text-[9px] text-neutral-500 font-medium leading-relaxed pl-1">
            Mẹo: Chat với <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">@userinfobot</a> trên Telegram để lấy mã ID của bạn.
          </span>
        </div>

        {/* Reminder Type (Radio tabs) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Loại nhắc nhở
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setReminderType('medication')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                reminderType === 'medication'
                  ? 'bg-red-500/10 border-red-500/30 text-red-600'
                  : 'bg-white/50 border-neutral-200/40 text-neutral-600 hover:bg-neutral-100/50'
              }`}
            >
              <Pill size={14} /> Uống thuốc
            </button>
            <button
              type="button"
              onClick={() => setReminderType('appointment')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                reminderType === 'appointment'
                  ? 'bg-red-500/10 border-red-500/30 text-red-600'
                  : 'bg-white/50 border-neutral-200/40 text-neutral-600 hover:bg-neutral-100/50'
              }`}
            >
              <Calendar size={14} /> Lịch khám bệnh
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Nội dung nhắc nhở
          </label>
          <textarea
            required
            rows={3}
            placeholder={
              reminderType === 'medication'
                ? 'Ví dụ: Uống thuốc huyết áp Amlodipine 5mg sau ăn'
                : 'Ví dụ: Tái khám định kỳ tại Bệnh viện Tim mạch'
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="glass-input rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-800 shadow-sm outline-none w-full resize-none leading-relaxed"
          />
        </div>

        {/* Remind At */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-neutral-500">
            <Clock size={13} className="text-red-500" /> Thời gian nhắc nhở
          </label>
          <input
            type="datetime-local"
            required
            value={remindAt}
            onChange={(e) => setRemindAt(e.target.value)}
            className="glass-input rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-800 shadow-sm outline-none w-full cursor-pointer"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-600 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/35 flex items-center justify-center gap-2 cursor-pointer text-xs select-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={14} /> {isLoading ? 'Đang thiết lập...' : 'Đặt lịch nhắc nhở'}
        </button>
      </form>
    </div>
  );
};
