import { Response, Request } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';

// 1. Fetch active announcements for the user's dashboard
export const getAnnouncements = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const userEmail = req.user.email;

        // Fetch Global Broadcasts (targetEmail is null) OR Direct Notices (targetEmail matches user)
        const announcements = await prisma.announcement.findMany({
            where: {
                OR: [
                    { targetEmail: null },
                    { targetEmail: userEmail }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 5 // Get top 5 latest notices
        });

        res.status(200).json({ success: true, data: announcements });
    } catch (error: any) {
        console.error('[ANNOUNCEMENT FETCH ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve broadcasts.' });
    }
};

// 2. Admin Only: Create a new Broadcast or Warning
export const createAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // (Later we can restrict this to Admin only, for now let's build the engine)
        const { title, message, type, targetEmail } = req.body;

        if (!title || !message) {
            res.status(400).json({ success: false, message: 'Title and message are required.' });
            return;
        }

        const broadcast = await prisma.announcement.create({
            data: {
                title,
                message,
                type: type || 'INFO',
                targetEmail: targetEmail || null // If null, goes to EVERYONE
            }
        });

        res.status(201).json({ success: true, data: broadcast });
    } catch (error: any) {
        console.error('[ANNOUNCEMENT CREATE ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to launch broadcast.' });
    }
};