import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';

export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const workspaceId = req.workspaceId!;
        const userId = req.user.id;
        const { content, leadId, companyId, contactId, dealId, isSystem } = req.body;

        if (!content) {
            res.status(400).json({ success: false, message: 'Note content cannot be empty.' });
            return;
        }

        const newNote = await prisma.note.create({
            data: {
                workspace: { connect: { id: workspaceId } },
                createdBy: { connect: { id: userId } },
                content,
                isSystem: isSystem || false,
                ...(leadId && { lead: { connect: { id: leadId } } }),
                ...(companyId && { company: { connect: { id: companyId } } }),
                ...(contactId && { contact: { connect: { id: contactId } } }),
                ...(dealId && { deal: { connect: { id: dealId } } })
            },
            include: {
                createdBy: { select: { email: true, fullName: true } }
            }
        });

        res.status(201).json({ success: true, message: 'Note added successfully.', data: newNote });
    } catch (error: any) {
        console.error('[CRITICAL PRISMA ERROR] Create Note:', error);
        res.status(500).json({ success: false, message: 'Failed to save the note.' });
    }
};

export const getNotes = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const workspaceId = req.workspaceId!;
        // Extract filters from query parameters
        const { leadId, companyId, contactId, dealId } = req.query;

        const notes = await prisma.note.findMany({
            where: {
                workspaceId,
                isDeleted: false,
                ...(leadId && { leadId: leadId as string }),
                ...(companyId && { companyId: companyId as string }),
                ...(contactId && { contactId: contactId as string }),
                ...(dealId && { dealId: dealId as string })
            },
            include: {
                createdBy: { select: { email: true, fullName: true } }
            },
            orderBy: {
                createdAt: 'desc' // Newest notes first
            }
        });

        res.status(200).json({ success: true, data: notes });
    } catch (error: any) {
        console.error('[CRITICAL PRISMA ERROR] Get Notes:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error fetching notes.' });
    }
};