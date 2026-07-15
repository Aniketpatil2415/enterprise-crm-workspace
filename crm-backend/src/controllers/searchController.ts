import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';

export const globalSearch = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // 🔥 STRICT TENANT ISOLATION
        if (!req.user || !req.user.workspaceId) {
            res.status(401).json({ success: false, message: 'Fatal: Workspace context missing.' });
            return;
        }

        const searchQuery = String(req.query.q || '').trim();

        if (!searchQuery || searchQuery.length < 2) {
            res.status(400).json({ success: false, message: 'Search query must be at least 2 characters long.' });
            return;
        }

        const workspaceId = req.user.workspaceId;

        // 🚀 ENTERPRISE PERFORMANCE: Parallel execution for blazing fast global search
        const [leads, deals, companies, contacts] = await Promise.all([
            prisma.lead.findMany({
                where: {
                    workspaceId,
                    OR: [
                        { firstName: { contains: searchQuery } },
                        { lastName: { contains: searchQuery } },
                        { email: { contains: searchQuery } }
                    ]
                },
                take: 5
            }),
            prisma.deal.findMany({
                where: {
                    workspaceId,
                    title: { contains: searchQuery }
                },
                take: 5
            }),
            prisma.company.findMany({
                where: {
                    workspaceId,
                    name: { contains: searchQuery }
                },
                take: 5
            }),
            prisma.contact.findMany({
                where: {
                    workspaceId,
                    OR: [
                        { firstName: { contains: searchQuery } },
                        { lastName: { contains: searchQuery } },
                        { email: { contains: searchQuery } }
                    ]
                },
                take: 5
            })
        ]);

        res.status(200).json({
            success: true,
            data: { leads, deals, companies, contacts }
        });
    } catch (error: any) {
        console.error('[GLOBAL SEARCH ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to execute global search query.' });
    }
};