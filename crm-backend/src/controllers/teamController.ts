import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';

export const getTeamMembers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.workspaceId) {
            res.status(401).json({ success: false, message: 'Fatal: Workspace context missing.' });
            return;
        }

        // Fetch only users that belong to the exact same workspace
        const teamMembers = await prisma.user.findMany({
            where: { workspaceId: req.user.workspaceId },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                createdAt: true,
                // Exclude sensitive fields like firebaseUid or isSuperAdmin in standard responses
            },
            orderBy: { createdAt: 'asc' }
        });

        res.status(200).json({ success: true, data: teamMembers });
    } catch (error: any) {
        console.error('[TEAM FETCH ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve team members.' });
    }
};