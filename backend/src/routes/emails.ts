import express from 'express';
import { emailService } from '../services/email.service';
import requireAuth from '../middleware/auth';

const router = express.Router();

// POST /emails/send
// Este endpoint permite al frontend enviar emails usando las plantillas generadas en el cliente.
// Asegúrate de que solo usuarios autorizados (o el sistema) puedan llamar a esto.
router.post('/send', requireAuth, async (req, res) => {
    try {
        const { to, subject, html, text } = req.body;

        if (!to || !subject || !html) {
            return res.status(400).json({ message: 'Missing required fields: to, subject, html' });
        }

        const result = await emailService.sendEmail(to, subject, html, text);

        if (result.success) {
            res.json({ message: 'Email sent successfully', data: result.data });
        } else {
            res.status(500).json({ message: 'Failed to send email', error: result.error });
        }
    } catch (error) {
        console.error('Error in /emails/send:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
