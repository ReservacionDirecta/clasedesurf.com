import { Resend } from 'resend';

export class EmailService {
  private static instance: EmailService;
  private resend: Resend;
  private fromEmail: string;
  private frontendUrl: string;

  private constructor() {
    const apiKey = process.env.RESEND_API_KEY || 're_PLV9kWJ4_5SsqnA3rhLNweBr6QU64xpeg';
    if (!apiKey) {
      console.warn('⚠️ RESEND_API_KEY is not defined. Email sending will be disabled.');
    }
    this.resend = new Resend(apiKey);
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'info@clasedesurf.com';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private getBaseTemplate(title: string, content: string, schoolName: string = 'ClaseDeSurf.com', color: string = '#667eea') {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background: ${color}; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1>
          </div>
          
          <div style="padding: 30px; background: #ffffff;">
            ${content}
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} ${schoolName}. Todos los derechos reservados.
            </p>
            <p style="color: #999; font-size: 11px; margin-top: 10px;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </div>
    `;
  }

  async sendEmail(to: string, subject: string, html: string, text?: string) {
    try {
      if (!process.env.RESEND_API_KEY) {
        // Fallback or skip if strictly needed, but we have a default above
      }

      console.log(`📧 Sending email to ${to} [${subject}]`);

      const data = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
        text
      });

      console.log('✅ Email sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error sending email via Resend:', error);
      return { success: false, error };
    }
  }

  // 1. Registro (Welcome)
  async sendWelcomeEmail(to: string, name: string, schoolName: string = 'Escuela de Surf') {
    const subject = `¡Bienvenido a ${schoolName}!`;
    const content = `
      <h2 style="color: #333; margin-top: 0;">Hola ${name},</h2>
      <p style="color: #666; line-height: 1.6;">
        ¡Gracias por registrarte en <strong>${schoolName}</strong>! Estamos emocionados de tenerte como parte de nuestra comunidad.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${this.frontendUrl}/login" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Iniciar Sesión
        </a>
      </div>

       <p style="color: #666; font-size: 14px;">
        Explora nuestros horarios, instructores y reserva tu próxima clase de surf hoy mismo.
      </p>
    `;

    return this.sendEmail(to, subject, this.getBaseTemplate(schoolName, content, schoolName));
  }

  // 2. Recuperación de Contraseña
  async sendPasswordReset(to: string, name: string, resetToken: string) {
    const subject = 'Recuperación de Contraseña';
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${resetToken}`;
    const content = `
      <h2 style="color: #333; margin-top: 0;">Hola ${name},</h2>
      <p style="color: #666; line-height: 1.6;">
        Recibimos una solicitud para restablecer tu contraseña. Si no fuiste tú, puedes ignorar este correo.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Restablecer Contraseña
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">
        Este enlace expirará en 1 hora por seguridad.
      </p>
    `;

    return this.sendEmail(to, subject, this.getBaseTemplate('Recuperar Contraseña', content, undefined, '#ef4444'));
  }

  // 3. Confirmación de Reserva
  async sendReservationConfirmed(to: string, userName: string, className: string, date: string, time: string, instructor: string, schoolName: string) {
    const subject = `Reserva Confirmada: ${className}`;
    const content = `
      <h2 style="color: #333; margin-top: 0;">¡Tu clase está confirmada! 🏄‍♂️</h2>
      <p style="color: #666;">Hola ${userName}, tu reserva ha sido confirmada exitosamente.</p>
      
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
        <p style="margin: 5px 0;"><strong>Clase:</strong> ${className}</p>
        <p style="margin: 5px 0;"><strong>Fecha:</strong> ${date}</p>
        <p style="margin: 5px 0;"><strong>Hora:</strong> ${time}</p>
        <p style="margin: 5px 0;"><strong>Instructor:</strong> ${instructor}</p>
        <p style="margin: 5px 0;"><strong>Escuela:</strong> ${schoolName}</p>
      </div>

      <p style="color: #666; font-size: 14px;">
        Te esperamos 15 minutos antes para prepararte. ¡Nos vemos en las olas!
      </p>
    `;

    return this.sendEmail(to, subject, this.getBaseTemplate('Reserva Confirmada', content, schoolName, '#22c55e'));
  }

  // 4. Cancelación de Reserva
  async sendReservationCancelled(to: string, userName: string, className: string, date: string, schoolName: string) {
    const subject = `Reserva Cancelada: ${className}`;
    const content = `
      <h2 style="color: #333; margin-top: 0;">Reserva Cancelada</h2>
      <p style="color: #666;">Hola ${userName}, te informamos que la siguiente reserva ha sido cancelada:</p>
      
      <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
        <p style="margin: 5px 0;"><strong>Clase:</strong> ${className}</p>
        <p style="margin: 5px 0;"><strong>Fecha:</strong> ${date}</p>
        <p style="margin: 5px 0;"><strong>Estado:</strong> <span style="color: #ef4444; font-weight: bold;">CANCELADA</span></p>
      </div>

      <p style="color: #666; font-size: 14px;">
        Si tienes dudas sobre el reembolso o reprogramación, por favor contáctanos.
      </p>
    `;

    return this.sendEmail(to, subject, this.getBaseTemplate('Cancelación', content, schoolName, '#ef4444'));
  }

  // 5. Reprogramación (Cambio)
  async sendReservationChanged(to: string, userName: string, className: string, oldDate: string, newDate: string, newTime: string, schoolName: string) {
    const subject = `Cambio en tu Reserva: ${className}`;
    const content = `
      <h2 style="color: #333; margin-top: 0;">Tu reserva ha sido modificada</h2>
      <p style="color: #666;">Hola ${userName}, tu clase ha sido reprogramada.</p>
      
      <div style="background: #fff7ed; border: 1px solid #fed7aa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
        <p style="margin: 5px 0; color: #999; text-decoration: line-through;">Fecha anterior: ${oldDate}</p>
        <hr style="border: 0; border-top: 1px dashed #fed7aa; margin: 10px 0;">
        <p style="margin: 5px 0;"><strong>Nueva Fecha:</strong> ${newDate}</p>
        <p style="margin: 5px 0;"><strong>Nueva Hora:</strong> ${newTime}</p>
        <p style="margin: 5px 0;"><strong>Clase:</strong> ${className}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${this.frontendUrl}/dashboard" style="background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Ver en Dashboard
        </a>
      </div>
    `;

    return this.sendEmail(to, subject, this.getBaseTemplate('Reserva Modificada', content, schoolName, '#f97316'));
  }

  // 6. Confirmación de Pago
  async sendPaymentConfirmation(to: string, userName: string, amount: number, currency: string, concept: string, transactionId: string, schoolName: string) {
    const subject = `Pago Recibido: ${currency} ${amount}`;
    const content = `
      <h2 style="color: #333; margin-top: 0;">¡Pago Exitoso!</h2>
      <p style="color: #666;">Hola ${userName}, hemos recibido tu pago correctamente.</p>
      
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
        <p style="margin: 5px 0; font-size: 24px; color: #16a34a; font-weight: bold;">${currency} ${amount.toFixed(2)}</p>
        <p style="margin: 10px 0 5px;"><strong>Concepto:</strong> ${concept}</p>
        <p style="margin: 5px 0;"><strong>ID Transacción:</strong> <span style="font-family: monospace;">${transactionId}</span></p>
        <p style="margin: 5px 0;"><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      <p style="color: #666; font-size: 14px;">
        Gracias por tu confianza.
      </p>
    `;

    return this.sendEmail(to, subject, this.getBaseTemplate('Pago Confirmado', content, schoolName, '#16a34a'));
  }

  // 7. Check-in Reminder (8pm día anterior)
  async sendCheckInReminder(to: string, userName: string, className: string, date: string, time: string, schoolName: string) {
    const subject = `Recordatorio: Clase de Surf Mañana`;
    const content = `
      <h2 style="color: #333; margin-top: 0;">¡Mañana es el día! 🌊</h2>
      <p style="color: #666;">Hola ${userName}, este es un recordatorio para tu clase de mañana.</p>
      
      <div style="background: #e0f2fe; border: 1px solid #bae6fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
        <p style="margin: 5px 0;"><strong>Clase:</strong> ${className}</p>
        <p style="margin: 5px 0;"><strong>Horario:</strong> ${time}</p>
        <p style="margin: 5px 0;"><strong>Fecha:</strong> ${date}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${this.frontendUrl}/checkin" style="background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Confirmar Asistencia (Check-in)
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">
        Recuerda traer tu ropa de baño, toalla y protector solar. ¡Nosotros ponemos la tabla y el wetsuit!
      </p>
    `;

    return this.sendEmail(to, subject, this.getBaseTemplate('Recordatorio de Clase', content, schoolName, '#0ea5e9'));
  }
}

export const emailService = EmailService.getInstance();
