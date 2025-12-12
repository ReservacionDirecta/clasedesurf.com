import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde el archivo .env raíz del backend
dotenv.config({ path: path.join(__dirname, '../.env') });

import { emailService } from '../src/services/email.service';

async function main() {
    console.log('🚀 Iniciando prueba de envío de email...');
    const to = 'yerctech@gmail.com';

    try {
        console.log(`Intentando enviar correo de bienvenida a: ${to}`);
        console.log(`Remitente esperado: info@clasedesurf.com`);

        // Usamos el método de bienvenida para probar la plantilla HTML también
        const result = await emailService.sendWelcomeEmail(
            to,
            'YercTech Admin', // Nombre para el correo
            'ClaseDeSurf.com Prueba' // Nombre de la escuela
        );

        if (result.success) {
            console.log('✅ ¡Correo enviado exitosamente!');
            console.log('ID del mensaje:', (result.data as any)?.id);
        } else {
            console.error('❌ Falló el envío del correo.');
            console.error('Error:', JSON.stringify(result.error, null, 2));
        }
    } catch (error) {
        console.error('❌ Error inesperado ejecutando el script:', error);
    }
}

main();
