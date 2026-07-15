import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { User } from '@prisma/client'; // 🔥 IMPORTING PRISMA'S STRICT TYPE

// 🔥 STRICT TYPING: Forcing TypeScript to recognize the full User object
export interface AuthRequest extends Request {
    user?: User; 
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const firebaseUid = req.headers['x-user-id'] as string;

        if (!firebaseUid) {
            res.status(401).json({ success: false, message: 'Unauthorized: No Auth Token provided.' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { firebaseUid: firebaseUid }
        });

        if (!user) {
            res.status(403).json({ success: false, message: 'Forbidden: User not found in the Fusion Byte database.' });
            return;
        }

        // We attach the verified database user to the request
        req.user = user; 
        next();
    } catch (error: any) {
        console.error('[SECURITY MIDDLEWARE ERROR]', error);
        res.status(500).json({ success: false, message: 'Internal Server Error during authentication.' });
    }
};