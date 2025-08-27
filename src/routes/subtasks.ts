import { Router, Request, Response } from 'express';
import Subtask from '../models/Subtask';

const router = Router();

// GET /api/subtasks - Get all subtasks or filter by task_id
router.get('/', async (req: Request, res: Response) => {
    try {
        const { task_id, done } = req.query;

        let subtasks;
        if (done !== undefined) {
            const isDone = done === 'true';
            subtasks = await Subtask.getSubtasksByStatus(isDone, task_id as string);
        } else {
            subtasks = await Subtask.getAllSubtasks(task_id as string);
        }

        res.json(subtasks);
    } catch (error) {
        console.error('Error fetching subtasks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/subtasks/:id - Get subtask by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const subtask = await Subtask.getSubtaskById(req.params.id);
        if (!subtask) {
            return res.status(404).json({ message: 'Subtask not found' });
        }
        res.json(subtask);
    } catch (error) {
        console.error('Error fetching subtask:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/subtasks - Create new subtask
router.post('/', async (req: Request, res: Response) => {
    try {
        const newSubtask = await Subtask.createSubtask(req.body);
        res.status(201).json(newSubtask);
    } catch (error) {
        console.error('Error creating subtask:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /api/subtasks/:id - Update subtask
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const updated = await Subtask.updateSubtask(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ message: 'Subtask not found' });
        }
        res.json(updated);
    } catch (error) {
        console.error('Error updating subtask:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /api/subtasks/:id - Delete subtask
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const deleted = await Subtask.deleteSubtask(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Subtask not found' });
        }
        res.json({ message: 'Subtask deleted successfully' });
    } catch (error) {
        console.error('Error deleting subtask:', error);
        res.status(500).json({ message: 'Internal server error' });
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
