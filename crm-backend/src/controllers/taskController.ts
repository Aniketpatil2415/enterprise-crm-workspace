import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/requireAuth';

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const workspaceId = req.workspaceId!;
        const userId = req.user.id;
        const { title, description, priority, dueDate, dealId } = req.body;

        if (!title) {
            res.status(400).json({ success: false, message: 'Task title is strictly required.' });
            return;
        }

        const newTask = await prisma.task.create({
            data: {
                workspace: { connect: { id: workspaceId } },
                assignee: { connect: { id: userId } }, // Automatically assign to the creator for now
                title,
                description: description || null,
                priority: priority || 'MEDIUM',
                dueDate: dueDate ? new Date(dueDate) : null,
                status: 'PENDING',
                ...(dealId && { deal: { connect: { id: dealId } } })
            },
            include: {
                deal: { select: { title: true } }
            }
        });

        res.status(201).json({ success: true, message: 'Task scheduled successfully.', data: newTask });
    } catch (error: any) {
        console.error('[CRITICAL PRISMA ERROR] Create Task:', error);
        res.status(500).json({ success: false, message: 'Failed to create task.' });
    }
};

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const workspaceId = req.workspaceId!;
        const userId = req.user.id;

        const tasks = await prisma.task.findMany({
            where: {
                workspaceId: workspaceId,
                assigneeId: userId, // Only fetch tasks assigned to the current user
                isDeleted: false
            },
            include: {
                deal: { select: { title: true } }
            },
            orderBy: [
                { status: 'asc' }, // Pending/In-progress first
                { dueDate: 'asc' } // Closest deadlines first
            ]
        });

        res.status(200).json({ success: true, data: tasks });
    } catch (error: any) {
        console.error('[CRITICAL PRISMA ERROR] Get Tasks:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const workspaceId = req.workspaceId!;
        const taskId = req.params.id as string;
        const { status } = req.body;

        if (!status) {
            res.status(400).json({ success: false, message: 'Task status is required.' });
            return;
        }

        const existingTask = await prisma.task.findFirst({
            where: { id: taskId, workspaceId: workspaceId, isDeleted: false }
        });

        if (!existingTask) {
            res.status(404).json({ success: false, message: 'Task not found or unauthorized.' });
            return;
        }

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: { status }
        });

        res.status(200).json({ success: true, message: 'Task status updated.', data: updatedTask });
    } catch (error: any) {
        console.error('[CRITICAL PRISMA ERROR] Update Task:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const workspaceId = req.workspaceId!;
        const taskId = req.params.id as string;

        const existingTask = await prisma.task.findFirst({
            where: { id: taskId, workspaceId: workspaceId, isDeleted: false }
        });

        if (!existingTask) {
            res.status(404).json({ success: false, message: 'Task not found.' });
            return;
        }

        // Soft Delete
        await prisma.task.update({
            where: { id: taskId },
            data: { isDeleted: true }
        });

        res.status(200).json({ success: true, message: 'Task archived successfully.' });
    } catch (error: any) {
        console.error('[CRITICAL PRISMA ERROR] Delete Task:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};