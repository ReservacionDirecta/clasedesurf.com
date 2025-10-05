import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import classesRouter from './routes/classes';
import usersRouter from './routes/users';
import reservationsRouter from './routes/reservations';
import paymentsRouter from './routes/payments';
import authRouter from './routes/auth';
import schoolsRouter from './routes/schools';
import instructorsRouter from './routes/instructors';
import { whatsappService } from './services/whatsapp.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;

// Trust proxy for Railway deployment
app.set('trust proxy', 1);

// Configure CORS to support credentials (cookies)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/classes', classesRouter);
app.use('/users', usersRouter);
app.use('/reservations', reservationsRouter);
app.use('/payments', paymentsRouter);
app.use('/auth', authRouter);
app.use('/schools', schoolsRouter);
app.use('/instructors', instructorsRouter);

app.get('/', (_req, res) => res.json({ message: 'Backend API running', timestamp: new Date().toISOString() }));

// Test route to verify deployment
app.get('/test/:id', (req, res) => {
  res.json({ message: 'Test route working', id: req.params.id, timestamp: new Date().toISOString() });
});

// Simple test route for schools
app.get('/simple-school/:id', (req, res) => {
  res.json({ message: 'Simple school route', id: req.params.id, type: typeof req.params.id });
});

// Database diagnostic endpoint
app.get('/db-test', async (req, res) => {
  try {
    const schoolCount = await prisma.school.count();
    const schools = await prisma.school.findMany({ take: 2 });
    res.json({ 
      message: 'Database connection working', 
      schoolCount, 
      schools,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      message: 'Database connection failed', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');

    // Solo inicializar WhatsApp si está habilitado
    if (process.env.WHATSAPP_ENABLED === 'true') {
      await whatsappService.initialize();
      console.log('✅ WhatsApp Service Initialized');
    } else {
      console.log('⚠️ WhatsApp Service Disabled');
    }

    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('❌ Error connecting to the database or starting server:', error);
    process.exit(1);
  }
}

startServer();
