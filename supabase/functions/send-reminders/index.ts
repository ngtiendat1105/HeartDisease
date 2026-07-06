import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8"

serve(async (req) => {
  // 1. Kiểm tra phương thức HTTP (chỉ chấp nhận GET để chạy Cron)
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // 2. Bảo mật: Xác thực qua Query Parameter 'secret'
    const url = new URL(req.url)
    const secret = url.searchParams.get('secret')
    const expectedSecret = Deno.env.get('CRON_SECRET')

    console.log(`[Bảo mật] Nhận yêu cầu kích hoạt Cron...`)

    if (!secret || secret !== expectedSecret) {
      console.warn('[Edge Function] Cảnh báo: Truy cập trái phép bị chặn.')
      return new Response(JSON.stringify({ error: 'Unauthorized access' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const now = new Date().toISOString()
    console.log(`[Edge Function] Bắt đầu quét lịch nhắc nhở lúc: ${now}`)

    // 3. Khởi tạo Supabase Client nội bộ (sử dụng service role key để bypass RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    // 4. Lấy danh sách lịch nhắc nhở chưa gửi và đã đến hạn gửi
    const { data: reminders, error: selectError } = await supabaseAdmin
      .from('email_reminders')
      .select('*')
      .eq('is_sent', false)
      .lte('remind_at', now)

    if (selectError) {
      console.error('[Edge Function] Lỗi truy vấn database:', selectError)
      throw selectError
    }

    console.log(`[Edge Function] Phát hiện ${reminders?.length || 0} email cần gửi.`)

    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'Không có email nào cần gửi.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('[Edge Function] Chưa cấu hình RESEND_API_KEY.')
      return new Response(JSON.stringify({ error: 'Resend API Key is missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const processedResults = []

    // 5. Gửi email qua Resend API cho từng bản ghi
    for (const reminder of reminders) {
      const dateFormatted = new Date(reminder.remind_at).toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })

      const isMedication = reminder.reminder_type === 'medication'
      const subject = isMedication 
        ? '💊 Nhắc nhở uống thuốc định kỳ - HeartDisease AI'
        : '📅 Nhắc nhở lịch khám bệnh - HeartDisease AI'

      // Thiết kế template email HTML/CSS inline chuyên nghiệp với tone màu Trắng - Đỏ chủ đạo
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f7f9fa; margin: 0; padding: 20px; color: #333333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e1e8ed;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #e11d48, #be123c); padding: 30px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; font-weight: 900;">
                HeartDisease <span style="color: #ffe4e6;">AI</span>
              </h1>
              <p style="margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; color: #ffe4e6; opacity: 0.9;">
                Trợ lý chăm sóc sức khỏe tim mạch
              </p>
            </div>
            
            <!-- Body -->
            <div style="padding: 30px; line-height: 1.6;">
              <p style="font-size: 15px; margin-top: 0;">Xin chào,</p>
              <p style="font-size: 15px;">Hệ thống chăm sóc sức khỏe <strong>HeartDisease AI</strong> gửi đến bạn thông báo nhắc nhở y tế định kỳ:</p>
              
              <!-- Card thông tin nhắc nhở -->
              <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 20px; margin: 25px 0;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <span style="font-size: 20px; margin-right: 8px;">${isMedication ? '💊' : '📅'}</span>
                  <span style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #be123c;">
                    ${isMedication ? 'Lịch uống thuốc' : 'Lịch khám bệnh'}
                  </span>
                </div>
                <div style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 10px; line-height: 1.4;">
                  ${reminder.content}
                </div>
                <div style="font-size: 13px; color: #64748b; font-weight: 500;">
                  ⏰ Thời gian hẹn: <span style="color: #be123c; font-weight: 700;">${dateFormatted} (Giờ Việt Nam)</span>
                </div>
              </div>
              
              <p style="font-size: 14px; color: #475569;">Vui lòng thực hiện đúng theo các chỉ dẫn y khoa của bác sĩ để bảo vệ tốt nhất cho sức khỏe tim mạch của bạn.</p>
              
              <hr style="border: 0; border-top: 1px dashed #e2e8f0; margin: 25px 0;" />
              
              <!-- Chữ ký -->
              <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
                Trân trọng,<br>
                <strong>Ban điều hành ứng dụng HeartDisease AI</strong>
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0; font-weight: bold; text-transform: uppercase;">Đây là email gửi tự động từ hệ thống HeartDisease AI.</p>
              <p style="margin: 5px 0 0 0;">Vui lòng không phản hồi lại email này. Để được tư vấn, hãy trao đổi trực tiếp với Trợ lý sức khỏe AI trên trang web của chúng tôi.</p>
            </div>
          </div>
        </body>
        </html>
      `

      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'HeartDisease AI <onboarding@resend.dev>', // Resend miễn phí yêu cầu gửi từ domain này
            to: [reminder.email],
            subject: subject,
            html: emailHtml,
          }),
        })

        const resData = await response.json()

        if (!response.ok) {
          console.error(`[Edge Function] Bắn mail qua Resend thất bại cho email ${reminder.email}:`, resData)
          processedResults.push({ id: reminder.id, status: 'failed', error: resData })
          continue
        }

        // Cập nhật trạng thái đã gửi trong database
        const { error: updateError } = await supabaseAdmin
          .from('email_reminders')
          .update({ is_sent: true })
          .eq('id', reminder.id)

        if (updateError) {
          console.error(`[Edge Function] Lỗi cập nhật trạng thái is_sent cho ID ${reminder.id}:`, updateError)
          processedResults.push({ id: reminder.id, status: 'db_update_failed', error: updateError })
        } else {
          console.log(`[Edge Function] Đã gửi thành công email nhắc nhở ID ${reminder.id} đến ${reminder.email}`)
          processedResults.push({ id: reminder.id, status: 'success' })
        }
      } catch (err: any) {
        console.error(`[Edge Function] Lỗi khi gọi API Resend cho reminder ${reminder.id}:`, err)
        processedResults.push({ id: reminder.id, status: 'error', error: err.message })
      }
    }

    return new Response(JSON.stringify({ success: true, processed: processedResults }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('[Edge Function] Lỗi hệ thống:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
