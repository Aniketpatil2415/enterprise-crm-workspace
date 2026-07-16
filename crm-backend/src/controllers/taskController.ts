import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.workspaceId) {
            res.status(401).json({ success: false, message: 'Fatal: Workspace context missing.' });
            return;
        }

        const { title, description, dueDate, assignedToId } = req.body;

        if (!title) {
            res.status(400).json({ success: false, message: 'Task title is required.' });
            return;
        }

        const task = await prisma.task.create({
            data: {
                title,
                description: description || '',
                dueDate: dueDate ? new Date(dueDate) : null,
                // 🔥 FIX: Removed 'isCompleted' because your schema doesn't use it.
                workspace: { connect: { id: req.user.workspaceId } },
                assignee: { connect: { id: assignedToId || req.user.id } }
            }
        });

        res.status(201).json({ success: true, data: task });
    } catch (error: any) {
        console.error('[TASK CREATE ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to create task.' });
    }
};

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.workspaceId) {
            res.status(401).json({ success: false, message: 'Fatal: Workspace context missing.' });
            return;
        }

        const tasks = await prisma.task.findMany({
            where: { workspaceId: req.user.workspaceId },
            include: {
                assignee: { select: { fullName: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, data: tasks });
    } catch (error: any) {
        console.error('[TASK FETCH ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to fetch tasks.' });
    }
};