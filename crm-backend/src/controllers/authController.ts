import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import crypto from 'crypto'; // 🔥 Added native crypto for generating unique Tenant IDs

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Extract data from Frontend payload
        const { firebaseUid, email, fullName } = req.body;

        // 2. Strict Validation
        if (!firebaseUid || !email || !fullName) {
            res.status(400).json({ 
                success: false, 
                message: 'CRITICAL: Missing required fields (firebaseUid, email, fullName).' 
            });
            return;
        }

        // 3. Prevent Duplicates
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { firebaseUid }] }
        });

        if (existingUser) {
            res.status(400).json({ success: false, message: 'User already exists in the CRM core.' });
            return;
        }

        // 🔥 FIX: Generate a highly secure, unique Tenant UID for Custom Domain routing
        const baseSlug = fullName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
        const randomHash = crypto.randomBytes(4).toString('hex');
        const generatedTenantUid = `${baseSlug}-${randomHash}`;

        // 4. Enterprise Transaction: Create Workspace AND User atomically
        const result = await prisma.$transaction(async (tx) => {
            const workspace = await tx.workspace.create({
                data: {
                    name: `${fullName}'s Workspace`,
                    isActive: true,
                    tenantUid: generatedTenantUid // 🔥 PASSED THE MISSING PROPERTY HERE
                }
            });

            const user = await tx.user.create({
                data: {
                    firebaseUid,
                    email,
                    fullName,
                    role: 'OWNER',
                    workspaceId: workspace.id,
                    isSuperAdmin: false
                }
            });

            return { user, workspace };
        });

        res.status(201).json({
            success: true,
            message: 'User and Workspace provisioned successfully.',
            data: result
        });
    } catch (error: any) {
        console.error('[AUTH ERROR] Registration failed:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error during provisioning.' });
    }
};