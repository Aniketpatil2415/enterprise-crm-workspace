import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Strictly typing the incoming data for maximum security
interface CreateLeadDTO {
    firstName: string;
    lastName?: string;
    email?: string;
    phone?: string;
    status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'WON' | 'LOST';
    source: string;
}

export class LeadService {
    /**
     * CREATE: Adds a new lead safely connected to the specific Workspace (Tenant)
     */
    static async createLead(workspaceId: string, createdByUserId: string, data: CreateLeadDTO) {
        return await prisma.lead.create({
            data: {
                workspaceId,
                createdByUserId,
                firstName: data.firstName,
                lastName: data.lastName ?? null,
                email: data.email ?? null,
                phone: data.phone ?? null,
                status: data.status,
                source: data.source,
            }
        });
    }
    /**
     * ENTERPRISE SOFT-DELETE: Never permanently delete data. 
     * Flag it as deleted so it can be audited or restored later.
     */
    static async softDeleteLead(workspaceId: string, leadId: string) {
        // First, verify the lead exists and belongs to this exact workspace
        const existingLead = await prisma.lead.findFirst({
            where: { id: leadId, workspaceId: workspaceId, isDeleted: false }
        });

        if (!existingLead) {
            throw new Error('Lead not found, already deleted, or unauthorized access.');
        }

        // Perform the soft delete
        return await prisma.lead.update({
            where: { id: leadId },
            data: { isDeleted: true }
        });
    }

    /**
     * READ: Fetches ONLY active leads for a specific workspace.
     */
    static async getActiveLeadsByWorkspace(workspaceId: string) {
        return await prisma.lead.findMany({
            where: {
                workspaceId: workspaceId,
                isDeleted: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * UPDATE: Changes the pipeline stage (status) of a lead.
     */
    static async updateLeadStatus(workspaceId: string, leadId: string, newStatus: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'WON' | 'LOST') {
        const existingLead = await prisma.lead.findFirst({
            where: { id: leadId, workspaceId: workspaceId }
        });

        if (!existingLead) {
            throw new Error('Lead not found or unauthorized access.');
        }

        return await prisma.lead.update({
            where: { id: leadId },
            data: { status: newStatus }
        });
    }
}