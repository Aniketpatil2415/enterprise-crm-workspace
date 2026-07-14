import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export const requireApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const apiKeyHeader = req.headers['x-api-key'] as string;

    // 1. Initial Format Validation
    if (!apiKeyHeader || !apiKeyHeader.startsWith('fb_live_')) {
      res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid API Key format.' });
      return;
    }

    // 2. Database Validation
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKeyHeader }
    });

    if (!apiKeyRecord || !apiKeyRecord.isActive) {
      res.status(403).json({ success: false, message: 'Forbidden: API Key is invalid, suspended, or revoked.' });
      return;
    }

    // 3. Telemetry: Update the 'lastUsedAt' timestamp in the background
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() }
    });

    // 4. Attach the Workspace ID to the request so subsequent controllers know where to route the data
    (req as any).workspaceId = apiKeyRecord.workspaceId;
    
    next();
  } catch (error: any) {
    console.error('[API KEY MIDDLEWARE ERROR]:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error while validating API Key.' });
  }
};