import { Router, Request, Response } from 'express';
import Task from '../models/Task';
import { List } from '../models/List';
import { authenticate } from '../middleware/auth';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// GET /api/tasks - Get tasks filtered by user's lists
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { list_id, status } = req.query;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Si se especifica list_id, verificar que pertenece al usuario
        if (list_id) {
            const list = await List.findOne({
                where: {
                    id: list_id as string,
                    owner_id: userId
                }
            });

            if (!list) {
                return res.status(404).json({
                    success: false,
                    message: 'List not found or you do not have access to it'
                });
            }
        }

        let tasks;
        if (status && typeof status === 'string') {
            tasks = await Task.getTasksByStatus(
                status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
                list_id as string,
                userId
            );
        } else {
            tasks = await Task.getAllTasks(list_id as string, userId);
        }

        res.json({
            success: true,
            data: tasks,
            count: tasks.length
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// GET /api/tasks/:id - Get task by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const taskId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const task = await Task.findOne({
            where: { id: taskId },
            include: [{
                model: List,
                as: 'list',
                where: { owner_id: userId },
                required: true,
                attributes: ['id', 'name', 'owner_id']
            }]
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or you do not have access to it'
            });
        }

        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// POST /api/tasks - Create new task
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { list_id } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        if (!list_id) {
            return res.status(400).json({
                success: false,
                message: 'list_id is required'
            });
        }

        // Verificar que la lista pertenece al usuario
        const list = await List.findOne({
            where: {
                id: list_id,
                owner_id: userId
            }
        });

        if (!list) {
            return res.status(404).json({
                success: false,
                message: 'List not found or you do not have access to it'
            });
        }

        const newTask = await Task.createTask(req.body);
        res.status(201).json({
            success: true,
            data: newTask,
            message: 'Task created successfully'
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const taskId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Verificar que la tarea pertenece a una lista del usuario
        const existingTask = await Task.findOne({
            where: { id: taskId },
            include: [{
                model: List,
                as: 'list',
                where: { owner_id: userId },
                required: true
            }]
        });

        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or you do not have access to it'
            });
        }

        const updated = await Task.updateTask(taskId, req.body);
        res.json({
            success: true,
            data: updated,
            message: 'Task updated successfully'
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const taskId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Verificar que la tarea pertenece a una lista del usuario
        const existingTask = await Task.findOne({
            where: { id: taskId },
            include: [{
                model: List,
                as: 'list',
                where: { owner_id: userId },
                required: true
            }]
        });

        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or you do not have access to it'
            });
        }

        const deleted = await Task.deleteTask(taskId);
        if (!deleted) {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete task'
            });
        }

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// PATCH /api/tasks/:id/status - Update task status
router.patch('/:id/status', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const taskId = req.params.id;
        const { status } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        if (!status || !['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: pending, in_progress, completed, or cancelled'
            });
        }

        // Verificar que la tarea pertenece a una lista del usuario
        const existingTask = await Task.findOne({
            where: { id: taskId },
            include: [{
                model: List,
                as: 'list',
                where: { owner_id: userId },
                required: true
            }]
        });

        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or you do not have access to it'
            });
        }

        const updated = await Task.updateTaskStatus(taskId, status);
        res.json({
            success: true,
            data: updated,
            message: 'Task status updated successfully'
        });
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// PATCH /api/tasks/:id/position - Update task position
router.patch('/:id/position', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const taskId = req.params.id;
        const { position } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        if (typeof position !== 'number') {
            return res.status(400).json({
                success: false,
                message: 'Position must be a number'
            });
        }

        // Verificar que la tarea pertenece a una lista del usuario
        const existingTask = await Task.findOne({
            where: { id: taskId },
            include: [{
                model: List,
                as: 'list',
                where: { owner_id: userId },
                required: true
            }]
        });

        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or you do not have access to it'
            });
        }

        const updated = await Task.updateTaskPosition(taskId, position);
        res.json({
            success: true,
            data: updated,
            message: 'Task position updated successfully'
        });
    } catch (error) {
        console.error('Error updating task position:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

export default router;
