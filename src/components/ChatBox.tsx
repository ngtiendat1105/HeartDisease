'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { UIMessage } from 'ai';
import { 
  Bot, 
  User as UserIcon, 
  Send, 
  RotateCcw, 
  Heart,
  MessageSquare,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export function ChatBox() {
  const [input, setInput] = useState('');
  
  const { 
    messages, 
    sendMessage,
    setMessages,
    status
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cuộn tự động xuống dưới cùng khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Xử lý Gửi tin nhắn
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === 'submitted' || status === 'streaming') return;
    
    sendMessage({ text: input });
    setInput('');
  };

  // Xử lý Gửi câu hỏi nhanh
  const handleQuickQuestion = (question: string) => {
    if (status === 'submitted' || status === 'streaming') return;
    sendMessage({ text: question });
  };

  // Xử lý Reset / Xóa lịch sử chat
  const handleResetChat = () => {
    setMessages([]);
    setInput('');
  };

  // Các thẻ câu hỏi gợi ý thiết kế kiểu Gemini
  const starterQuestions = [
    {
      title: "BMI 27 có nguy hiểm không?",
      desc: "Phân tích chỉ số khối cơ thể và đánh giá nguy cơ quá cân đối với tim mạch.",
      query: "BMI 27 có nguy hiểm không?"
    },
    {
      title: "Làm sao giảm huyết áp?",
      desc: "Các phương pháp tự nhiên và thay đổi lối sống để kiểm soát huyết áp cao.",
      query: "Làm sao giảm huyết áp hiệu quả?"
    },
    {
      title: "Triệu chứng nhồi máu cơ tim?",
      desc: "Những dấu hiệu cảnh báo lâm sàng khẩn cấp cần đưa đi cấp cứu ngay.",
      query: "Triệu chứng nhồi máu cơ tim là gì?"
    }
  ];

  // Helper trích xuất nội dung văn bản từ các UIMessagePart
  const getMessageText = (m: UIMessage): string => {
    return m.parts
      .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
      .map(part => part.text)
      .join('');
  };

  // Render nội dung tin nhắn hỗ trợ Markdown cơ bản (In đậm, Xuống dòng, Gạch đầu dòng)
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, lineIndex) => {
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      let cleanLine = line;
      if (isBullet) {
        cleanLine = line.trim().replace(/^[-*]\s+/, '');
      }

      // Xử lý in đậm **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(cleanLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(cleanLine.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index} className="font-extrabold text-neutral-900">
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < cleanLine.length) {
        parts.push(cleanLine.substring(lastIndex));
      }

      if (isBullet) {
        return (
          <div key={lineIndex} className="flex items-start gap-1.5 ml-1 my-1">
            <span className="text-red-500 select-none mt-1 shrink-0">•</span>
            <span className="leading-relaxed text-sm text-neutral-700">
              {parts.length > 0 ? parts : cleanLine}
            </span>
          </div>
        );
      }

      return (
        <p key={lineIndex} className={`${lineIndex > 0 ? 'mt-1.5' : ''} leading-relaxed text-sm text-neutral-700 min-h-[1rem]`}>
          {parts.length > 0 ? parts : cleanLine}
        </p>
      );
    });
  };

  const isGenerating = status === 'submitted' || status === 'streaming';

  return (
    <div className="glass-panel bg-white/40 backdrop-blur-md border border-white/60 shadow-xl rounded-2xl h-[760px] flex flex-col overflow-hidden w-full transition-all">
      {/* Header Chatbox */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-5 py-3.5 flex items-center justify-between border-b border-white/20 text-white shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl border border-white/20 flex items-center justify-center shadow-inner">
            <Heart size={18} className="fill-white stroke-[2.5] text-white" />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider leading-none">
              HeartDisease
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/95">
                {isGenerating ? 'Đang phản hồi...' : 'Online (Mạch đập)'}
              </span>
            </div>
          </div>
        </div>

        {/* Nút Reset Lịch sử */}
        {messages.length > 0 && (
          <button
            onClick={handleResetChat}
            className="p-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 text-white transition-all cursor-pointer flex items-center justify-center active:scale-95 shadow-sm"
            title="Làm mới hội thoại"
          >
            <RotateCcw size={15} className="stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Vùng Tin Nhắn */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-neutral-50/10">
        {messages.length === 0 ? (
          /* Giao diện trống kiểu Gemini rộng rãi */
          <div className="flex-1 flex flex-col justify-center items-center max-w-2xl mx-auto w-full py-8 gap-8 animate-fade-in">
            <div className="flex flex-col items-center text-center gap-3.5">
              <div className="bg-gradient-to-r from-red-50 to-rose-50 text-red-600 p-4 rounded-2xl border border-red-100/50 shadow-sm flex items-center justify-center">
                <Bot size={40} className="stroke-[1.8] text-red-650" />
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-red-600 via-rose-500 to-red-650 bg-clip-text text-transparent text-3xl font-black uppercase tracking-tight">
                  Xin chào, tôi là HeartDisease
                </h1>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-2.5">
                  Trợ lý trí tuệ nhân tạo chuyên sâu về sức khỏe tim mạch
                </p>
                <p className="text-sm text-neutral-500 font-semibold max-w-lg mt-3 leading-relaxed">
                  Tôi có thể giải đáp các câu hỏi về huyết áp, cholesterol, BMI, chế độ dinh dưỡng và thói quen sinh hoạt tốt cho tim của bạn. Bạn muốn bắt đầu từ đâu?
                </p>
              </div>
            </div>

            {/* Khối thẻ gợi ý kiểu Gemini */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-4">
              {starterQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(q.query)}
                  disabled={isGenerating}
                  className="group text-left bg-white/75 hover:bg-white border border-neutral-200/40 hover:border-red-500/20 p-4 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between h-32 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-sm"
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-black text-neutral-800 group-hover:text-red-600 transition-colors">
                      {q.title}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-medium leading-relaxed">
                      {q.desc}
                    </span>
                  </div>
                  <div className="flex justify-end w-full group-hover:translate-x-1 transition-transform">
                    <ChevronRight size={16} className="text-red-500" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Hiển thị Tin nhắn căn giữa rộng rãi */
          <div className="max-w-2xl mx-auto w-full flex flex-col gap-5">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              const content = getMessageText(m);
              return (
                <div
                  key={m.id}
                  className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Icon Bot */}
                  {!isUser && (
                    <div className="bg-red-50 text-red-600 p-2.5 rounded-xl border border-red-100/60 shadow-sm flex items-center justify-center shrink-0 w-9 h-9 mt-1.5">
                      <Bot size={18} className="stroke-[2.5]" />
                    </div>
                  )}

                  {/* Bong bóng Chat */}
                  <div
                    className={`p-4 rounded-2xl text-sm shadow-sm max-w-[85%] border leading-relaxed ${
                      isUser
                        ? 'bg-red-500 text-white border-red-600/20 rounded-tr-none self-end'
                        : 'bg-white/90 text-neutral-800 border-white/60 rounded-tl-none self-start'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap font-medium">{content}</p>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        {renderMessageContent(content)}
                      </div>
                    )}
                  </div>

                  {/* Icon User */}
                  {isUser && (
                    <div className="bg-red-100 text-red-600 p-2.5 rounded-xl border border-red-200/40 shadow-sm flex items-center justify-center shrink-0 w-9 h-9 mt-1.5">
                      <UserIcon size={18} className="stroke-[2.5]" />
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Messenger Typing Indicator (thinking state) */}
            {status === 'submitted' && (
              <div className="flex gap-2.5 justify-start animate-fade-in">
                <div className="bg-red-50 text-red-600 p-2.5 rounded-xl border border-red-100/60 shadow-sm flex items-center justify-center shrink-0 w-9 h-9 mt-1">
                  <Bot size={18} className="stroke-[2.5]" />
                </div>
                <div className="bg-white/90 border border-white/60 px-4 py-2.5 rounded-2xl rounded-tl-none self-start flex items-center gap-1 shadow-sm">
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }} />
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }} />
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Form nhập liệu kiểu Gemini nằm ở dưới cùng */}
      <div className="p-4 border-t border-neutral-200/40 bg-white/35 shrink-0">
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto w-full flex items-center bg-white/80 border border-neutral-200/60 rounded-full shadow-lg px-4 py-2 focus-within:border-red-500/50 focus-within:ring-4 focus-within:ring-red-500/8 transition-all"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập câu hỏi về sức khỏe tim mạch của bạn tại đây..."
            disabled={isGenerating}
            className="flex-1 bg-transparent py-2.5 px-3 text-xs font-semibold text-neutral-800 outline-none placeholder-neutral-400 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="bg-red-600 text-white p-2.5 rounded-full border border-red-500/20 shadow-sm hover:shadow hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none transition-all flex items-center justify-center w-9 h-9 shrink-0 cursor-pointer"
          >
            <Send size={15} className="stroke-[2.5]" />
          </button>
        </form>
        <div className="max-w-2xl mx-auto text-center mt-2.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-center gap-1">
            <Sparkles size={10} className="text-red-500" /> HeartDisease AI có thể đưa ra câu trả lời chưa hoàn toàn chính xác. Hãy kiểm tra các thông tin y khoa quan trọng.
          </span>
        </div>
      </div>
    </div>
  );
}
