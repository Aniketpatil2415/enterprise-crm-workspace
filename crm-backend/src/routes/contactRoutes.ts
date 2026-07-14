import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { createContact, getContacts, deleteContact } from '../controllers/contactController';

const router = Router();

// Apply Enterprise Security Middleware
router.use(requireAuth);

router.post('/', createContact);
router.get('/', getContacts);
router.delete('/:id', deleteContact);

export default router;