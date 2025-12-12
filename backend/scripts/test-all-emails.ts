import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

import { emailService } from '../src/services/email.service';

async function main() {
    const to = 'yerctech@gmail.com'; // Tu correo para recibir todas las pruebas
    const name = 'YercTech User';

    console.log(`🚀 Iniciando prueba completa de notificaciones a ${to}...`);

    try {
        // 1. Welcome Email
        console.log('1️⃣ Enviando Welcome Email...');
        await emailService.sendWelcomeEmail(to, name, 'ClaseDeSurf Demo');

        // 2. Password Reset
        console.log('2️⃣ Enviando Password Reset...');
        await emailService.sendPasswordReset(to, name, 'TOKENDENUMERODEPRUEBA123456');

        // 3. Reserva Confirmada
        console.log('3️⃣ Enviando Reserva Confirmada...');
        await emailService.sendReservationConfirmed(
            to,
            name,
            'Clase Intermedia - Grupales',
            '12/12/2025',
            '10:00 AM',
            'Instructor Juan',
            'Escuela del Pacífico'
        );

        // 4. Reserva Cancelada
        console.log('4️⃣ Enviando Reserva Cancelada...');
        await emailService.sendReservationCancelled(
            to,
            name,
            'Clase Principiante',
            '15/12/2025',
            'Escuela del Pacífico'
        );

        // 5. Reserva Reprogramada
        console.log('5️⃣ Enviando Reserva Reprogramada...');
        await emailService.sendReservationChanged(
            to,
            name,
            'Clase Privada Experto',
            '20/12/2025', // Old Date
            '21/12/2025', // New Date
            '08:00 AM',
            'Escuela del Pacífico'
        );

        // 6. Confirmación de Pago
        console.log('6️⃣ Enviando Confirmación de Pago...');
        await emailService.sendPaymentConfirmation(
            to,
            name,
            150.00,
            'S/.',
            'Pago por Clase Privada',
            'TXN-987654321',
            'Escuela del Pacífico'
        );

        // 7. Check-in Reminder
        console.log('7️⃣ Enviando Recordatorio Check-in...');
        await emailService.sendCheckInReminder(
            to,
            name,
            'Clase Mañanera',
            'Mañana',
            '06:00 AM',
            'Escuela del Pacífico'
        );

        console.log('✅ ¡Todas las pruebas enviadas! Revisa tu bandeja de entrada.');

    } catch (error) {
        console.error('❌ Error durante las pruebas:', error);
    }
}

main();
