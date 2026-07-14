import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';
import crypto from 'crypto';

export const generateApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const workspaceId = req.workspaceId!;
        const requestingUserRole = req.user.role;
        const { name } = req.body;

        if (requestingUserRole !== 'OWNER' && requestingUserRole !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required to generate keys.' });
            return;
        }

        if (!name) {
            res.status(400).json({ success: false, message: 'API Key integration name is strictly required.' });
            return;
        }

        const rawKey = crypto.randomBytes(32).toString('hex');
        const secureApiKey = `fb_live_${rawKey}`;

        const newApiKey = await prisma.apiKey.create({
            data: {
                workspace: { connect: { id: workspaceId } },
                name,
                key: secureApiKey
            }
        });

        res.status(201).json({
            success: true,
            message: 'API Key generated successfully. Save this key now, it will not be shown again.',
            data: newApiKey
        });
    } catch (error: any) {
        console.error('[CRITICAL PRISMA ERROR] Generate API Key:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error while generating API Key.' });
    }
};

export const getApiKeys = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const workspaceId = req.workspaceId!;
        const requestingUserRole = req.user.role;

        if (requestingUserRole !== 'OWNER' && requestingUserRole !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required to view keys.' });
            return;
        }

        const apiKeys = await prisma.apiKey.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' }
        });

        // STRICT TYPE FIX: Added :any to prevent implicit any errors when Prisma cache fails
        const maskedKeys = apiKeys.map((keyObj: any) => ({
            ...keyObj,
            key: `fb_live_...${keyObj.key.slice(-6)}`
        }));

        res.status(200).json({ success: true, data: maskedKeys });
    } catch (error: any) {
        console.error('[CRITICAL PRISMA ERROR] Fetch API Keys:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error while fetching API Keys.' });
    }
};

export const revokeApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const workspaceId = req.workspaceId!;
        const keyId = req.params.id as string;
        const requestingUserRole = req.user.role;

        if (requestingUserRole !== 'OWNER' && requestingUserRole !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required to revoke keys.' });
            return;
        }

        const existingKey = await prisma.apiKey.findFirst({
            where: { id: keyId, workspaceId }
        });

        if (!existingKey) {
            res.status(404).json({ success: false, message: 'API Key not found or unauthorized.' });
            return;
        }

        await prisma.apiKey.delete({
            where: { id: keyId }
        });

        res.status(200).json({ success: true, message: 'API Key permanently revoked and destroyed.' });
    } catch (error: any) {
        console.error('[CRITICAL PRISMA ERROR] Revoke API Key:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error while revoking API Key.' });
    }
};