"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const classes_1 = __importDefault(require("./routes/classes"));
const users_1 = __importDefault(require("./routes/users"));
const reservations_1 = __importDefault(require("./routes/reservations"));
const payments_1 = __importDefault(require("./routes/payments"));
const auth_1 = __importDefault(require("./routes/auth"));
const schools_1 = __importDefault(require("./routes/schools"));
const instructors_1 = __importDefault(require("./routes/instructors"));
const instructor_classes_1 = __importDefault(require("./routes/instructor-classes"));
const students_1 = __importDefault(require("./routes/students"));
const stats_1 = __importDefault(require("./routes/stats"));
const beaches_1 = __importDefault(require("./routes/beaches"));
const whatsapp_service_1 = require("./services/whatsapp.service");
const prisma_1 = __importDefault(require("./prisma"));
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
// Trust proxy for Railway deployment
app.set('trust proxy', 1);
// Configure CORS to support credentials (cookies)
const corsOptions = {
    origin: function (origin, callback) {
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
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};
app.use((0, cors_1.default)(corsOptions));
// Increase body parser limit to 10MB to handle base64 images
app.use(body_parser_1.default.json({ limit: '10mb' }));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
app.use('/classes', classes_1.default);
app.use('/users', users_1.default);
app.use('/reservations', reservations_1.default);
app.use('/payments', payments_1.default);
app.use('/auth', auth_1.default);
app.use('/schools', schools_1.default);
app.use('/instructors', instructors_1.default);
app.use('/instructor', instructor_classes_1.default);
app.use('/students', students_1.default);
app.use('/stats', stats_1.default);
app.use('/beaches', beaches_1.default);
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
        const schoolCount = await prisma_1.default.school.count();
        const schools = await prisma_1.default.school.findMany({ take: 2 });
        res.json({
            message: 'Database connection working',
            schoolCount,
            schools,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({
            message: 'Database connection failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
});
async function startServer() {
    try {
        await prisma_1.default.$connect();
        console.log('✅ Connected to PostgreSQL');
        // Solo inicializar WhatsApp si está habilitado
        if (process.env.WHATSAPP_ENABLED === 'true') {
            await whatsapp_service_1.whatsappService.initialize();
            console.log('✅ WhatsApp Service Initialized');
        }
        else {
            console.log('⚠️ WhatsApp Service Disabled');
        }
        app.listen(port, () => {
            console.log(`🚀 Server is running on port ${port}`);
        });
    }
    catch (error) {
        console.error('❌ Error connecting to the database or starting server:', error);
        process.exit(1);
    }
}
startServer();
