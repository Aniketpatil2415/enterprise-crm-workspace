import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';

export const createContact = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.workspaceId) {
            res.status(401).json({ success: false, message: 'Fatal: Workspace context missing.' });
            return;
        }

        const { firstName, lastName, email, phone, companyId } = req.body;

        if (!firstName) {
            res.status(400).json({ success: false, message: 'First name is mandatory for a contact.' });
            return;
        }

        const contact = await prisma.contact.create({
            data: {
                firstName,
                lastName: lastName || '',
                email: email || '',
                phone: phone || '',
                workspace: { connect: { id: req.user.workspaceId } },
                // Optional relation to Company
                ...(companyId && { company: { connect: { id: String(companyId) } } })
            }
        });

        res.status(201).json({ success: true, data: contact });
    } catch (error: any) {
        console.error('[CONTACT CREATE ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to provision contact.' });
    }
};

export const getContacts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.workspaceId) {
            res.status(401).json({ success: false, message: 'Context missing.' });
            return;
        }

        const contacts = await prisma.contact.findMany({
            where: { workspaceId: req.user.workspaceId },
            include: {
                company: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, data: contacts });
    } catch (error: any) {
        console.error('[CONTACT FETCH ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve contacts.' });
    }
};