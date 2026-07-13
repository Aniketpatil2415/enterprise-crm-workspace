import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export const registerWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firebaseUid, email, fullName, workspaceName } = req.body;

    // Strict validation
    if (!firebaseUid || !email || !fullName || !workspaceName) {
      res.status(400).json({ success: false, message: 'All fields are strictly required.' });
      return;
    }

    const result = await AuthService.registerTenant({ firebaseUid, email, fullName, workspaceName });

    res.status(201).json({
      success: true,
      message: 'Workspace and Owner created successfully.',
      data: result,
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    // Handle Prisma unique constraint error (e.g., email already exists)
    if (error.code === 'P2002') {
      res.status(409).json({ success: false, message: 'User or Workspace already exists.' });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};