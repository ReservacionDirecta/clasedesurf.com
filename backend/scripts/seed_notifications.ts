
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding notifications...');

    // 1. Find the admin user (adjust email if necessary, or take the first ADMIN)
    const adminUser = await prisma.user.findFirst({
        where: {
            role: 'ADMIN'
        }
    });

    if (!adminUser) {
        console.error('No admin user found. Please create an admin user first.');
        return;
    }

    console.log(`Creating notifications for user: ${adminUser.email} (${adminUser.id})`);

    const now = new Date();
    const past = (minutes: number) => new Date(now.getTime() - minutes * 60000);

    const notificationsData = [
        {
            type: 'EMAIL',
            category: 'WELCOME',
            subject: '¡Bienvenido a clasedesurf.com!',
            content: `
        <div style="font-family: sans-serif; color: #333;">
          <h1>¡Bienvenido, ${adminUser.name}!</h1>
          <p>Estamos emocionados de que te unas a nuestra plataforma.</p>
          <p>Explora las escuelas, reserva clases y mejora tu surfing.</p>
        </div>
      `,
            metadata: { source: 'seed' },
            isRead: true,
            createdAt: past(120), // 2 hours ago
        },
        {
            type: 'SYSTEM',
            category: 'RESERVATION_CONFIRMED',
            subject: 'Reserva Confirmada #1234',
            content: `
        <div style="font-family: sans-serif; color: #333;">
          <h2 style="color: #4CAF50;">¡Tu reserva está confirmada!</h2>
          <p><strong>Clase:</strong> Surf Intermedio</p>
          <p><strong>Fecha:</strong> Mañana, 10:00 AM</p>
          <p><strong>Instructor:</strong> Juan Pérez</p>
        </div>
      `,
            metadata: { reservationId: 1234 },
            isRead: false,
            createdAt: past(60), // 1 hour ago
        },
        {
            type: 'WHATSAPP',
            category: 'CHECKIN_REMINDER',
            subject: 'Recordatorio de clase mañana',
            content: `
        <div style="font-family: sans-serif; color: #333;">
          <p>Hola, recuerda que tienes una clase mañana. ¡No olvides tu bloqueador!</p>
        </div>
      `,
            metadata: { type: 'reminder' },
            isRead: false,
            createdAt: past(30), // 30 mins ago
        },
        {
            type: 'EMAIL',
            category: 'PAYMENT_CONFIRMED',
            subject: 'Pago Recibido - Reserva #1234',
            content: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Pago Exitoso</h2>
          <p>Hemos recibido tu pago de <strong>$50.00</strong>.</p>
          <p>Gracias por confiar en nosotros.</p>
        </div>
      `,
            metadata: { paymentId: 999 },
            isRead: false,
            createdAt: past(15), // 15 mins ago
        },
        {
            type: 'SYSTEM',
            category: 'RESERVATION_CANCELLED',
            subject: 'Reserva Cancelada #9876',
            content: `
        <div style="font-family: sans-serif; color: #333;">
          <h2 style="color: #F44336;">Reserva Cancelada</h2>
          <p>La reserva para el curso de iniciación ha sido cancelada.</p>
        </div>
      `,
            metadata: { reason: 'user_request' },
            isRead: true,
            createdAt: past(1440), // 1 day ago
        }
    ];

    for (const data of notificationsData) {
        await prisma.notification.create({
            data: {
                userId: adminUser.id,
                type: data.type as any,
                category: data.category,
                subject: data.subject,
                content: data.content,
                metadata: data.metadata,
                isRead: data.isRead,
                createdAt: data.createdAt,
            },
        });
    }

    console.log('Notifications seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
