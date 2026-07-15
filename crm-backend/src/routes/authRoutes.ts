import { Router } from 'express';
import { registerUser } from '../controllers/authController';

const router = Router();

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// This endpoint acts as a bridge. 
// Firebase handles the actual auth, while this provisions the MySQL Tenant & User.
router.post('/register', registerUser);

export default router;