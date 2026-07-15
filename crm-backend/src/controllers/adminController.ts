import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';

// Replace the top lines of getPlatformStats with this:
export const getPlatformStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Firebase UID (req.user.uid) से यूज़र ढूंढो
        const user = await prisma.user.findUnique({ where: { firebaseUid: req.user.uid } });
        
        if (!user || !user.isSuperAdmin) {
            res.status(403).json({ success: false, message: 'Classified: Access Denied.' });
            return;
        }
        // ... rest of the code

        const totalWorkspaces = await prisma.workspace.count();
        const totalUsers = await prisma.user.count();
        const totalLeads = await prisma.lead.count();

        const workspaces = await prisma.workspace.findMany({
            include: {
                _count: {
                    select: { users: true, leads: true, deals: true, tasks: true, companies: true }
                },
                users: {
                    where: { role: 'OWNER' },
                    select: { fullName: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            success: true,
            data: {
                metrics: { totalWorkspaces, totalUsers, totalLeads },
                workspaces
            }
        });
    } catch (error: any) {
        console.error('[CRITICAL GOD MODE ERROR] Fetch Stats:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve platform data.' });
    }
};

// ... inside toggleWorkspaceStatus
export const toggleWorkspaceStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // 🔥 FIX: Explicitly cast to string to satisfy Prisma's WhereUniqueInput
        const targetWorkspaceId = String(req.params.targetWorkspaceId); 
        const { isActive } = req.body;

        const user = await prisma.user.findUnique({ where: { firebaseUid: req.user.uid } });
        
        if (!user || !user.isSuperAdmin) {
            res.status(403).json({ success: false, message: 'Forbidden.' });
            return;
        }

        const updatedWorkspace = await prisma.workspace.update({
            where: { id: targetWorkspaceId },
            data: { isActive }
        });

        res.status(200).json({ success: true, message: 'Status updated.', data: updatedWorkspace });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to update.' });
    }
};

// 🔥 NEW: THE ABSOLUTE GOD MODE DEEP DIVE
// This gives you power to see every single piece of data inside any client's workspace
export const getWorkspaceDeepDive = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const targetWorkspaceId = req.params.targetWorkspaceId as string;

        const user = await prisma.user.findUnique({ where: { id: req.user.uid } });
        
        if (!user || !user.isSuperAdmin) {
            res.status(403).json({ success: false, message: 'Classified: Super Admin access required.' });
            return;
        }

        // Fetch EVERYTHING for the requested workspace
        const workspaceData = await prisma.workspace.findUnique({
            where: { id: targetWorkspaceId },
            include: {
                users: { 
                    select: { id: true, fullName: true, email: true, role: true, createdAt: true } 
                },
                leads: { orderBy: { createdAt: 'desc' } },
                deals: { orderBy: { createdAt: 'desc' } },
                companies: { orderBy: { createdAt: 'desc' } },
                tasks: { orderBy: { createdAt: 'desc' } },
                notes: { orderBy: { createdAt: 'desc' } }
            }
        });

        if (!workspaceData) {
            res.status(404).json({ success: false, message: 'Workspace not found.' });
            return;
        }

        res.status(200).json({
            success: true,
            data: workspaceData
        });
    } catch (error: any) {
        console.error('[CRITICAL GOD MODE ERROR] Deep Dive:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve deep dive data.' });
    }
};