import { Resend } from 'resend';

// Inicializar Resend solo si hay API key
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'info@clasedesurf.com';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private static async sendEmail({ to, subject, html }: EmailOptions) {
    // Si no hay API key configurada, solo loguear y retornar
    if (!resend) {
      console.warn('[EmailService] Resend API key not configured. Email not sent:', {
        to,
        subject,
        note: 'Add RESEND_API_KEY to your .env file to enable email sending'
      });
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const data = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      });

      console.log('Email sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }
  }

  // Email de bienvenida al registrarse
  static async sendWelcomeEmail(to: string, userName: string) {
    const subject = '¡Bienvenido a Clase de Surf!';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏄‍♂️ ¡Bienvenido a Clase de Surf!</h1>
            </div>
            <div class="content">
              <h2>Hola ${userName},</h2>
              <p>¡Gracias por registrarte en Clase de Surf! Estamos emocionados de tenerte con nosotros.</p>
              <p>Ahora puedes:</p>
              <ul>
                <li>Explorar nuestras clases disponibles</li>
                <li>Hacer reservas fácilmente</li>
                <li>Gestionar tus clases desde tu dashboard</li>
                <li>Recibir notificaciones sobre tus reservas</li>
              </ul>
              <p>¡Prepárate para surfear las mejores olas!</p>
              <a href="${process.env.FRONTEND_URL || 'https://clasedesurf.com'}" class="button">Explorar Clases</a>
            </div>
            <div class="footer">
              <p>Clase de Surf - Tu escuela de surf de confianza</p>
              <p>Si tienes alguna pregunta, contáctanos en info@clasedesurf.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  // Email de confirmación de reserva
  static async sendBookingConfirmation(
    to: string,
    userName: string,
    bookingDetails: {
      className: string;
      date: string;
      time: string;
      location: string;
      price: number;
      bookingId: string;
    }
  ) {
    const subject = `Reserva confirmada - ${bookingDetails.className}`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #667eea; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ ¡Reserva Confirmada!</h1>
            </div>
            <div class="content">
              <h2>Hola ${userName},</h2>
              <p>Tu reserva ha sido confirmada exitosamente. ¡Nos vemos en las olas!</p>
              
              <div class="booking-details">
                <h3>Detalles de tu reserva:</h3>
                <div class="detail-row">
                  <span class="detail-label">Clase:</span>
                  <span>${bookingDetails.className}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Fecha:</span>
                  <span>${bookingDetails.date}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Hora:</span>
                  <span>${bookingDetails.time}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Ubicación:</span>
                  <span>${bookingDetails.location}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Precio:</span>
                  <span>S/ ${bookingDetails.price.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">ID de Reserva:</span>
                  <span>${bookingDetails.bookingId}</span>
                </div>
              </div>
              
              <p><strong>Importante:</strong></p>
              <ul>
                <li>Llega 15 minutos antes de la clase</li>
                <li>Trae protector solar y una toalla</li>
                <li>Si necesitas cancelar, hazlo con al menos 24 horas de anticipación</li>
              </ul>
              
              <a href="${process.env.FRONTEND_URL || 'https://clasedesurf.com'}/dashboard/bookings" class="button">Ver mis Reservas</a>
            </div>
            <div class="footer">
              <p>Clase de Surf - Tu escuela de surf de confianza</p>
              <p>Si tienes alguna pregunta, contáctanos en info@clasedesurf.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  // Email de cancelación de reserva
  static async sendBookingCancellation(
    to: string,
    userName: string,
    bookingDetails: {
      className: string;
      date: string;
      bookingId: string;
      refundAmount?: number;
    }
  ) {
    const subject = `Reserva cancelada - ${bookingDetails.className}`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #f5576c; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Reserva Cancelada</h1>
            </div>
            <div class="content">
              <h2>Hola ${userName},</h2>
              <p>Tu reserva ha sido cancelada.</p>
              
              <div class="booking-details">
                <h3>Detalles de la reserva cancelada:</h3>
                <div class="detail-row">
                  <span class="detail-label">Clase:</span>
                  <span>${bookingDetails.className}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Fecha:</span>
                  <span>${bookingDetails.date}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">ID de Reserva:</span>
                  <span>${bookingDetails.bookingId}</span>
                </div>
                ${bookingDetails.refundAmount ? `
                <div class="detail-row">
                  <span class="detail-label">Reembolso:</span>
                  <span>S/ ${bookingDetails.refundAmount.toFixed(2)}</span>
                </div>
                ` : ''}
              </div>
              
              ${bookingDetails.refundAmount ? '<p>El reembolso será procesado en los próximos 5-7 días hábiles.</p>' : ''}
              
              <p>¡Esperamos verte pronto en otra clase!</p>
              
              <a href="${process.env.FRONTEND_URL || 'https://clasedesurf.com'}" class="button">Explorar Otras Clases</a>
            </div>
            <div class="footer">
              <p>Clase de Surf - Tu escuela de surf de confianza</p>
              <p>Si tienes alguna pregunta, contáctanos en info@clasedesurf.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  // Email de confirmación de pago
  static async sendPaymentConfirmation(
    to: string,
    userName: string,
    paymentDetails: {
      amount: number;
      paymentMethod: string;
      transactionId: string;
      bookingId: string;
      className: string;
    }
  ) {
    const subject = `Pago confirmado - ${paymentDetails.className}`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .payment-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #11998e; }
            .total { font-size: 24px; color: #11998e; font-weight: bold; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💳 ¡Pago Confirmado!</h1>
            </div>
            <div class="content">
              <h2>Hola ${userName},</h2>
              <p>Hemos recibido tu pago exitosamente.</p>
              
              <div class="payment-details">
                <h3>Detalles del pago:</h3>
                <div class="detail-row">
                  <span class="detail-label">Clase:</span>
                  <span>${paymentDetails.className}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Método de pago:</span>
                  <span>${paymentDetails.paymentMethod}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">ID de Transacción:</span>
                  <span>${paymentDetails.transactionId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">ID de Reserva:</span>
                  <span>${paymentDetails.bookingId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Total:</span>
                  <span class="total">S/ ${paymentDetails.amount.toFixed(2)}</span>
                </div>
              </div>
              
              <p>Guarda este email como comprobante de tu pago.</p>
              
              <a href="${process.env.FRONTEND_URL || 'https://clasedesurf.com'}/dashboard/bookings" class="button">Ver mi Reserva</a>
            </div>
            <div class="footer">
              <p>Clase de Surf - Tu escuela de surf de confianza</p>
              <p>Si tienes alguna pregunta, contáctanos en info@clasedesurf.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  // Email de restablecimiento de contraseña
  static async sendPasswordResetEmail(to: string, userName: string, resetToken: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'https://clasedesurf.com'}/reset-password?token=${resetToken}`;
    const subject = 'Restablece tu contraseña - Clase de Surf';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Restablece tu Contraseña</h1>
            </div>
            <div class="content">
              <h2>Hola ${userName},</h2>
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Clase de Surf.</p>
              
              <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
              
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul>
                  <li>Este enlace expirará en 1 hora</li>
                  <li>Si no solicitaste este cambio, ignora este email</li>
                  <li>Tu contraseña actual seguirá funcionando hasta que establezcas una nueva</li>
                </ul>
              </div>
              
              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href="${resetUrl}">${resetUrl}</a>
              </p>
            </div>
            <div class="footer">
              <p>Clase de Surf - Tu escuela de surf de confianza</p>
              <p>Si tienes alguna pregunta, contáctanos en info@clasedesurf.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  // Email de recordatorio de clase (24 horas antes)
  static async sendClassReminder(
    to: string,
    userName: string,
    classDetails: {
      className: string;
      date: string;
      time: string;
      location: string;
    }
  ) {
    const subject = `Recordatorio: Tu clase de ${classDetails.className} es mañana`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .class-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #fa709a; }
            .checklist { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ ¡Tu clase es mañana!</h1>
            </div>
            <div class="content">
              <h2>Hola ${userName},</h2>
              <p>Este es un recordatorio amistoso de que tu clase de surf es mañana. ¡Prepárate para las olas!</p>
              
              <div class="class-details">
                <h3>Detalles de tu clase:</h3>
                <div class="detail-row">
                  <span class="detail-label">Clase:</span>
                  <span>${classDetails.className}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Fecha:</span>
                  <span>${classDetails.date}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Hora:</span>
                  <span>${classDetails.time}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Ubicación:</span>
                  <span>${classDetails.location}</span>
                </div>
              </div>
              
              <div class="checklist">
                <h3>✅ Checklist para tu clase:</h3>
                <ul>
                  <li>Protector solar (factor 50+)</li>
                  <li>Toalla</li>
                  <li>Ropa de baño</li>
                  <li>Agua para mantenerte hidratado</li>
                  <li>Llega 15 minutos antes</li>
                </ul>
              </div>
              
              <p>¡Nos vemos en la playa! 🏄‍♂️</p>
              
              <a href="${process.env.FRONTEND_URL || 'https://clasedesurf.com'}/dashboard/bookings" class="button">Ver mi Reserva</a>
            </div>
            <div class="footer">
              <p>Clase de Surf - Tu escuela de surf de confianza</p>
              <p>Si tienes alguna pregunta, contáctanos en info@clasedesurf.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }
}
