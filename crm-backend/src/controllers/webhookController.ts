import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const injectLeadViaWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const workspaceId = (req as any).workspaceId;
    const { firstName, lastName, email, phone, source } = req.body;

    if (!firstName) {
      res.status(400).json({ success: false, message: 'First name is strictly required.' });
      return;
    }

    // Find the workspace owner
    const owner = await prisma.user.findFirst({
      where: { workspaceId: workspaceId, role: 'OWNER' }
    });

    // STRICT TYPE FIX: Constructing the object cleanly to avoid 'undefined' TS errors in Prisma
    const leadData: any = {
      workspace: { connect: { id: workspaceId } },
      firstName,
      lastName: lastName || null,
      email: email || null,
      phone: phone || null,
      status: 'NEW',
      source: source || 'API_WEBHOOK',
      order: 0
    };

    // Safely attach the owner if they exist
    if (owner && owner.id) {
      leadData.createdBy = { connect: { id: owner.id } };
    }

    const newLead = await prisma.lead.create({ data: leadData });

    // STRICT TYPE FIX for Note generation
    const noteData: any = {
      workspace: { connect: { id: workspaceId } },
      lead: { connect: { id: newLead.id } },
      content: `Lead automatically ingested via API Webhook (Source: ${source || 'External API'}).`,
      isSystem: true
    };

    if (owner && owner.id) {
      noteData.createdBy = { connect: { id: owner.id } };
    }

    await prisma.note.create({ data: noteData });

    res.status(201).json({ 
      success: true, 
      message: 'Lead securely injected into Fusion Byte CRM.',
      data: { leadId: newLead.id }
    });
  } catch (error: any) {
    console.error('[CRITICAL WEBHOOK ERROR]:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error during data injection.' });
  }
};