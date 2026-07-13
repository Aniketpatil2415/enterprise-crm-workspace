import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import leadRoutes from './routes/leadRoutes'; // सही जगह पर इम्पोर्ट

// Load Environment Variables
dotenv.config();

// Initialize Express App
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Enterprise Security Middlewares
app.use(helmet()); 
app.use(cors({
  origin: 'http://localhost:5173', // Strictly allowing only your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Request Parsers & Loggers
app.use(express.json());
app.use(morgan('dev'));

// Health Check Route
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Fusion Byte CRM API is running optimally.',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes); // नया लीड्स राउट

// Start the Server
app.listen(PORT, () => {
    console.log(`✅ CRM Nexus Core Backend listening on port ${PORT}`);
    console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
});