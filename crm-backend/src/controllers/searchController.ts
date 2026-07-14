import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';

export const globalSearch = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const workspaceId = req.workspaceId!;
        const searchQuery = req.query.q as string;

        // Protection: Don't search if query is empty or too short (saves database load)
        if (!searchQuery || searchQuery.trim().length < 2) {
            res.status(200).json({ 
                success: true, 
                data: { leads: [], companies: [], contacts: [], deals: [] } 
            });
            return;
        }

        const query = searchQuery.trim();

        // 🔥 ENTERPRISE PERFORMANCE: Run all 4 queries concurrently using Promise.all
        const [leads, companies, contacts, deals] = await Promise.all([
            // 1. Search Leads
            prisma.lead.findMany({
                where: {
                    workspaceId,
                    isDeleted: false,
                    OR: [
                        { firstName: { contains: query } },
                        { lastName: { contains: query } },
                        { email: { contains: query } },
                        { phone: { contains: query } }
                    ]
                },
                select: { id: true, firstName: true, lastName: true, email: true, status: true },
                take: 5 // Limit results for speed
            }),

            // 2. Search Companies
            prisma.company.findMany({
                where: {
                    workspaceId,
                    isDeleted: false,
                    OR: [
                        { name: { contains: query } },
                        { industry: { contains: query } }
                    ]
                },
                select: { id: true, name: true, industry: true },
                take: 5
            }),

            // 3. Search Contacts
            prisma.contact.findMany({
                where: {
                    workspaceId,
                    isDeleted: false,
                    OR: [
                        { firstName: { contains: query } },
                        { lastName: { contains: query } },
                        { email: { contains: query } }
                    ]
                },
                select: { id: true, firstName: true, lastName: true, title: true },
                take: 5
            }),

            // 4. Search Deals
            prisma.deal.findMany({
                where: {
                    workspaceId,
                    isDeleted: false,
                    title: { contains: query }
                },
                select: { id: true, title: true, value: true, stage: true },
                take: 5
            })
        ]);

        res.status(200).json({
            success: true,
            data: { leads, companies, contacts, deals }
        });

    } catch (error: any) {
        console.error('[CRITICAL PRISMA ERROR] Global Search:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error during search execution.' });
    }
};