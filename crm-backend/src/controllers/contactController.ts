import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';

export const createContact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspaceId = req.workspaceId!;
    const { firstName, lastName, email, phone, title, companyId } = req.body;

    if (!firstName) {
      res.status(400).json({ success: false, message: 'First name is strictly required.' });
      return;
    }

    const newContact = await prisma.contact.create({
      data: {
        workspace: { connect: { id: workspaceId } },
        ...(companyId && { company: { connect: { id: companyId } } }),
        firstName,
        lastName: lastName || null,
        email: email || null,
        phone: phone || null,
        title: title || null,
      },
      include: {
        company: true
      }
    });

    res.status(201).json({ success: true, message: 'Contact successfully registered.', data: newContact });
  } catch (error: any) {
    console.error('[CRITICAL PRISMA ERROR] Create Contact:', error);
    res.status(500).json({ success: false, message: 'Failed to create contact.' });
  }
};

export const getContacts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspaceId = req.workspaceId!;
    
    const contacts = await prisma.contact.findMany({
      where: {
        workspaceId: workspaceId,
        isDeleted: false
      },
      include: {
        company: {
          select: { name: true, industry: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.status(200).json({ success: true, data: contacts });
  } catch (error: any) {
    console.error('[CRITICAL PRISMA ERROR] Get Contacts:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const deleteContact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspaceId = req.workspaceId!;
    const contactId = req.params.id as string;

    const existingContact = await prisma.contact.findFirst({
      where: { id: contactId, workspaceId: workspaceId, isDeleted: false }
    });

    if (!existingContact) {
      res.status(404).json({ success: false, message: 'Contact not found or unauthorized.' });
      return;
    }

    await prisma.contact.update({
      where: { id: contactId },
      data: { isDeleted: true }
    });

    res.status(200).json({ success: true, message: 'Contact archived successfully.' });
  } catch (error: any) {
    console.error('[CRITICAL PRISMA ERROR] Delete Contact:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};