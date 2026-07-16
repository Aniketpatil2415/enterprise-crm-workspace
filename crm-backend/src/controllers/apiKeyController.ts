import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';
import crypto from 'crypto';

export const createApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // 🔥 THE FIX: Ultra-strict context validation before hitting the database
        if (!req.user || !req.user.workspaceId) {
            res.status(401).json({ success: false, message: 'Fatal: Workspace context missing. Cannot generate key.' });
            return;
        }

        const { name } = req.body;

        if (!name) {
            res.status(400).json({ success: false, message: 'API Key name is required for identification.' });
            return;
        }

        const rawKey = crypto.randomBytes(32).toString('hex');
        const secureApiKey = `fb_live_${rawKey}`;

        const newApiKey = await prisma.apiKey.create({
            data: {
                name,
                key: secureApiKey,
                // Passing verified string explicitly to prevent undefined crashes
                workspace: { connect: { id: String(req.user.workspaceId) } }
            }
        });

        res.status(201).json({ success: true, data: newApiKey });
    } catch (error: any) {
        console.error('[API KEY GENERATION ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to provision secure API Key.' });
    }
};

export const getApiKeys = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.workspaceId) {
            res.status(401).json({ success: false, message: 'Context missing.' });
            return;
        }

        const keys = await prisma.apiKey.findMany({
            where: { workspaceId: req.user.workspaceId },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, data: keys });
    } catch (error: any) {
        console.error('[API KEY FETCH ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve active API keys.' });
    }
};

export const deleteApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.workspaceId) {
            res.status(401).json({ success: false, message: 'Context missing.' });
            return;
        }

        const id = String(req.params.id);

        const existingKey = await prisma.apiKey.findUnique({ where: { id } });
        if (!existingKey || existingKey.workspaceId !== req.user.workspaceId) {
            res.status(404).json({ success: false, message: 'API Key not found or access denied.' });
            return;
        }

        await prisma.apiKey.delete({ where: { id } });

        res.status(200).json({ success: true, message: 'API Key revoked successfully.' });
    } catch (error: any) {
        console.error('[API KEY DELETE ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to revoke API key.' });
    }
};