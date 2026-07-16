import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';

// 🔥 THE FOUNDER'S MASTER KEY (Ensuring lowercase for absolute safety)
const MASTER_ADMIN_EMAIL = 'admin1@fusionbyte.com'.toLowerCase(); 

// Enterprise Security Check: Case-Insensitive verification
const isAuthorizedGod = (user: any): boolean => {
    if (!user || !user.email) return false;
    return user.email.toLowerCase() === MASTER_ADMIN_EMAIL || user.isSuperAdmin === true;
};

// ==========================================
// 1. GET PLATFORM STATS (Global Telemetry)
// ==========================================
export const getPlatformStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!isAuthorizedGod(req.user)) {
            res.status(403).json({ success: false, message: 'CLASSIFIED: Access Denied. You do not have God Mode clearance.' });
            return;
        }

        const [totalWorkspaces, totalUsers, totalLeads] = await Promise.all([
            prisma.workspace.count(),
            prisma.user.count(),
            prisma.lead.count()
        ]);

        const workspaces = await prisma.workspace.findMany({
            include: {
                _count: { select: { users: true, leads: true, deals: true, contacts: true } },
                users: { where: { role: 'OWNER' }, select: { fullName: true, email: true, createdAt: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, data: { metrics: { totalWorkspaces, totalUsers, totalLeads }, workspaces } });
    } catch (error: any) {
        console.error('[GOD MODE ERROR] Fetch Stats:', error);
        res.status(500).json({ success: false, message: 'Telemetry extraction failed.' });
    }
};

// ==========================================
// 2. TOGGLE WORKSPACE STATUS (Kill Switch)
// ==========================================
export const toggleWorkspaceStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!isAuthorizedGod(req.user)) {
            res.status(403).json({ success: false, message: 'CLASSIFIED: Access Denied.' });
            return;
        }

        const targetWorkspaceId = String(req.params.targetWorkspaceId);
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            res.status(400).json({ success: false, message: 'Invalid payload: isActive must be a boolean.' });
            return;
        }

        const updatedWorkspace = await prisma.workspace.update({
            where: { id: targetWorkspaceId },
            data: { isActive }
        });

        res.status(200).json({ success: true, data: updatedWorkspace, message: `Workspace has been ${isActive ? 'activated' : 'suspended'}.` });
    } catch (error: any) {
        console.error('[GOD MODE ERROR] Toggle Status:', error);
        res.status(500).json({ success: false, message: 'Failed to update workspace status.' });
    }
};

// ==========================================
// 3. THE DEEP DIVE (Extract Everything)
// ==========================================
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
                users: { select: { id: true, fullName: true, email: true, role: true, createdAt: true } },
                leads: { orderBy: { createdAt: 'desc' } },
                deals: { orderBy: { createdAt: 'desc' } },
                contacts: { orderBy: { createdAt: 'desc' } }
            }
        });

        if (!workspaceData) {
            res.status(404).json({ success: false, message: 'Workspace not found in the grid.' });
            return;
        }

        res.status(200).json({ success: true, data: workspaceData });
    } catch (error: any) {
        console.error('[GOD MODE ERROR] Deep Dive:', error);
        res.status(500).json({ success: false, message: 'Deep dive extraction failed.' });
    }
};