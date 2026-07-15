import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';
import crypto from 'crypto';

// ==========================================
// 1. CREATE INVITE (Requires Auth)
// ==========================================
export const createInvite = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.workspaceId) {
            res.status(401).json({ success: false, message: 'Fatal: Workspace context missing.' });
            return;
        }

        const { email, role } = req.body;

        if (!email) {
            res.status(400).json({ success: false, message: 'Email is required for invitation.' });
            return;
        }

        // Check if user is already in the workspace
        const existingUser = await prisma.user.findFirst({
            where: { email, workspaceId: req.user.workspaceId }
        });

        if (existingUser) {
            res.status(400).json({ success: false, message: 'User is already a member of this workspace.' });
            return;
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours expiry

        // 🔥 FIX: Using strict foreign keys instead of nested connects to match your exact schema
        const invite = await prisma.workspaceInvite.create({
            data: {
                email,
                role: role || 'MEMBER',
                token,
                expiresAt,
                isUsed: false, // Changed from status to your schema's boolean field
                workspaceId: req.user.workspaceId // Direct ID mapping
            }
        });

        res.status(201).json({ 
            success: true, 
            message: 'Invitation generated successfully.', 
            data: { token: invite.token } 
        });
    } catch (error: any) {
        console.error('[INVITE CREATION ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to generate workspace invitation.' });
    }
};

// ==========================================
// 2. VERIFY INVITE (Public Route)
// ==========================================
export const verifyInvite = async (req: Request, res: Response): Promise<void> => {
    try {
        // 🔥 FIX: Strict string casting for URL params
        const token = String(req.params.token);

        if (!token || token === 'undefined') {
            res.status(400).json({ success: false, message: 'Invalid token.' });
            return;
        }

        const invite = await prisma.workspaceInvite.findUnique({
            where: { token }
        });

        if (!invite) {
            res.status(404).json({ success: false, message: 'Invitation not found or has been revoked.' });
            return;
        }

        if (invite.expiresAt < new Date()) {
            res.status(400).json({ success: false, message: 'This invitation link has expired.' });
            return;
        }

        // 🔥 FIX: Using your schema's 'isUsed' boolean field
        if (invite.isUsed) {
            res.status(400).json({ success: false, message: 'This invitation has already been used.' });
            return;
        }

        // 🔥 FIX: Manually fetching workspace to bypass relation mapping errors
        const workspace = await prisma.workspace.findUnique({
            where: { id: invite.workspaceId },
            select: { name: true }
        });

        res.status(200).json({
            success: true,
            data: {
                workspaceName: workspace?.name || 'Workspace',
                role: invite.role,
                email: invite.email
            }
        });
    } catch (error: any) {
        console.error('[CRITICAL ERROR] Verify Invite:', error);
        res.status(500).json({ success: false, message: 'Failed to verify invite link.' });
    }
};