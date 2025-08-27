import { Router, Request, Response } from 'express';
import Subtask from '../models/Subtask';
import Task from '../models/Task';
import { List } from '../models/List';
import { authenticate } from '../middleware/auth';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// GET /api/subtasks - Get subtasks filtered by user's tasks
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { task_id, done } = req.query;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Si se especifica task_id, verificar que pertenece al usuario
        if (task_id) {
            const task = await Task.findOne({
                where: { id: task_id as string },
                include: [{
                    model: List,
                    as: 'list',
                    where: { owner_id: userId },
                    required: true
                }]
            });

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found or you do not have access to it'
                });
            }
        }

        let subtasks;
        if (done !== undefined) {
            const isDone = done === 'true';
            subtasks = await Subtask.getSubtasksByStatus(isDone, task_id as string, userId);
        } else {
            subtasks = await Subtask.getAllSubtasks(task_id as string, userId);
        }

        res.json({
            success: true,
            data: subtasks,
            count: subtasks.length
        });
    } catch (error) {
        console.error('Error fetching subtasks:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// GET /api/subtasks/:id - Get subtask by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const subtaskId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const subtask = await Subtask.findOne({
            where: { id: subtaskId },
            include: [{
                model: Task,
                as: 'task',
                required: true,
                include: [{
                    model: List,
                    as: 'list',
                    where: { owner_id: userId },
                    required: true,
                    attributes: ['id', 'name', 'owner_id']
                }]
            }]
        });

        if (!subtask) {
            return res.status(404).json({
                success: false,
                message: 'Subtask not found or you do not have access to it'
            });
        }

        res.json({
            success: true,
            data: subtask
        });
    } catch (error) {
        console.error('Error fetching subtask:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// POST /api/subtasks - Create new subtask
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { task_id } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        if (!task_id) {
            return res.status(400).json({
                success: false,
                message: 'task_id is required'
            });
        }

        // Verificar que la tarea pertenece al usuario
        const task = await Task.findOne({
            where: { id: task_id },
            include: [{
                model: List,
                as: 'list',
                where: { owner_id: userId },
                required: true
            }]
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or you do not have access to it'
            });
        }

        const newSubtask = await Subtask.createSubtask(req.body);
        res.status(201).json({
            success: true,
            data: newSubtask,
            message: 'Subtask created successfully'
        });
    } catch (error) {
        console.error('Error creating subtask:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// PUT /api/subtasks/:id - Update subtask
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const subtaskId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Verificar que la subtarea pertenece al usuario
        const existingSubtask = await Subtask.findOne({
            where: { id: subtaskId },
            include: [{
                model: Task,
                as: 'task',
                required: true,
                include: [{
                    model: List,
                    as: 'list',
                    where: { owner_id: userId },
                    required: true
                }]
            }]
        });

        if (!existingSubtask) {
            return res.status(404).json({
                success: false,
                message: 'Subtask not found or you do not have access to it'
            });
        }

        const updated = await Subtask.updateSubtask(subtaskId, req.body);
        res.json({
            success: true,
            data: updated,
            message: 'Subtask updated successfully'
        });
    } catch (error) {
        console.error('Error updating subtask:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// DELETE /api/subtasks/:id - Delete subtask
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const subtaskId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Verificar que la subtarea pertenece al usuario
        const existingSubtask = await Subtask.findOne({
            where: { id: subtaskId },
            include: [{
                model: Task,
                as: 'task',
                required: true,
                include: [{
                    model: List,
                    as: 'list',
                    where: { owner_id: userId },
                    required: true
                }]
            }]
        });

        if (!existingSubtask) {
            return res.status(404).json({
                success: false,
                message: 'Subtask not found or you do not have access to it'
            });
        }

        const deleted = await Subtask.deleteSubtask(subtaskId);
        if (!deleted) {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete subtask'
            });
        }

        res.json({
            success: true,
            message: 'Subtask deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting subtask:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// PATCH /api/subtasks/:id/toggle - Toggle subtask done status
router.patch('/:id/toggle', async (req: Request, res: Response) => {
    try {
        const updated = await Subtask.toggleSubtask(req.params.id);
        if (!updated) {
            return res.status(404).json({ message: 'Subtask not found' });
        }
        res.json(updated);
    } catch (error) {
        console.error('Error toggling subtask:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PATCH /api/subtasks/:id/position - Update subtask position
router.patch('/:id/position', async (req: Request, res: Response) => {
    try {
        const { position } = req.body;

        if (typeof position !== 'number') {
            return res.status(400).json({ message: 'Position must be a number' });
        }

        const updated = await Subtask.updateSubtaskPosition(req.params.id, position);
        if (!updated) {
            return res.status(404).json({ message: 'Subtask not found' });
        }
        res.json(updated);
    } catch (error) {
        console.error('Error updating subtask position:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
