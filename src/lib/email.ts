import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingEmailData {
    vendorName: string;
    vendorEmail?: string;
    clientName: string;
    clientEmail?: string;
    serviceName: string;
    price: number;
    startTime: string;
    duration: number;
}

export async function sendBookingConfirmationToClient(data: BookingEmailData) {
    if (!data.clientEmail) return null;

    try {
        const { data: emailData, error } = await resend.emails.send({
            from: 'AI-Booking <noreply@aibooking.me>',
            to: [data.clientEmail],
            subject: `Подтверждение записи - ${data.serviceName}`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .detail { margin: 15px 0; padding: 15px; background: #f3f4f6; border-radius: 6px; }
              .label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
              .value { font-size: 1.1em; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 0.9em; }
              .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Запись подтверждена!</h1>
              </div>
              <div class="content">
                <p>Здравствуйте, <strong>${data.clientName}</strong>!</p>
                <p>Ваша запись успешно создана. Мы ждем вас!</p>
                
                <div class="card">
                  <h2 style="margin-top: 0; color: #667eea;">Детали записи</h2>
                  
                  <div class="detail">
                    <div class="label">📅 Дата и время</div>
                    <div class="value">${new Date(data.startTime).toLocaleString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</div>
                  </div>

                  <div class="detail">
                    <div class="label">💼 Услуга</div>
                    <div class="value">${data.serviceName}</div>
                  </div>

                  <div class="detail">
                    <div class="label">⏱️ Длительность</div>
                    <div class="value">${data.duration} минут</div>
                  </div>

                  <div class="detail">
                    <div class="label">💰 Стоимость</div>
                    <div class="value">${data.price}₽</div>
                  </div>

                  <div class="detail">
                    <div class="label">📍 Мастер</div>
                    <div class="value">${data.vendorName}</div>
                  </div>
                </div>

                <div style="text-align: center;">
                  <p style="color: #6b7280;">Если у вас есть вопросы, свяжитесь с мастером напрямую.</p>
                </div>

                <div class="footer">
                  <p>Это письмо было отправлено автоматически, пожалуйста, не отвечайте на него.</p>
                  <p>© 2026 AI-Booking. Все права защищены.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
        });

        if (error) {
            console.error('Error sending client email:', error);
            return null;
        }

        return emailData;
    } catch (error) {
        console.error('Error sending client email:', error);
        return null;
    }
}

export async function sendBookingNotificationToVendor(data: BookingEmailData) {
    if (!data.vendorEmail) return null;

    try {
        const { data: emailData, error } = await resend.emails.send({
            from: 'AI-Booking <noreply@aibooking.me>',
            to: [data.vendorEmail],
            subject: `🔔 Новая запись - ${data.serviceName}`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .detail { margin: 15px 0; padding: 15px; background: #f3f4f6; border-radius: 6px; }
              .label { font-weight: bold; color: #10b981; margin-bottom: 5px; }
              .value { font-size: 1.1em; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 0.9em; }
              .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔔 У вас новая запись!</h1>
              </div>
              <div class="content">
                <p>Добрый день!</p>
                <p>Клиент записался на услугу через вашу страницу бронирования.</p>
                
                <div class="card">
                  <h2 style="margin-top: 0; color: #10b981;">Информация о записи</h2>
                  
                  <div class="detail">
                    <div class="label">👤 Клиент</div>
                    <div class="value">${data.clientName}</div>
                  </div>

                  ${data.clientEmail ? `
                    <div class="detail">
                      <div class="label">📧 Email</div>
                      <div class="value">${data.clientEmail}</div>
                    </div>
                  ` : ''}

                  <div class="detail">
                    <div class="label">📅 Дата и время</div>
                    <div class="value">${new Date(data.startTime).toLocaleString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</div>
                  </div>

                  <div class="detail">
                    <div class="label">💼 Услуга</div>
                    <div class="value">${data.serviceName}</div>
                  </div>

                  <div class="detail">
                    <div class="label">💰 Стоимость</div>
                    <div class="value">${data.price}₽</div>
                  </div>
                </div>

                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/calendar" class="button">
                    Открыть календарь
                  </a>
                </div>

                <div class="footer">
                  <p>© 2026 AI-Booking. Все права защищены.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
        });

        if (error) {
            console.error('Error sending vendor email:', error);
            return null;
        }

        return emailData;
    } catch (error) {
        console.error('Error sending vendor email:', error);
        return null;
    }
}
