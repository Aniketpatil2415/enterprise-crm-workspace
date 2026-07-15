import { Router } from 'express';
import { createCompany, getCompanies, deleteCompany } from '../controllers/companyController';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

// ==========================================
// COMPANY ROUTES
// ==========================================

router.use(requireAuth);

router.post('/', createCompany);
router.get('/', getCompanies);
router.delete('/:id', deleteCompany); // Tied perfectly to the new delete function

export default router;