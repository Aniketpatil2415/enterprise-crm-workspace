import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';

export const getTeamMembers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const workspaceId = req.workspaceId!;
        
        // Fetch all active users in the current workspace securely
        const teamMembers = await prisma.user.findMany({
            where: { 
                workspaceId: workspaceId,
                isActive: true 
            },
            select: { 
                id: true, 
                fullName: true, 
                email: true, 
                role: true, 
                createdAt: true 
            },
            orderBy: { 
                role: 'asc' // OWNERs and ADMINs first
            }
        });

        res.status(200).json({ success: true, data: teamMembers });
    } catch (error: any) {
        console.error('[CRITICAL PRISMA ERROR] Get Team Members:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error fetching team.' });
    }
};

export const updateTeamRole = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const workspaceId = req.workspaceId!;
        const requestingUserRole = req.user.role;
        const targetUserId = req.params.id as string;
        const { newRole } = req.body;

        // Enterprise Security: Only OWNER or ADMIN can change roles
        if (requestingUserRole !== 'OWNER' && requestingUserRole !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required.' });
            return;
        }

        const existingUser = await prisma.user.findFirst({
            where: { id: targetUserId, workspaceId: workspaceId }
        });

        if (!existingUser) {
            res.status(404).json({ success: false, message: 'User not found in this workspace.' });
            return;
        }

        // Prevent modifying the Owner's role
        if (existingUser.role === 'OWNER') {
            res.status(403).json({ success: false, message: 'Cannot modify the Workspace Owner.' });
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { id: targetUserId },
            data: { role: newRole }
        });

        res.status(200).json({ 
            success: true, 
            message: 'Team member role updated successfully.', 
            data: { id: updatedUser.id, role: updatedUser.role } 
        });
    } catch (error: any) {
        console.error('[CRITICAL PRISMA ERROR] Update Team Role:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error updating role.' });
    }
};