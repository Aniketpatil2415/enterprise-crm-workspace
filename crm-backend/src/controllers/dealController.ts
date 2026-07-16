import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';

export const createDeal = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.workspaceId || !req.user.id) {
            res.status(401).json({ success: false, message: 'Fatal: Workspace or User context missing.' });
            return;
        }

        const { title, value, stage, companyId, contactId } = req.body;

        if (!title || value === undefined) {
            res.status(400).json({ success: false, message: 'Deal title and value are mandatory.' });
            return;
        }

        const deal = await prisma.deal.create({
            data: {
                title,
                value: parseFloat(value),
                stage: stage || 'PROSPECT',
                workspace: { connect: { id: req.user.workspaceId } },
                // 🔥 THE FIX: Explicitly connecting the Deal to the User who created it (owner)
                owner: { connect: { id: req.user.id } },
                ...(companyId && { company: { connect: { id: String(companyId) } } }),
                ...(contactId && { contact: { connect: { id: String(contactId) } } })
            }
        });

        res.status(201).json({ success: true, data: deal });
    } catch (error: any) {
        console.error('[DEAL CREATE ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to initialize deal.' });
    }
};

export const getDeals = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.workspaceId) {
            res.status(401).json({ success: false, message: 'Fatal: Workspace context missing.' });
            return;
        }

        const deals = await prisma.deal.findMany({
            where: { workspaceId: req.user.workspaceId },
            include: {
                company: { select: { name: true } },
                contact: { select: { firstName: true, lastName: true } },
                owner: { select: { fullName: true, email: true } } // Added owner to response for UI
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, data: deals });
    } catch (error: any) {
        console.error('[DEAL FETCH ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to fetch pipeline data.' });
    }
};

export const updateDealStage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.workspaceId) {
            res.status(401).json({ success: false, message: 'Context missing.' });
            return;
        }

        const id = String(req.params.id);
        const { stage } = req.body;

        const existingDeal = await prisma.deal.findUnique({ where: { id } });
        if (!existingDeal || existingDeal.workspaceId !== req.user.workspaceId) {
            res.status(404).json({ success: false, message: 'Deal not found in your workspace.' });
            return;
        }

        const updatedDeal = await prisma.deal.update({
            where: { id },
            data: { stage }
        });

        res.status(200).json({ success: true, data: updatedDeal });
    } catch (error: any) {
        console.error('[DEAL STAGE UPDATE ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to move deal in pipeline.' });
    }
};