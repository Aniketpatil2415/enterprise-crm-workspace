import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { 
    createLead, 
    getLeads, 
    updateLeadStatus, 
    deleteLead 
} from '../controllers/leadController';

const router = Router();

// Apply Firebase Authentication middleware to all lead routes
router.use(requireAuth);

router.post('/', createLead);
router.get('/', getLeads);
router.patch('/:id/status', updateLeadStatus);
router.delete('/:id', deleteLead); // The fully exported Soft-Delete route

export default router;