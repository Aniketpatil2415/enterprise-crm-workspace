import { Response } from 'express';
import { AuthRequest } from '../middlewares/requireAuth';
import { LeadService } from '../services/leadService';

export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const workspaceId = req.workspaceId!;
        const createdByUserId = req.user!.id;
        
        const { firstName, lastName, email, phone, status, source } = req.body;

        if (!firstName) {
            res.status(400).json({ success: false, message: 'Lead first name is strictly required.' });
            return;
        }

        const lead = await LeadService.createLead(workspaceId, createdByUserId, {
            firstName,
            lastName: lastName || null,
            email: email || null,
            phone: phone || null,
            status: status || 'NEW',
            source: source || 'MANUAL'
        } as any);

        res.status(201).json({ success: true, message: 'Lead securely added.', data: lead });
    } catch (error: any) {
        console.error('Lead Creation Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to create lead.' });
    }
};

export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const workspaceId = req.workspaceId!;
        const leads = await LeadService.getActiveLeadsByWorkspace(workspaceId);
        res.status(200).json({ success: true, data: leads });
    } catch (error: any) {
        console.error('Fetch Leads Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch leads.' });
    }
};

export const updateLeadStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const workspaceId = req.workspaceId!;
        const id = req.params.id as string; // 🔥 Fix for TypeScript String Type Error
        const { status } = req.body;

        if (!status) {
            res.status(400).json({ success: false, message: 'New status is required.' });
            return;
        }

        const updatedLead = await LeadService.updateLeadStatus(workspaceId, id, status);
        
        res.status(200).json({ success: true, message: 'Status updated.', data: updatedLead });
    } catch (error: any) {
        console.error('Update Status Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to update lead status.' });
    }
};