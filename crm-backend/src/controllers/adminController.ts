import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';

// 🔥 THE FOUNDER'S MASTER KEY: Hardcoded override
// Put the exact email you use to login here. This overrides database failures.
const MASTER_ADMIN_EMAIL = 'aniketpatil2415@gmail.com'; 

const isAuthorizedGod = (user: any): boolean => {
    if (!user) return false;
    return user.email === MASTER_ADMIN_EMAIL || user.isSuperAdmin === true;
};

export const getPlatformStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!isAuthorizedGod(req.user)) {
            res.status(403).json({ success: false, message: 'CLASSIFIED: Access Denied.' });
            return;
        }

        const [totalWorkspaces, totalUsers, totalLeads] = await Promise.all([
            prisma.workspace.count(),
            prisma.user.count(),
            prisma.lead.count()
        ]);

        const workspaces = await prisma.workspace.findMany({
            include: {
                _count: { select: { users: true, leads: true, deals: true } },
                users: { where: { role: 'OWNER' }, select: { fullName: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, data: { metrics: { totalWorkspaces, totalUsers, totalLeads }, workspaces } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Telemetry extraction failed.' });
    }
};

export const getWorkspaceDeepDive = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!isAuthorizedGod(req.user)) {
            res.status(403).json({ success: false, message: 'CLASSIFIED: Access Denied.' });
            return;
        }

        const targetWorkspaceId = String(req.params.targetWorkspaceId);
        
        const workspaceData = await prisma.workspace.findUnique({
            where: { id: targetWorkspaceId },
            include: {
                users: { select: { id: true, fullName: true, email: true, role: true } },
                leads: { orderBy: { createdAt: 'desc' } },
                deals: { orderBy: { createdAt: 'desc' } }
            }
        });

        res.status(200).json({ success: true, data: workspaceData });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Deep dive extraction failed.' });
    }
};