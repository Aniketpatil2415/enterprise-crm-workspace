import { Router } from 'express';
import { getAnnouncements, createAnnouncement } from '../controllers/announcementController';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

router.use(requireAuth);

router.get('/', getAnnouncements);
router.post('/', createAnnouncement); // To trigger a new broadcast

export default router;