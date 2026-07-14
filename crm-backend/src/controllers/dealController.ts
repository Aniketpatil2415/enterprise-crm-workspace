import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';

export const createDeal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspaceId = req.workspaceId!;
    const userId = req.user.id;
    const { title, value, stage, companyId, contactId, expectedCloseDate } = req.body;

    console.log(`[API CREATE DEAL] Workspace: ${workspaceId}, Title: ${title}, Value: ${value}`);

    if (!title) {
      res.status(400).json({ success: false, message: 'Deal title is strictly required.' });
      return;
    }

    const newDeal = await prisma.deal.create({
      data: {
        workspace: { connect: { id: workspaceId } },
        owner: { connect: { id: userId } },
        title,
        value: value ? parseFloat(value) : 0.0,
        stage: stage || 'DISCOVERY',
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        
        // Safely connect Company and Contact if provided
        ...(companyId && { company: { connect: { id: companyId } } }),
        ...(contactId && { contact: { connect: { id: contactId } } }),
      },
      include: {
        company: { select: { name: true } },
        contact: { select: { firstName: true, lastName: true } }
      }
    });

    res.status(201).json({ success: true, message: 'Revenue Deal created successfully.', data: newDeal });
  } catch (error: any) {
    console.error('[CRITICAL PRISMA ERROR] Create Deal:', error);
    res.status(500).json({ success: false, message: 'Failed to create deal.' });
  }
};

export const getDeals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspaceId = req.workspaceId!;
    
    const deals = await prisma.deal.findMany({
      where: {
        workspaceId: workspaceId,
        isDeleted: false
      },
      include: {
        company: { select: { name: true } },
        contact: { select: { firstName: true, lastName: true } },
        owner: { select: { fullName: true } }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.status(200).json({ success: true, data: deals });
  } catch (error: any) {
    console.error('[CRITICAL PRISMA ERROR] Get Deals:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};