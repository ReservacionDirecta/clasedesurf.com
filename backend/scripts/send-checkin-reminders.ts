import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

import { emailService } from '../src/services/email.service';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Iniciando envío de recordatorios de Check-in...');

    // Calcular fecha de mañana
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(tomorrow.getDate() + 1);

    console.log(`📅 Buscando clases para: ${tomorrow.toLocaleDateString()}`);

    try {
        // Buscar reservas confirmadas para clases de mañana
        const reservations = await prisma.reservation.findMany({
            where: {
                status: { in: ['CONFIRMED', 'PAID'] },
                class: {
                    date: {
                        gte: tomorrow,
                        lt: dayAfterTomorrow
                    }
                }
            },
            include: {
                user: true,
                class: {
                    include: {
                        school: true
                    }
                }
            }
        });

        console.log(`✅ Se encontraron ${reservations.length} reservas para recordar.`);

        for (const reservation of reservations) {
            try {
                console.log(`📧 Enviando recordatorio a ${reservation.user.email} para clase ${reservation.class.title}...`);

                await emailService.sendCheckInReminder(
                    reservation.user.email,
                    reservation.user.name,
                    reservation.class.title,
                    new Date(reservation.class.date).toLocaleDateString(),
                    new Date(reservation.class.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    reservation.class.school.name
                );
            } catch (emailError) {
                console.error(`❌ Error enviando a ${reservation.user.email}:`, emailError);
            }
        }

        console.log('🏁 Proceso finalizado.');

    } catch (error) {
        console.error('❌ Error en el proceso:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
