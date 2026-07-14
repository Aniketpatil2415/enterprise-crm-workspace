import { Response, Request } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';
import crypto from 'crypto';

export const generateInviteLink = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspaceId = req.workspaceId!;
    const requestingUserRole = req.user.role;
    const { role, email } = req.body;

    if (requestingUserRole !== 'OWNER' && requestingUserRole !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required to invite.' });
      return;
    }

    const inviteToken = crypto.randomBytes(32).toString('hex');
    
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

export const verifyInviteToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // STRICT TYPE FIX: Explicitly cast to string
    const token = req.params.token as string;

    if (!token) {
      res.status(400).json({ success: false, message: 'Token is required.' });
      return;
    }

    const invite = await prisma.workspaceInvite.findUnique({
      where: { token: token },
      include: { workspace: { select: { name: true } } }
    });

    if (!invite) {
      res.status(404).json({ success: false, message: 'Invalid or missing invite link.' });
      return;
    }

    if (invite.isUsed) {
      res.status(400).json({ success: false, message: 'This invite link has already been claimed.' });
      return;
    }

    if (new Date() > invite.expiresAt) {
      res.status(400).json({ success: false, message: 'This invite link has expired. Request a new one.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        // STRICT TYPE FIX: Optional chaining for safe access
        workspaceName: invite.workspace?.name || 'Workspace',
        role: invite.role,
        email: invite.email
      }
    });
  } catch (error: any) {
    console.error('[CRITICAL ERROR] Verify Invite:', error);
    res.status(500).json({ success: false, message: 'Failed to verify invite link.' });
  }
};