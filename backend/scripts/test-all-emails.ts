import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde el archivo .env en la raiz del backend
dotenv.config({ path: path.join(__dirname, '../.env') });

import { emailService } from '../src/services/email.service';

async function sendTestEmails() {
    const email = 'yerctech@gmail.com';
    const name = 'Yerc Tech';
    const schoolName = 'ClaseDeSurf.com';
    const className = 'Clase de Surf Intermedio';
    const date = '15/12/2025';
    const time = '10:00 AM';
    const instructor = 'Juan Pérez';
    const location = 'Playa Makaha, Miraflores, Lima';
    const duration = 90;
    const price = 120.00;

    console.log('🚀 Iniciando envío de correos de prueba a:', email);

    try {
        // 1. Welcome
        console.log('1. Enviando Welcome Email...');
        await emailService.sendWelcomeEmail(email, name, schoolName);

        // 2. Password Reset
        console.log('2. Enviando Password Reset...');
        await emailService.sendPasswordReset(email, name, 'token-de-prueba-123');

        // 3. Reservation Confirmed
        console.log('3. Enviando Reservation Confirmed...');
        await emailService.sendReservationConfirmed(
            email, name, className, date, time, instructor, schoolName, location, duration, price
        );

        // 4. Reservation Cancelled
        console.log('4. Enviando Reservation Cancelled...');
        await emailService.sendReservationCancelled(
            email, name, className, date, time, schoolName, location
        );

        // 5. Reservation Changed
        console.log('5. Enviando Reservation Changed...');
        await emailService.sendReservationChanged(
            email, name, className, '14/12/2025', date, time, schoolName, location, duration
        );

        // 6. Payment Confirmation
        console.log('6. Enviando Payment Confirmation...');
        await emailService.sendPaymentConfirmation(
            email, name, price, 'PEN', className, 'TXN-987654321', schoolName, 'Tarjeta de Crédito', new Date().toLocaleDateString()
        );

        // 7. Check-in Reminder
        console.log('7. Enviando Check-in Reminder...');
        await emailService.sendCheckInReminder(
            email, name, className, date, time, schoolName, location
        );

        console.log('✅ Todos los correos de prueba han sido enviados correctamente.');

    } catch (error) {
        console.error('❌ Error enviando correos de prueba:', error);
    }
}

sendTestEmails();
