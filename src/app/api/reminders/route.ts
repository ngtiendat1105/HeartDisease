import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Khởi tạo client dùng service role key để có quyền bypass RLS an toàn từ backend, fall back về anon key nếu không có
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { telegramChatId, reminderType, content, remindAt } = body;

    // Kiểm tra dữ liệu đầu vào (Validation)
    if (!telegramChatId || !reminderType || !content || !remindAt) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc. Vui lòng điền đầy đủ các trường.' },
        { status: 400 }
      );
    }

    if (reminderType !== 'medication' && reminderType !== 'appointment') {
      return NextResponse.json(
        { error: 'Loại nhắc nhở không hợp lệ.' },
        { status: 400 }
      );
    }

    // Chèn dữ liệu vào bảng reminders trên Supabase
    const { data, error } = await supabaseAdmin
      .from('reminders')
      .insert([
        {
          telegram_chat_id: telegramChatId.toString(),
          reminder_type: reminderType,
          content: content,
          remind_at: new Date(remindAt).toISOString(),
          is_sent: false,
        },
      ])
      .select();

    if (error) {
      console.error('Lỗi khi chèn dữ liệu reminders vào Supabase:', error);
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Lỗi API Reminders POST:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi hệ thống khi đặt lịch nhắc nhở: ' + error.message },
      { status: 500 }
    );
  }
}
