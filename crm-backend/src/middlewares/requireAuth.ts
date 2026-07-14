import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma'; // Using our Singleton Prisma client

// Extending Express Request to safely inject user data
export interface AuthRequest extends Request {
  workspaceId?: string;
  user?: any;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Extract the secure Firebase UID sent by the frontend
    const firebaseUid = req.headers['x-user-id'] as string;

    if (!firebaseUid) {
      res.status(401).json({ success: false, message: 'Unauthorized: Missing User ID header. Please log in again.' });
      return;
    }

    // 2. Fetch the actual Enterprise User and their Workspace from MySQL
    const user = await prisma.user.findUnique({
      where: { firebaseUid: firebaseUid },
      include: { workspace: true } // Crucial: We need the workspace ID
    });

    if (!user) {
      res.status(403).json({ success: false, message: 'Forbidden: User not found in the CRM database.' });
      return;
    }

    // 3. Attach the secure data to the request so controllers can use it
    req.user = user;
    req.workspaceId = user.workspaceId;

    // 4. Let the request proceed to the Controller (createLead, updateLeadStatus, etc.)
    next();
  } catch (error) {
    console.error('[AUTH MIDDLEWARE ERROR]:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error during authentication.' });
  }
};