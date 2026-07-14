import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';

export const createCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspaceId = req.workspaceId!;
    const { name, industry, website, address } = req.body;

    console.log(`[API CREATE COMPANY] Workspace: ${workspaceId}, Name: ${name}`);

    if (!name) {
      res.status(400).json({ success: false, message: 'Company name is strictly required.' });
      return;
    }

    const newCompany = await prisma.company.create({
      data: {
        workspace: { connect: { id: workspaceId } },
        name,
        industry: industry || null,
        website: website || null,
        address: address || null,
      }
    });

    res.status(201).json({ success: true, message: 'Enterprise Client added successfully.', data: newCompany });
  } catch (error: any) {
    console.error('[CRITICAL PRISMA ERROR] Create Company:', error);
    res.status(500).json({ success: false, message: `Failed to create company. Error: ${error.message || 'Unknown'}` });
  }
};

export const getCompanies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspaceId = req.workspaceId!;
    
    // Fetch only active companies for this specific workspace, ordered by newest first
    const companies = await prisma.company.findMany({
      where: {
        workspaceId: workspaceId,
        isDeleted: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.status(200).json({ success: true, data: companies });
  } catch (error: any) {
    console.error('[CRITICAL PRISMA ERROR] Get Companies:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error while fetching companies.' });
  }
};

export const deleteCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspaceId = req.workspaceId!;
    const companyId = req.params.id as string;

    const existingCompany = await prisma.company.findFirst({
      where: { id: companyId, workspaceId: workspaceId, isDeleted: false }
    });

    if (!existingCompany) {
      res.status(404).json({ success: false, message: 'Company not found or unauthorized.' });
      return;
    }

    // Enterprise Soft-Delete Mechanism: Never truly delete, just hide
    await prisma.company.update({
      where: { id: companyId },
      data: { isDeleted: true }
    });

    res.status(200).json({ success: true, message: 'Company archived successfully.' });
  } catch (error: any) {
    console.error('[CRITICAL PRISMA ERROR] Delete Company:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error while deleting company.' });
  }
};