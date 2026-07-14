import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { globalSearch } from '../controllers/searchController';

const router = Router();

// Secure the search route with our Auth Middleware
router.use(requireAuth);

// GET /api/search?q=keyword
router.get('/', globalSearch);

export default router;