import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  try {
    const now = new Date().toISOString();

    // 1. Truy vấn các bản ghi chưa gửi và đến hạn nhắc (remind_at <= now)
    const { data: reminders, error: selectError } = await supabaseAdmin
      .from('reminders')
      .select('*')
      .eq('is_sent', false)
      .lte('remind_at', now);

    if (selectError) {
      console.error('Lỗi truy vấn reminders đến hạn từ Supabase:', selectError);
      throw selectError;
    }

    if (!reminders || reminders.length === 0) {
      return NextResponse.json({ success: true, message: 'Không có lịch nhắc nhở nào cần xử lý.' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('Không tìm thấy cấu hình TELEGRAM_BOT_TOKEN.');
      return NextResponse.json({ error: 'Cấu hình Telegram Bot chưa được thiết lập.' }, { status: 500 });
    }

    const processedResults = [];

    // 2. Lặp qua từng nhắc nhở và gửi tin nhắn qua Telegram Bot API
    for (const reminder of reminders) {
      const dateFormatted = new Date(reminder.remind_at).toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      let messageText = '';
      if (reminder.reminder_type === 'medication') {
        messageText = `💊 *NHẮC NHỞ UỐNG THUỐC* 💊\n\n` +
          `🔔 *Nội dung:* ${reminder.content}\n` +
          `⏰ *Thời gian uống thuốc:* ${dateFormatted}\n\n` +
          `🏥 _Chúc bạn luôn dồi dào sức khỏe!_\n` +
          `✍️ _Trợ lý tim mạch HeartDisease AI_`;
      } else if (reminder.reminder_type === 'appointment') {
        messageText = `📅 *NHẮC NHỞ LỊCH KHÁM BỆNH* 📅\n\n` +
          `🔔 *Nội dung khám:* ${reminder.content}\n` +
          `⏰ *Thời gian khám:* ${dateFormatted}\n\n` +
          `🏥 _Chúc bạn luôn dồi dào sức khỏe!_\n` +
          `✍️ _Trợ lý tim mạch HeartDisease AI_`;
      }

      try {
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: reminder.telegram_chat_id,
            text: messageText,
            parse_mode: 'Markdown',
          }),
        });

        const resData = await response.json();

        if (!response.ok || !resData.ok) {
          console.error(`Gửi Telegram thất bại cho chat_id ${reminder.telegram_chat_id}:`, resData);
          processedResults.push({ id: reminder.id, status: 'failed', error: resData });
          continue;
        }

        // 3. Đánh dấu is_sent = true để tránh gửi lặp lại
        const { error: updateError } = await supabaseAdmin
          .from('reminders')
          .update({ is_sent: true })
          .eq('id', reminder.id);

        if (updateError) {
          console.error(`Lỗi cập nhật trạng thái is_sent cho ID ${reminder.id}:`, updateError);
          processedResults.push({ id: reminder.id, status: 'telegram_sent_but_db_update_failed', error: updateError });
        } else {
          processedResults.push({ id: reminder.id, status: 'success' });
        }
      } catch (sendErr: any) {
        console.error(`Lỗi khi gọi API Telegram cho reminder ${reminder.id}:`, sendErr);
        processedResults.push({ id: reminder.id, status: 'error', error: sendErr.message });
      }
    }

    return NextResponse.json({ success: true, processed: processedResults });
  } catch (error: any) {
    console.error('Lỗi API Cron Job GET:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi hệ thống khi xử lý gửi nhắc nhở: ' + error.message },
      { status: 500 }
    );
  }
}
