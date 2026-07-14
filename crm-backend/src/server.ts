import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import leadRoutes from './routes/leadRoutes';
import companyRoutes from './routes/companyRoutes';
import contactRoutes from './routes/contactRoutes';
import dealRoutes from './routes/dealRoutes';
import taskRoutes from './routes/taskRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 ENTERPRISE ROUTES: Strict matching to prevent cross-wiring
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/companies', companyRoutes); // Must ONLY point to companyRoutes
app.use('/api/contacts', contactRoutes);   // Must ONLY point to contactRoutes
app.use('/api/deals', dealRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`CRM Nexus Core Backend listening on port ${PORT}`);
});