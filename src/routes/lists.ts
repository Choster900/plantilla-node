import { Router, Request, Response } from 'express';
import { List } from '../models/List';
import { authenticate } from '../middleware/auth';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// GET /api/lists - Get user's lists
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const lists = await List.getAllLists(userId);

    res.json({
      success: true,
      data: lists,
      count: lists.length
    });
  } catch (error) {
    console.error('Error fetching user lists:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lists'
    });
  }
});

// GET /api/lists/:id - Get specific list by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const listId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const list = await List.findOne({
      where: {
        id: listId,
        owner_id: userId
      }
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found or you do not have access to it'
      });
    }

    res.json({
      success: true,
      data: list
    });
  } catch (error) {
    console.error('Error fetching list:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching list'
    });
  }
});

// POST /api/lists - Create new list
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { name, description, is_archived } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'List name is required'
      });
    }

    // Crear la lista con el ID del usuario del JWT
    const listData = {
      owner_id: userId,
      name,
      description,
      is_archived: is_archived || false
    };

    const newList = await List.createList(listData);

    res.status(201).json({
      success: true,
      data: newList,
      message: 'List created successfully'
    });
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating list'
    });
  }
});

// PUT /api/lists/:id - Update list
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const listId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Verificar que la lista pertenece al usuario
    const existingList = await List.findOne({
      where: {
        id: listId,
        owner_id: userId
      }
    });

    if (!existingList) {
      return res.status(404).json({
        success: false,
        message: 'List not found or you do not have access to it'
      });
    }

    const { name, description, is_archived } = req.body;
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (is_archived !== undefined) updateData.is_archived = is_archived;

    const updatedList = await List.updateList(listId, updateData);

    res.json({
      success: true,
      data: updatedList,
      message: 'List updated successfully'
    });
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating list'
    });
  }
});

// DELETE /api/lists/:id - Delete list
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const listId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Verificar que la lista pertenece al usuario
    const existingList = await List.findOne({
      where: {
        id: listId,
        owner_id: userId
      }
    });

    if (!existingList) {
      return res.status(404).json({
        success: false,
        message: 'List not found or you do not have access to it'
      });
    }

    const deleted = await List.deleteList(listId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete list'
      });
    }

    res.json({
      success: true,
      message: 'List deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting list'
    });
  }
});

// PATCH /api/lists/:id/archive - Toggle archive status
router.patch('/:id/archive', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const listId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Verificar que la lista pertenece al usuario
    const existingList = await List.findOne({
      where: {
        id: listId,
        owner_id: userId
      }
    });

    if (!existingList) {
      return res.status(404).json({
        success: false,
        message: 'List not found or you do not have access to it'
      });
    }

    const { archive } = req.body;
    const archiveStatus = archive !== undefined ? archive : !existingList.is_archived;

    const updatedList = await List.toggleArchive(listId, archiveStatus);

    res.json({
      success: true,
      data: updatedList,
      message: `List ${archiveStatus ? 'archived' : 'unarchived'} successfully`
    });
  } catch (error) {
    console.error('Error toggling archive status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating list archive status'
    });
  }
});

export default router;
