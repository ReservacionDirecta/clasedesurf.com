import dotenv from 'dotenv';
dotenv.config();

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
import instructorClassesRouter from './routes/instructor-classes';
import studentsRouter from './routes/students';
import statsRouter from './routes/stats';
import beachesRouter from './routes/beaches';
import notesRouter from './routes/notes';
import discountCodesRouter from './routes/discountCodes';
import imagesRouter from './routes/images';
import notificationsRouter from './routes/notifications';
import { whatsappService } from './services/whatsapp.service';
import { initializeRedis, getRedisClient } from './config/redis';
import prisma from './prisma';
const app = express();


const port = process.env.PORT || 4000;

// Trust proxy for Railway deployment
app.set('trust proxy', 1);

// Configure CORS to support credentials (cookies)
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Lista de orígenes permitidos
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://clasedesurf.com',
      'https://www.clasedesurf.com',
      'https://clasedesurfcom-production.up.railway.app',
      'https://clasesde-pe-production.up.railway.app',
      'https://clasesde-pe-frontend-production.up.railway.app',
      process.env.FRONTEND_URL,
      // Railway URLs dinámicas
      process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null,
      process.env.RAILWAY_STATIC_URL ? `https://${process.env.RAILWAY_STATIC_URL}` : null
    ].filter(Boolean); // Filtrar valores undefined/null

    // Permitir requests sin origin (como Postman, aplicaciones móviles, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

app.use(cors(corsOptions));
// Increase body parser limit to 10MB to handle base64 images
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use('/classes', classesRouter);
app.use('/users', usersRouter);
app.use('/reservations', reservationsRouter);
app.use('/payments', paymentsRouter);
app.use('/auth', authRouter);
app.use('/schools', schoolsRouter);
app.use('/instructors', instructorsRouter);
app.use('/instructor', instructorClassesRouter);
app.use('/students', studentsRouter);
app.use('/stats', statsRouter);
app.use('/beaches', beachesRouter);

app.use('/notes', notesRouter);
app.use('/discount-codes', discountCodesRouter);
app.use('/images', imagesRouter);
app.use('/notifications', notificationsRouter);

app.get('/', (_req, res) => res.json({
  message: 'Backend API running',
  timestamp: new Date().toISOString(),
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development'
}));

// Health check endpoint
app.get('/health', (_req, res) => res.json({
  status: 'healthy',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  memory: process.memoryUsage()
}));

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

    // Test CalendarNote model
    let calendarNoteCount = 0;
    let calendarNoteError = null;
    let calendarNoteAvailable = false;
    try {
      // Try to access the model
      calendarNoteCount = await (prisma as any).calendarNote?.count() || 0;
      calendarNoteAvailable = true;
    } catch (err: any) {
      calendarNoteError = err?.message;
      console.error('CalendarNote test error:', err);
    }

    res.json({
      message: 'Database connection working',
      schoolCount,
      schools,
      calendarNoteCount,
      calendarNoteAvailable,
      calendarNoteError,
      prismaModels: Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_')),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Redis Test Route
app.get('/redis-test', async (req, res) => {
  try {
    const redis = getRedisClient();
    await redis.set('test-key', 'Redis is working! ' + new Date().toISOString());
    const value = await redis.get('test-key');

    res.json({
      message: 'Redis connection successful',
      value_retrieved: value,
      status: redis.status
    });
  } catch (error: any) {
    console.error('Redis test error:', error);
    res.status(500).json({
      message: 'Redis operation failed',
      error: error.message
    });
  }
});

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');

    // Initialize Redis
    initializeRedis();

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
