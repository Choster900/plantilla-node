import { Router, Request, Response } from 'express';
import { UserModel } from '../models/User';
import bcrypt from 'bcrypt';

const router = Router();

// GET /api/users - Get all users with pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    const users = await UserModel.findAll(limit, offset);
    const total = await UserModel.count();

    // Remove sensitive fields
    const sanitizedUsers = users.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      success: true,
      data: sanitizedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove sensitive field
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/users - Create new user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, username, password, first_name, last_name } = req.body;

    // Basic validations
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, username and password are required'
      });
    }

    // Check if email already exists
    const emailExists = await UserModel.emailExists(email);
    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Check if username already exists
    const usernameExists = await UserModel.usernameExists(username);
    if (usernameExists) {
      return res.status(409).json({
        success: false,
        message: 'Username is already in use'
      });
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await UserModel.create({
      email,
      username,
      password_hash,
      first_name,
      last_name
    });

    // Remove sensitive field
    const { password_hash: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const { email, username, first_name, last_name, is_active, is_verified } = req.body;

    // Check if user exists
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check email conflicts (if being updated)
    if (email && email !== existingUser.email) {
      const emailExists = await UserModel.emailExists(email, id);
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Email is already registered'
        });
      }
    }

    // Check username conflicts (if being updated)
    if (username && username !== existingUser.username) {
      const usernameExists = await UserModel.usernameExists(username, id);
      if (usernameExists) {
        return res.status(409).json({
          success: false,
          message: 'Username is already in use'
        });
      }
    }

    // Update user
    const updatedUser = await UserModel.update(id, {
      email,
      username,
      first_name,
      last_name,
      is_active,
      is_verified
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove sensitive field
    const { password_hash, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/users/:id - Delete user (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const success = await UserModel.softDelete(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
