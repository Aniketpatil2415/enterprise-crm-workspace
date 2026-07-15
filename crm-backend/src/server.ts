import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// ==========================================
// ENTERPRISE ROUTE IMPORTS
// ==========================================
import authRoutes from './routes/authRoutes';
import leadRoutes from './routes/leadRoutes';
import companyRoutes from './routes/companyRoutes';
import contactRoutes from './routes/contactRoutes';
import dealRoutes from './routes/dealRoutes';
import taskRoutes from './routes/taskRoutes';
import searchRoutes from './routes/searchRoutes';
import noteRoutes from './routes/noteRoutes';
import teamRoutes from './routes/teamRoutes';
import inviteRoutes from './routes/inviteRoutes';
import apiKeyRoutes from './routes/apiKeyRoutes'; 
import webhookRoutes from './routes/webhookRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

// ==========================================
// MILITARY-GRADE SECURITY MIDDLEWARES
// ==========================================
// 1. Helmet: Secures HTTP headers
app.use(helmet());

// 2. Strict CORS: Only allow specific domains to talk to the backend
const allowedOrigins = [
    'http://localhost:5173', // Local Frontend
    'https://fusionbyte.tech', // Your Production Domain
    'https://www.fusionbyte.tech'
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by strict CORS policy'));
        }
    },
    credentials: true
}));

// 3. Rate Limiting: Prevent DDoS and Brute Force attacks
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: { success: false, message: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);

app.use(express.json({ limit: '10kb' })); // Block massive payload injections

// ==========================================
// THE API GATEWAY (ROUTING ENGINE)
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/apikeys', apiKeyRoutes); 
app.use('/api/webhooks', webhookRoutes);
app.use('/api/admin', adminRoutes);

// ==========================================
// START THE ENGINE
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`CRM Nexus Core Backend listening securely on port ${PORT}`);
});