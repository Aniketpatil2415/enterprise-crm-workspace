import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extending Express Request to securely hold our User data during the API call
export interface AuthRequest extends Request {
    user?: any;
    workspaceId?: string;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // For now, we use the Firebase UID sent from the frontend headers
    const firebaseUid = req.headers['x-user-id'] as string;

    if (!firebaseUid) {
        res.status(401).json({ success: false, message: 'Unauthorized access. Security token missing.' });
        return;
    }

    try {
        // Find the user and their specific workspace in our MySQL database
        const user = await prisma.user.findUnique({
            where: { firebaseUid }
        });

        if (!user) {
            res.status(401).json({ success: false, message: 'User profile not found in database.' });
            return;
        }

        if (!user.isActive) {
            res.status(403).json({ success: false, message: 'Your account has been suspended.' });
            return;
        }

        // Lock the request to this specific workspace
        req.user = user;
        req.workspaceId = user.workspaceId;
        next(); // Security check passed, proceed to the Controller
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error during security check.' });
    }
};