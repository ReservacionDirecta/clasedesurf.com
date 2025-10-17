// Email service for sending automated notifications
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    encoding: string;
  }>;
}

export interface PaymentInstructions {
  method: string;
  provider: string;
  amount: number;
  currency: string;
  instructions: string;
  qrCode?: string;
  bankAccount?: string;
  reference?: string;
  expiresAt?: Date;
}

export class EmailService {
  private static instance: EmailService;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // Plantillas de email predefinidas
  private templates: Record<string, EmailTemplate> = {
    REGISTRATION_WELCOME: {
      id: 'REGISTRATION_WELCOME',
      name: 'Bienvenida al Registrarse',
      subject: '¡Bienvenido a {{schoolName}}! - Instrucciones de Pago',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">¡Bienvenido a {{schoolName}}!</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333;">Hola {{userName}},</h2>
            <p style="color: #666; line-height: 1.6;">
              ¡Gracias por registrarte en nuestra escuela de surf! Estamos emocionados de tenerte como parte de nuestra comunidad.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">Instrucciones de Pago</h3>
              <p style="color: #666;">Para completar tu reservación, por favor realiza el pago siguiendo estas instrucciones:</p>
              {{paymentInstructions}}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{dashboardUrl}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Ir a Mi Dashboard
              </a>
            </div>
          </div>
          
          {{footer}}
        </div>
      `,
      textContent: `
        ¡Bienvenido a {{schoolName}}!
        
        Hola {{userName}},
        
        ¡Gracias por registrarte en nuestra escuela de surf! Estamos emocionados de tenerte como parte de nuestra comunidad.
        
        Instrucciones de Pago:
        {{paymentInstructionsText}}
        
        Visita tu dashboard: {{dashboardUrl}}
        
        {{footerText}}
      `,
      variables: ['schoolName', 'userName', 'paymentInstructions', 'paymentInstructionsText', 'dashboardUrl', 'footer', 'footerText']
    },

    RESERVATION_CONFIRMED: {
      id: 'RESERVATION_CONFIRMED',
      name: 'Confirmación de Reserva',
      subject: 'Reserva Confirmada - {{className}} en {{schoolName}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">¡Reserva Confirmada!</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333;">Hola {{userName}},</h2>
            <p style="color: #666; line-height: 1.6;">
              ¡Excelente! Tu reserva ha sido confirmada. Aquí tienes todos los detalles:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #48bb78;">
              <h3 style="color: #333; margin-top: 0;">Detalles de tu Clase</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Clase:</td>
                  <td style="padding: 8px 0; color: #333;">{{className}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Fecha:</td>
                  <td style="padding: 8px 0; color: #333;">{{classDate}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Hora:</td>
                  <td style="padding: 8px 0; color: #333;">{{classTime}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Instructor:</td>
                  <td style="padding: 8px 0; color: #333;">{{instructor}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Ubicación:</td>
                  <td style="padding: 8px 0; color: #333;">{{location}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Precio:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: bold;">$\{{amount}}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #e6fffa; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #234e52; margin: 0; font-weight: bold;">
                💡 Recuerda llegar 15 minutos antes de la clase para el check-in.
              </p>
            </div>
          </div>
          
          {{footer}}
        </div>
      `,
      textContent: `
        ¡Reserva Confirmada!
        
        Hola {{userName}},
        
        ¡Excelente! Tu reserva ha sido confirmada. Aquí tienes todos los detalles:
        
        Detalles de tu Clase:
        - Clase: {{className}}
        - Fecha: {{classDate}}
        - Hora: {{classTime}}
        - Instructor: {{instructor}}
        - Ubicación: {{location}}
        - Precio: $\{{amount}}
        
        Recuerda llegar 15 minutos antes de la clase para el check-in.
        
        {{footerText}}
      `,
      variables: ['userName', 'className', 'classDate', 'classTime', 'instructor', 'location', 'amount', 'footer', 'footerText']
    },

    RESERVATION_CANCELLED: {
      id: 'RESERVATION_CANCELLED',
      name: 'Cancelación de Reserva',
      subject: 'Reserva Cancelada - {{className}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Reserva Cancelada</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333;">Hola {{userName}},</h2>
            <p style="color: #666; line-height: 1.6;">
              Lamentamos informarte que tu reserva ha sido cancelada. Aquí tienes los detalles:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f56565;">
              <h3 style="color: #333; margin-top: 0;">Reserva Cancelada</h3>
              <p><strong>Clase:</strong> {{className}}</p>
              <p><strong>Fecha:</strong> {{classDate}}</p>
              <p><strong>Motivo:</strong> {{cancellationReason}}</p>
            </div>
            
            {{refundInfo}}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{bookingUrl}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Ver Otras Clases
              </a>
            </div>
          </div>
          
          {{footer}}
        </div>
      `,
      textContent: `
        Reserva Cancelada
        
        Hola {{userName}},
        
        Lamentamos informarte que tu reserva ha sido cancelada. Aquí tienes los detalles:
        
        Reserva Cancelada:
        - Clase: {{className}}
        - Fecha: {{classDate}}
        - Motivo: {{cancellationReason}}
        
        {{refundInfoText}}
        
        Ver otras clases: {{bookingUrl}}
        
        {{footerText}}
      `,
      variables: ['userName', 'className', 'classDate', 'cancellationReason', 'refundInfo', 'refundInfoText', 'bookingUrl', 'footer', 'footerText']
    },

    RESERVATION_CHANGED: {
      id: 'RESERVATION_CHANGED',
      name: 'Cambio de Reserva',
      subject: 'Cambio en tu Reserva - {{className}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Cambio en tu Reserva</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333;">Hola {{userName}},</h2>
            <p style="color: #666; line-height: 1.6;">
              Te informamos que ha habido un cambio en tu reserva. Aquí tienes los nuevos detalles:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ed8936;">
              <h3 style="color: #333; margin-top: 0;">Nuevos Detalles</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Clase:</td>
                  <td style="padding: 8px 0; color: #333;">{{className}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Nueva Fecha:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: bold;">{{newDate}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Nueva Hora:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: bold;">{{newTime}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Instructor:</td>
                  <td style="padding: 8px 0; color: #333;">{{instructor}}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #fef5e7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #744210; margin: 0;">
                <strong>Motivo del cambio:</strong> {{changeReason}}
              </p>
            </div>
          </div>
          
          {{footer}}
        </div>
      `,
      textContent: `
        Cambio en tu Reserva
        
        Hola {{userName}},
        
        Te informamos que ha habido un cambio en tu reserva. Aquí tienes los nuevos detalles:
        
        Nuevos Detalles:
        - Clase: {{className}}
        - Nueva Fecha: {{newDate}}
        - Nueva Hora: {{newTime}}
        - Instructor: {{instructor}}
        
        Motivo del cambio: {{changeReason}}
        
        {{footerText}}
      `,
      variables: ['userName', 'className', 'newDate', 'newTime', 'instructor', 'changeReason', 'footer', 'footerText']
    }
  };

  // Generar instrucciones de pago según el método
  generatePaymentInstructions(paymentData: PaymentInstructions): { html: string; text: string } {
    const { method, provider, amount, currency, instructions, qrCode, bankAccount, reference } = paymentData;

    let html = '';
    let text = '';

    switch (method) {
      case 'YAPE':
        html = `
          <div style="text-align: center; margin: 20px 0;">
            <h4 style="color: #8b5cf6;">💜 Pago con Yape</h4>
            <p>Escanea el código QR o envía a:</p>
            ${qrCode ? `<img src="${qrCode}" alt="QR Yape" style="max-width: 200px; margin: 10px 0;">` : ''}
            <p style="font-size: 18px; font-weight: bold;">📱 ${reference || '999-999-999'}</p>
            <p style="font-size: 20px; color: #059669; font-weight: bold;">Monto: ${currency} ${amount}</p>
            <p style="color: #666; font-size: 14px;">Envía el comprobante por WhatsApp después del pago</p>
          </div>
        `;
        text = `Pago con Yape:\n- Número: ${reference || '999-999-999'}\n- Monto: ${currency} ${amount}\n- Envía el comprobante por WhatsApp`;
        break;

      case 'PLIN':
        html = `
          <div style="text-align: center; margin: 20px 0;">
            <h4 style="color: #3b82f6;">📱 Pago con Plin</h4>
            <p>Escanea el código QR o envía a:</p>
            ${qrCode ? `<img src="${qrCode}" alt="QR Plin" style="max-width: 200px; margin: 10px 0;">` : ''}
            <p style="font-size: 18px; font-weight: bold;">📱 ${reference || '999-999-999'}</p>
            <p style="font-size: 20px; color: #059669; font-weight: bold;">Monto: ${currency} ${amount}</p>
            <p style="color: #666; font-size: 14px;">Envía el comprobante por WhatsApp después del pago</p>
          </div>
        `;
        text = `Pago con Plin:\n- Número: ${reference || '999-999-999'}\n- Monto: ${currency} ${amount}\n- Envía el comprobante por WhatsApp`;
        break;

      case 'BANK_TRANSFER':
        html = `
          <div style="margin: 20px 0;">
            <h4 style="color: #059669;">🏦 Transferencia Bancaria</h4>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 6px; border-left: 4px solid #059669;">
              <p><strong>Banco:</strong> BCP</p>
              <p><strong>Cuenta Corriente:</strong> ${bankAccount || '123-456789-0-12'}</p>
              <p><strong>CCI:</strong> 00212312345678901234</p>
              <p><strong>Titular:</strong> Surf School Costa Rica SAC</p>
              <p><strong>RUC:</strong> 20123456789</p>
              <p style="font-size: 18px; color: #059669; font-weight: bold;">Monto: ${currency} ${amount}</p>
            </div>
            <p style="color: #666; font-size: 14px;">Envía el comprobante de transferencia por WhatsApp o email</p>
          </div>
        `;
        text = `Transferencia Bancaria:\n- Banco: BCP\n- Cuenta: ${bankAccount || '123-456789-0-12'}\n- Monto: ${currency} ${amount}\n- Envía el comprobante`;
        break;

      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        html = `
          <div style="text-align: center; margin: 20px 0;">
            <h4 style="color: #6366f1;">💳 Pago con Tarjeta</h4>
            <p>Procesado de forma segura con ${provider}</p>
            <p style="font-size: 20px; color: #059669; font-weight: bold;">Monto: ${currency} ${amount}</p>
            <div style="margin: 20px 0;">
              <a href="#" style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Pagar Ahora
              </a>
            </div>
          </div>
        `;
        text = `Pago con Tarjeta:\n- Proveedor: ${provider}\n- Monto: ${currency} ${amount}\n- Haz clic en el enlace para pagar`;
        break;

      default:
        html = `
          <div style="margin: 20px 0;">
            <h4>💰 Instrucciones de Pago</h4>
            <p>${instructions}</p>
            <p style="font-size: 18px; color: #059669; font-weight: bold;">Monto: ${currency} ${amount}</p>
          </div>
        `;
        text = `Instrucciones de Pago:\n${instructions}\nMonto: ${currency} ${amount}`;
    }

    return { html, text };
  }

  // Generar footer con políticas
  generateFooter(schoolName: string, policies?: string): { html: string; text: string } {
    const defaultPolicies = `
      <div style="background: #f8f9fa; padding: 20px; margin-top: 30px; border-top: 1px solid #e9ecef;">
        <h4 style="color: #333; margin-top: 0;">Políticas de ${schoolName}</h4>
        <ul style="color: #666; font-size: 14px; line-height: 1.6;">
          <li>Las clases deben ser pagadas con al menos 24 horas de anticipación</li>
          <li>Cancelaciones con menos de 12 horas de anticipación no son reembolsables</li>
          <li>En caso de mal clima, la clase será reprogramada sin costo adicional</li>
          <li>Es obligatorio llegar 15 minutos antes del inicio de la clase</li>
          <li>El equipo de surf está incluido en el precio de la clase</li>
        </ul>
        
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2025 ${schoolName}. Todos los derechos reservados.<br>
            Si tienes preguntas, contáctanos por WhatsApp o email.
          </p>
        </div>
      </div>
    `;

    const textPolicies = `
      Políticas de ${schoolName}:
      - Las clases deben ser pagadas con al menos 24 horas de anticipación
      - Cancelaciones con menos de 12 horas de anticipación no son reembolsables
      - En caso de mal clima, la clase será reprogramada sin costo adicional
      - Es obligatorio llegar 15 minutos antes del inicio de la clase
      - El equipo de surf está incluido en el precio de la clase
      
      © 2025 ${schoolName}. Todos los derechos reservados.
    `;

    return {
      html: policies || defaultPolicies,
      text: textPolicies
    };
  }

  // Reemplazar variables en plantilla
  private replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  }

  // Enviar email usando plantilla
  async sendTemplateEmail(
    templateId: string,
    to: string,
    variables: Record<string, string>,
    schoolName: string = 'Surf School'
  ): Promise<boolean> {
    try {
      const template = this.templates[templateId];
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      // Generar footer
      const footer = this.generateFooter(schoolName);
      variables.footer = footer.html;
      variables.footerText = footer.text;

      // Reemplazar variables
      const subject = this.replaceVariables(template.subject, variables);
      const html = this.replaceVariables(template.htmlContent, variables);
      const text = this.replaceVariables(template.textContent, variables);

      const emailData: EmailData = {
        to,
        subject,
        html,
        text
      };

      // Enviar email (implementar según el proveedor)
      return await this.sendEmail(emailData);
    } catch (error) {
      console.error('Error sending template email:', error);
      return false;
    }
  }

  // Enviar email genérico
  private async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/emails/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Métodos de conveniencia para cada tipo de email
  async sendWelcomeEmail(
    to: string,
    userName: string,
    schoolName: string,
    paymentInstructions: PaymentInstructions
  ): Promise<boolean> {
    const instructions = this.generatePaymentInstructions(paymentInstructions);
    
    return this.sendTemplateEmail('REGISTRATION_WELCOME', to, {
      userName,
      schoolName,
      paymentInstructions: instructions.html,
      paymentInstructionsText: instructions.text,
      dashboardUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/dashboard`
    }, schoolName);
  }

  async sendReservationConfirmation(
    to: string,
    userName: string,
    schoolName: string,
    classDetails: {
      name: string;
      date: string;
      time: string;
      instructor: string;
      location: string;
      amount: number;
    }
  ): Promise<boolean> {
    return this.sendTemplateEmail('RESERVATION_CONFIRMED', to, {
      userName,
      className: classDetails.name,
      classDate: classDetails.date,
      classTime: classDetails.time,
      instructor: classDetails.instructor,
      location: classDetails.location,
      amount: classDetails.amount.toString()
    }, schoolName);
  }

  async sendReservationCancellation(
    to: string,
    userName: string,
    schoolName: string,
    classDetails: {
      name: string;
      date: string;
      reason: string;
    },
    refundInfo?: string
  ): Promise<boolean> {
    const refundHtml = refundInfo ? `
      <div style="background: #e6fffa; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="color: #234e52; margin: 0;">
          <strong>Información de Reembolso:</strong> ${refundInfo}
        </p>
      </div>
    ` : '';

    return this.sendTemplateEmail('RESERVATION_CANCELLED', to, {
      userName,
      className: classDetails.name,
      classDate: classDetails.date,
      cancellationReason: classDetails.reason,
      refundInfo: refundHtml,
      refundInfoText: refundInfo ? `Información de Reembolso: ${refundInfo}` : '',
      bookingUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/classes`
    }, schoolName);
  }

  async sendReservationChange(
    to: string,
    userName: string,
    schoolName: string,
    classDetails: {
      name: string;
      newDate: string;
      newTime: string;
      instructor: string;
      reason: string;
    }
  ): Promise<boolean> {
    return this.sendTemplateEmail('RESERVATION_CHANGED', to, {
      userName,
      className: classDetails.name,
      newDate: classDetails.newDate,
      newTime: classDetails.newTime,
      instructor: classDetails.instructor,
      changeReason: classDetails.reason
    }, schoolName);
  }
}

export default EmailService;