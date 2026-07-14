import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; // THE FIX: Using the Singleton Client

// Extending Express Request to include our custom Auth tokens
interface AuthRequest extends Request {
  workspaceId?: string;
  user?: any;
}

export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspaceId = req.workspaceId!;
    // FIX 1: Extract the MySQL database 'id', NOT the firebase 'uid'
    const userId = req.user.id; 
    const { firstName, lastName, email, phone, status } = req.body;

    // DEBUG LOG: Ensure we are receiving data from the frontend
    console.log(`[API CREATE LEAD] Workspace: ${workspaceId}, User: ${userId}, Name: ${firstName}`);

    if (!firstName) {
      res.status(400).json({ success: false, message: 'First name is required.' });
      return;
    }

    // FIX 2: Using Prisma's ultra-secure 'connect' syntax for relational data
    const newLead = await prisma.lead.create({
      data: {
        workspace: {
          connect: { id: workspaceId }
        },
        createdBy: {
          connect: { id: userId }
        },
        firstName,
        lastName: lastName || null,
        email: email || null,
        phone: phone || null,
        status: status || 'NEW',
        order: 0,
      }
    });

    res.status(201).json({ success: true, message: 'Lead successfully created.', data: newLead });
  } catch (error: any) {
    // CRITICAL: Print the exact error to the terminal so we never fly blind
    console.error('[CRITICAL PRISMA ERROR] Create Lead:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to create lead in database. Error: ${error.message || 'Unknown'}` 
    });
  }
};

export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspaceId = req.workspaceId!;
    
    // Only fetch leads that are NOT soft-deleted
    const leads = await prisma.lead.findMany({
      where: {
        workspaceId: workspaceId,
        isDeleted: false
      },
      orderBy: {
        order: 'asc'
      }
    });
    
    res.status(200).json({ success: true, data: leads });
  } catch (error: any) {
    console.error('API Error Get Leads:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const updateLeadStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspaceId = req.workspaceId!;
    const leadId = req.params.id as string;
    const { status, order } = req.body;

    // DEBUG LOG: See exactly what the frontend is sending
    console.log(`[API UPDATE LEAD] ID: ${leadId}, New Status: ${status}, New Order: ${order}`);

    if (!status) {
      res.status(400).json({ success: false, message: 'Status is required.' });
      return;
    }

    const existingLead = await prisma.lead.findFirst({
      where: { id: leadId, workspaceId: workspaceId, isDeleted: false }
    });

    if (!existingLead) {
      res.status(404).json({ success: false, message: 'Lead not found or unauthorized.' });
      return;
    }

    // SAFE UPDATE: Prevent NaN or undefined crashes
    const safeOrder = order !== undefined && order !== null ? Number(order) : existingLead.order;

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: status,
        order: safeOrder
      }
    });

    res.status(200).json({ success: true, message: 'Lead position synchronized.', data: updatedLead });
  } catch (error: any) {
    // CRITICAL: Print the exact Prisma failure to the terminal
    console.error('[CRITICAL PRISMA ERROR] Update Lead:', error);
    
    // Send the actual technical error to the frontend so we don't fly blind
    res.status(500).json({ 
      success: false, 
      message: `DB Error: ${error.message || 'Failed to sync with MySQL'}` 
    });
  }
};

export const deleteLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspaceId = req.workspaceId!;
    const leadId = req.params.id as string;

    const existingLead = await prisma.lead.findFirst({
      where: { id: leadId, workspaceId: workspaceId, isDeleted: false }
    });

    if (!existingLead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    // Soft Delete Mechanism
    await prisma.lead.update({
      where: { id: leadId },
      data: { isDeleted: true }
    });

    res.status(200).json({ success: true, message: 'Lead archived successfully.' });
  } catch (error: any) {
    console.error('API Error Delete Lead:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};