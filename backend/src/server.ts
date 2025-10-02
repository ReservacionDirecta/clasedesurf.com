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

const app = express();
const PORT = process.env.PORT || 4000;

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

app.get('/', (_req, res) => res.json({ message: 'Backend API running' }));

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
