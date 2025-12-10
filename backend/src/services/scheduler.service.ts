import cron from 'node-cron';
import prisma from '../prisma';
import { EmailService } from './email.service';

/**
 * Servicio de tareas programadas para enviar recordatorios y notificaciones automáticas
 */
export class SchedulerService {
    /**
     * Inicializa todas las tareas programadas
     */
    static init() {
        console.log('[Scheduler] Initializing scheduled tasks...');

        // Enviar recordatorios de clase 24 horas antes
        // Ejecutar todos los días a las 10:00 AM
        cron.schedule('0 10 * * *', async () => {
            console.log('[Scheduler] Running class reminder task...');
            await this.sendClassReminders();
        });

        // Limpiar tokens de refresh expirados
        // Ejecutar todos los días a las 3:00 AM
        cron.schedule('0 3 * * *', async () => {
            console.log('[Scheduler] Cleaning expired refresh tokens...');
            await this.cleanExpiredTokens();
        });

        console.log('[Scheduler] Scheduled tasks initialized successfully');
    }

    /**
     * Envía recordatorios de clase a usuarios con clases programadas para mañana
     */
    static async sendClassReminders() {
        try {
            // Calcular el rango de fechas para mañana
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStart = new Date(tomorrow.setHours(0, 0, 0, 0));
            const tomorrowEnd = new Date(tomorrow.setHours(23, 59, 59, 999));

            console.log('[Scheduler] Looking for classes between', tomorrowStart, 'and', tomorrowEnd);

            // Buscar todas las reservas confirmadas o pagadas para mañana
            const upcomingReservations = await prisma.reservation.findMany({
                where: {
                    class: {
                        date: {
                            gte: tomorrowStart,
                            lt: tomorrowEnd
                        }
                    },
                    status: {
                        in: ['CONFIRMED', 'PAID']
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    class: {
                        include: {
                            school: {
                                select: {
                                    location: true
                                }
                            }
                        }
                    }
                }
            });

            console.log(`[Scheduler] Found ${upcomingReservations.length} reservations for tomorrow`);

            // Enviar recordatorio a cada usuario
            let successCount = 0;
            let errorCount = 0;

            for (const reservation of upcomingReservations) {
                try {
                    const classDate = new Date(reservation.class.date);

                    await EmailService.sendClassReminder(
                        reservation.user.email,
                        reservation.user.name || 'Usuario',
                        {
                            className: reservation.class.title,
                            date: classDate.toLocaleDateString('es-PE', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }),
                            time: classDate.toLocaleTimeString('es-PE', {
                                hour: '2-digit',
                                minute: '2-digit'
                            }),
                            location: reservation.class.school?.location || 'Por confirmar'
                        }
                    );

                    successCount++;
                    console.log(`[Scheduler] Reminder sent to ${reservation.user.email} for class ${reservation.class.title}`);
                } catch (error) {
                    errorCount++;
                    console.error(`[Scheduler] Error sending reminder to ${reservation.user.email}:`, error);
                }
            }

            console.log(`[Scheduler] Class reminders completed: ${successCount} sent, ${errorCount} failed`);
        } catch (error) {
            console.error('[Scheduler] Error in sendClassReminders:', error);
        }
    }

    /**
     * Limpia tokens de refresh expirados de la base de datos
     */
    static async cleanExpiredTokens() {
        try {
            const now = new Date();

            const result = await prisma.refreshToken.deleteMany({
                where: {
                    expiresAt: {
                        lt: now
                    }
                }
            });

            console.log(`[Scheduler] Cleaned ${result.count} expired refresh tokens`);
        } catch (error) {
            console.error('[Scheduler] Error cleaning expired tokens:', error);
        }
    }

    /**
     * Envía un resumen semanal a los administradores de escuela
     * (Opcional - para implementar en el futuro)
     */
    static async sendWeeklySummary() {
        try {
            // Implementar lógica para enviar resumen semanal
            console.log('[Scheduler] Weekly summary task not yet implemented');
        } catch (error) {
            console.error('[Scheduler] Error in sendWeeklySummary:', error);
        }
    }

    /**
     * Marca clases pasadas como completadas
     * (Opcional - para implementar en el futuro)
     */
    static async markPastClassesAsCompleted() {
        try {
            const now = new Date();

            const result = await prisma.class.updateMany({
                where: {
                    date: {
                        lt: now
                    },
                    status: {
                        not: 'COMPLETED'
                    }
                },
                data: {
                    status: 'COMPLETED'
                }
            });

            console.log(`[Scheduler] Marked ${result.count} past classes as completed`);
        } catch (error) {
            console.error('[Scheduler] Error marking past classes:', error);
        }
    }
}

// Nota: Para usar este servicio, necesitas instalar node-cron:
// npm install node-cron
// npm install --save-dev @types/node-cron
