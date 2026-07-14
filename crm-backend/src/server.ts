import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import leadRoutes from './routes/leadRoutes';

const app = express();

// SECURITY & PARSING MIDDLEWARES
app.use(cors()); // Allows your React frontend (port 5173) to talk to this backend
app.use(express.json()); // Allows Express to read the POST/PATCH JSON data

// ENTERPRISE ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// START THE ENGINE
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ CRM Nexus Core Backend listening on port ${PORT}`);
});