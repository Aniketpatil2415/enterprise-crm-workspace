import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
// 🔥 STRICT FIX: We only import Company controllers here, NOTHING ELSE.
import { createCompany, getCompanies, deleteCompany } from '../controllers/companyController';

const router = Router();

router.use(requireAuth);

// 🔥 STRICT FIX: Ensure this is calling createCompany, NOT createContact
router.post('/', createCompany);
router.get('/', getCompanies);
router.delete('/:id', deleteCompany);

export default router;