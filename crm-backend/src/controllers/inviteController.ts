import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';
import crypto from 'crypto';

export const generateInviteLink = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const workspaceId = req.workspaceId!;
        const requestingUserRole = req.user.role;
        const { role, email } = req.body;

        // Enterprise Security: Only OWNER or ADMIN can invite people
        if (requestingUserRole !== 'OWNER' && requestingUserRole !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required to invite.' });
            return;
        }

        // Generate a hyper-secure, random 64-character hex token
        const inviteToken = crypto.randomBytes(32).toString('hex');
        
        // Expiry: 7 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const newInvite = await prisma.workspaceInvite.create({
            data: {
                workspace: { connect: { id: workspaceId } },
                token: inviteToken,
                role: role || 'MEMBER',
                email: email || null,
                expiresAt
            }
        });

        // Construct the frontend invite URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const inviteLink = `${frontendUrl}/join?token=${inviteToken}`;

        res.status(201).json({ 
            success: true, 
            message: 'Invite link generated successfully.',
            data: { inviteLink, expiresAt: newInvite.expiresAt }
        });

    } catch (error: any) {
        console.error('[CRITICAL ERROR] Generate Invite:', error);
        res.status(500).json({ success: false, message: 'Failed to generate invite link.' });
    }
};