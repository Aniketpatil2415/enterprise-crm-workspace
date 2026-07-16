import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';

export const createCompany = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.workspaceId) {
            res.status(401).json({ success: false, message: 'Fatal: Workspace context missing.' });
            return;
        }

        // 🔥 FIX: Only taking what is ACTUALLY in your database schema!
        const { name, website, address } = req.body;

        if (!name) {
            res.status(400).json({ success: false, message: 'Company name is required.' });
            return;
        }

        const company = await prisma.company.create({
            data: {
                name,
                website: website || '',
                address: address || '', // Using address instead of industry
                workspace: { connect: { id: req.user.workspaceId } }
            }
        });

        res.status(201).json({ success: true, data: company });
    } catch (error: any) {
        console.error('[COMPANY CREATE ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to provision company record.' });
    }
};

export const getCompanies = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.workspaceId) {
            res.status(401).json({ success: false, message: 'Fatal: Workspace context missing.' });
            return;
        }

        const companies = await prisma.company.findMany({
            where: { workspaceId: req.user.workspaceId },
            include: {
                _count: { select: { contacts: true, deals: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, data: companies });
    } catch (error: any) {
        console.error('[COMPANY FETCH ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve companies.' });
    }
};

export const deleteCompany = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.workspaceId) {
            res.status(401).json({ success: false, message: 'Context missing.' });
            return;
        }

        const id = String(req.params.id);

        const existingCompany = await prisma.company.findUnique({ where: { id } });
        if (!existingCompany || existingCompany.workspaceId !== req.user.workspaceId) {
            res.status(404).json({ success: false, message: 'Company not found in your workspace.' });
            return;
        }

        await prisma.company.delete({ where: { id } });

        res.status(200).json({ success: true, message: 'Company record purged.' });
    } catch (error: any) {
        console.error('[COMPANY DELETE ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to delete company.' });
    }
};