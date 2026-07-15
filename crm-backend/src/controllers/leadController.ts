import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';

// ==========================================
// 1. CREATE LEAD (Tenant Isolated)
// ==========================================
export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { firstName, lastName, email, phone } = req.body;
        
        if (!req.user || !req.user.workspaceId) {
            res.status(401).json({ success: false, message: 'Fatal: User workspace context missing.' });
            return;
        }

        if (!firstName) {
            res.status(400).json({ success: false, message: 'First name is required.' });
            return;
        }

        const newLead = await prisma.lead.create({
            data: {
                firstName,
                lastName: lastName || '',
                email: email || '',
                phone: phone || '',
                status: 'NEW',
                workspace: {
                    connect: { id: req.user.workspaceId }
                },
                createdBy: {
                    connect: { id: req.user.id }
                }
            }
        });

        res.status(201).json({ success: true, data: newLead });
    } catch (error: any) {
        console.error('[LEAD CREATION ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to provision lead.' });
    }
};

// ==========================================
// 2. GET LEADS (Tenant Isolated)
// ==========================================
export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.workspaceId) {
            res.status(401).json({ success: false, message: 'Fatal: Workspace context missing.' });
            return;
        }

        const leads = await prisma.lead.findMany({
            where: { 
                workspaceId: req.user.workspaceId 
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, data: leads });
    } catch (error: any) {
        console.error('[LEAD FETCH ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve leads.' });
    }
};

// ==========================================
// 3. UPDATE LEAD STATUS (For Kanban Board)
// ==========================================
export const updateLeadStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.workspaceId) {
            res.status(401).json({ success: false, message: 'Fatal: Workspace context missing.' });
            return;
        }

        const id = String(req.params.id);
        const { status } = req.body;

        if (!status) {
            res.status(400).json({ success: false, message: 'Status is required for update.' });
            return;
        }

        // Verify ownership before allowing update
        const existingLead = await prisma.lead.findUnique({ where: { id } });
        
        if (!existingLead || existingLead.workspaceId !== req.user.workspaceId) {
            res.status(404).json({ success: false, message: 'Lead not found in your highly secure workspace.' });
            return;
        }

        const updatedLead = await prisma.lead.update({
            where: { id },
            data: { status }
        });

        res.status(200).json({ success: true, data: updatedLead });
    } catch (error: any) {
        console.error('[LEAD UPDATE ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to update lead trajectory.' });
    }
};