import { Router, Request, Response } from 'express';
import Task from '../models/Task';

const router = Router();

// GET /api/tasks - Get all tasks or filter by list_id
router.get('/', async (req: Request, res: Response) => {
    try {
        const { list_id, status } = req.query;

        let tasks;
        if (status && typeof status === 'string') {
            tasks = await Task.getTasksByStatus(
                status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
                list_id as string
            );
        } else {
            tasks = await Task.getAllTasks(list_id as string);
        }

        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/tasks/:id - Get task by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const task = await Task.getTaskById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/tasks - Create new task
router.post('/', async (req: Request, res: Response) => {
    try {
        const newTask = await Task.createTask(req.body);
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const updated = await Task.updateTask(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(updated);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const deleted = await Task.deleteTask(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PATCH /api/tasks/:id/status - Update task status
router.patch('/:id/status', async (req: Request, res: Response) => {
    try {
        const { status } = req.body;

        if (!status || !['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be: pending, in_progress, completed, or cancelled' });
        }

        const updated = await Task.updateTaskStatus(req.params.id, status);
        if (!updated) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(updated);
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PATCH /api/tasks/:id/position - Update task position
router.patch('/:id/position', async (req: Request, res: Response) => {
    try {
        const { position } = req.body;

        if (typeof position !== 'number') {
            return res.status(400).json({ message: 'Position must be a number' });
        }

        const updated = await Task.updateTaskPosition(req.params.id, position);
        if (!updated) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(updated);
    } catch (error) {
        console.error('Error updating task position:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
