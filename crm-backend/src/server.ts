import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

// Load Environment Variables
dotenv.config();

// Initialize Express App
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Enterprise Security Middlewares
app.use(helmet()); // Protects against common web vulnerabilities
app.use(cors({
  origin: '*', // We will restrict this to your Vercel frontend URL later
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Request Parsers & Loggers
app.use(express.json()); // Allows us to accept JSON data
app.use(morgan('dev')); // Logs API requests in the terminal

// Health Check Route (To verify server is running)// Health Check Route (To verify server is running)
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Fusion Byte CRM API is running optimally.',
    timestamp: new Date().toISOString()
  });
});

// 👇 इसे Health Check वाले ब्लॉक के बाहर रखना है
app.use('/api/auth', authRoutes);

// Start the Server
app.listen(PORT, () => {
  console.log(`✅ CRM Nexus Core Backend listening on port ${PORT}`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
});