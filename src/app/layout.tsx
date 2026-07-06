import type { Metadata } from "next";
import { Stethoscope } from "lucide-react";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "HeartDisease AI | Dự đoán Nguy cơ & Phân tích Dữ liệu Tim mạch",
  description: "Phân tích và dự đoán nguy cơ bệnh tim mạch bằng Machine Learning và Power BI. Giao diện Glassmorphism tích hợp mô hình phân loại Random Forest/XGBoost và báo cáo trực quan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#fbfbfc] text-neutral-800 selection:bg-red-500/10 selection:text-red-500 relative">
        
        {/* Floating background blur elements for Glassmorphism depth */}
        <div className="fixed -top-32 -left-32 w-[350px] h-[350px] bg-red-200/15 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="fixed top-1/3 -right-32 w-[400px] h-[400px] bg-rose-200/15 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="fixed -bottom-32 left-1/4 w-[350px] h-[350px] bg-red-100/20 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Thanh Điều Hướng (Sticky Glass Navbar) */}
        <Header />


        {/* Khu Vực Nội Dung Chính (Main Content Area) */}
        <main className="flex-1 relative">
          {children}
        </main>

        {/* Chân Trang (Glassmorphic Footer) */}
        <footer className="border-t border-white/60 bg-white/40 backdrop-blur-md py-12 px-6 shadow-sm">
          <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2.5 justify-center">
                <div className="bg-red-600 text-white p-2 rounded-xl border border-red-500/20 shadow-sm flex items-center justify-center">
                  <Stethoscope size={18} className="stroke-[2.5]" />
                </div>
                <h4 className="font-black uppercase text-xl tracking-tight text-neutral-900">
                  HeartDisease <span className="text-red-600">AI</span>
                </h4>
              </div>
              <p className="text-sm font-extrabold text-neutral-900 leading-snug tracking-tight max-w-xl">
                Phân tích và dự đoán nguy cơ bệnh tim mạch bằng Machine Learning và Power BI
              </p>
              <p className="text-xs text-neutral-500 font-medium leading-relaxed max-w-2xl mt-1">
                Hệ thống chuẩn hóa các chỉ số sinh hiệu và tiền sử bệnh lý để hỗ trợ sàng lọc sức khỏe tim mạch. Các phân tích tương quan và báo cáo dữ liệu trực quan dựa trên mẫu dữ liệu bệnh án lâm sàng lưu trữ.
              </p>
              
              {/* Cảnh báo y khoa phù hợp với ứng dụng chẩn đoán lâm sàng */}
              <div className="bg-red-50/50 border border-red-200/30 px-5 py-3 rounded-2xl text-[10px] text-red-600 font-bold max-w-2xl mt-3 text-left leading-relaxed">
                <span className="uppercase text-red-700 font-extrabold block mb-1 text-center">Khước từ trách nhiệm y khoa:</span>
                Mọi thông số và kết quả tính toán xác suất nguy cơ của hệ thống chỉ mang tính chất tham khảo học thuật. Kết quả này hoàn toàn không thay thế cho các chỉ định lâm sàng, xét nghiệm chuyên sâu hoặc chẩn đoán điều trị chuyên khoa của bác sĩ tim mạch.
              </div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto border-t border-neutral-200/50 mt-8 pt-8 text-center text-[10px] font-bold uppercase text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span>© 2026 HEARTDISEASEAI. BẢN QUYỀN ĐÃ ĐƯỢC BẢO HỘ.</span>
            <span className="bg-white/80 border border-neutral-200/50 px-3 py-1 rounded-full text-red-600 font-extrabold shadow-sm">
              TRẠNG THÁI: HOẠT ĐỘNG
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
