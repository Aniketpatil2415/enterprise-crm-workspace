import { Router } from 'express';
import { createLead, getLeads, updateLeadStatus } from '../controllers/leadController';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

// ==========================================
// LEAD PIPELINE ROUTES
// ==========================================

// 🔥 TITANIUM SHIELD: All lead routes must pass through the strict auth middleware
router.use(requireAuth);

router.post('/', createLead);
router.get('/', getLeads);
router.patch('/:id/status', updateLeadStatus); // This handles the drag-and-drop Kanban updates

export default router;