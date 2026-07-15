import { Router } from 'express';
import { createContact, getContacts } from '../controllers/contactController';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

// STRICT TENANT ISOLATION APPLIED
router.use(requireAuth);

router.post('/', createContact);
router.get('/', getContacts);

export default router;