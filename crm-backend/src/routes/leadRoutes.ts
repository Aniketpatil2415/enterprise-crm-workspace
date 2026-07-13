import { Router } from 'express';
import { createLead, getLeads, updateLeadStatus } from '../controllers/leadController';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

// Enterprise Rule: Every single route in this file must pass through the security middleware first
router.use(requireAuth);

// Endpoints
router.post('/', createLead); // POST /api/leads
router.get('/', getLeads);    // GET /api/leads
router.patch('/:id/status', updateLeadStatus);

export default router;