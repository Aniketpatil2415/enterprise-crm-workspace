import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';

export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.workspaceId) {
            res.status(401).json({ success: false, message: 'Fatal: Workspace context missing.' });
            return;
        }

        const { content, leadId, dealId, contactId } = req.body;

        if (!content) {
            res.status(400).json({ success: false, message: 'Note content cannot be empty.' });
            return;
        }

        const note = await prisma.note.create({
            data: {
                content,
                workspace: { connect: { id: req.user.workspaceId } },
                createdBy: { connect: { id: req.user.id } },
                // Polymorphic-like connections (Connect to whichever entity was passed)
                ...(leadId && { lead: { connect: { id: String(leadId) } } }),
                ...(dealId && { deal: { connect: { id: String(dealId) } } }),
                ...(contactId && { contact: { connect: { id: String(contactId) } } })
            }
        });

        res.status(201).json({ success: true, data: note });
    } catch (error: any) {
        console.error('[NOTE CREATE ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to save note.' });
    }
};

export const getNotes = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.workspaceId) {
            res.status(401).json({ success: false, message: 'Context missing.' });
            return;
        }

        const notes = await prisma.note.findMany({
            where: { workspaceId: req.user.workspaceId },
            include: {
                createdBy: { select: { fullName: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, data: notes });
    } catch (error: any) {
        console.error('[NOTE FETCH ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve notes.' });
    }
};