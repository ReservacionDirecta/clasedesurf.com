import wppconnect from '@wppconnect-team/wppconnect';
import fs from 'fs';

class WhatsAppService {
  private client: any;
  public isReady: boolean;

  constructor() {
    this.client = null;
    this.isReady = false;
  }

  async initialize(): Promise<any> {
    try {
      this.client = await wppconnect.create({
        session: 'surfschool',
        catchQR: (base64Qrimg: string, asciiQR: string, attempts: number, urlCode: string | undefined) => {
          console.log('QR Code generado!');
          console.log('Attempts:', attempts);
          console.log('URL Code:', urlCode);
          this.saveQRCode(base64Qrimg);
        },
        statusFind: (statusSession: string, session: string) => {
          console.log('Status Session:', statusSession);
          if (statusSession === 'authenticated') {
            this.isReady = true;
            console.log('✅ WhatsApp conectado exitosamente!');
          }
        },
        headless: true,
        devtools: false,
        useChrome: true,
        debug: false,
        logQR: true,
        browserArgs: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });

      return this.client;
    } catch (error) {
      console.error('Error inicializando WhatsApp:', error);
      throw error;
    }
  }

  private saveQRCode(base64Qrimg: string) {
    const base64Data = base64Qrimg.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync('./qr-code.png', base64Data, 'base64');
    console.log('QR Code guardado en: ./qr-code.png');
  }

  async sendMessage(number: string, message: string): Promise<any> {
    if (!this.isReady || !this.client) {
      throw new Error('WhatsApp no está conectado');
    }

    try {
      const chatId = number.includes('@') ? number : `${number}@c.us`;
      const result = await this.client.sendText(chatId, message);
      return result;
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      throw error;
    }
  }
}

export const whatsappService = new WhatsAppService();