import { Router, Request, Response } from 'express';
import { Profile } from '../models/Profile';
import List from '../models/List';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const lists = await List.getAllLists();
        res.json(lists);
    } catch (error) {
        console.error('Error fetching lists:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const newList = await List.createList(req.body);
        res.status(201).json(newList);
    } catch (error) {
        console.error('Error creating list:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const updated = await List.updateList(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: 'List not found' });
        res.json(updated);
    } catch (error) {
        console.error('Error updating list:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const deleted = await List.deleteList(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'List not found' });
        res.json({ message: 'List deleted successfully' });
    } catch (error) {
        console.error('Error deleting list:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.patch('/:id/archive', async (req: Request, res: Response) => {
    try {
        const archived = await List.toggleArchive(req.params.id, true);
        if (!archived) return res.status(404).json({ message: 'List not found' });
        res.json(archived);
    } catch (error) {
        console.error('Error archiving list:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
