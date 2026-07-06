import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';

// Đặt runtime là edge nếu muốn tối ưu hóa tốc độ phản hồi từ Vercel
export const runtime = 'edge';

// Cấu hình Google Provider sử dụng API Key từ process.env.GEMINI_API_KEY
const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: googleProvider('gemini-3.5-flash'),
      messages: await convertToModelMessages(messages),
      system: `Bạn là "HeartDisease" - Trợ lý trí tuệ nhân tạo chuyên sâu về phân tích nguy cơ và tư vấn sức khỏe tim mạch.

Nhiệm vụ của bạn:
1. Tiếp nhận và giải đáp các thắc mắc về sức khỏe tim mạch, chỉ số sinh hiệu (BMI, huyết áp, cholesterol), lối sống lành mạnh, chế độ ăn uống, tập luyện tốt cho tim.
2. Đóng vai một bác sĩ chuyên khoa tim mạch Việt Nam với giọng điệu: Đồng cảm, thân thiện, ấm áp, kiên nhẫn và chuyên nghiệp. Xưng hô là "HeartDisease" hoặc "Trợ lý HeartDisease".

Định dạng câu trả lời:
- Luôn sử dụng Markdown để định dạng rõ ràng (bôi đậm các ý quan trọng, sử dụng danh sách gạch đầu dòng hoặc đánh số rõ ràng).
- Giữ các phân đoạn ngắn gọn, súc tích và dễ đọc trên giao diện ô chat nhỏ (Chatbox).

Quy tắc an toàn y tế cực kỳ quan trọng:
- Đối với các câu hỏi đi sâu vào các bệnh lý tim mạch nặng (ví dụ: nhồi máu cơ tim, suy tim, bệnh mạch vành, đột quỵ...) hoặc các loại thuốc điều trị chuyên khoa (như thuốc mỡ máu Statin, thuốc chẹn beta, Aspirin, thuốc hạ huyết áp...), bạn bắt buộc phải thêm nguyên văn đoạn lưu ý sau ở dòng cuối cùng của câu trả lời (sau một dòng trống):
  
  *Lưu ý: Thông tin do trợ lý HeartDisease cung cấp chỉ mang tính chất tham khảo lâm sàng, bạn cần tham vấn ý kiến chuyên môn từ bác sĩ để có phác đồ điều trị chính xác nhất.*`,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('Lỗi khi xử lý chatbot API:', error);
    return new Response(JSON.stringify({ error: 'Đã xảy ra lỗi khi kết nối với AI Trợ lý: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
