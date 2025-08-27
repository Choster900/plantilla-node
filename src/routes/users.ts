import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcrypt';

const router = Router();

// GET /api/users - Get all users with pagination (public for now)
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await User.getAllUsers();

    res.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    // Basic UUID validation
    if (!userId || userId.length !== 36) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const user = await User.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
});

// POST /api/users - Create new user (public for now)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, password, profile_id } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      email: email.toLowerCase().trim(),
      password_hash: hashedPassword,
      profile_id: profile_id || null
    };

    const newUser = await User.createUser(userData);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user'
    });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { email, password, profile_id } = req.body;

    // Basic UUID validation
    if (!userId || userId.length !== 36) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const updateData: any = {};

    if (email) {
      // Check if email already exists for another user
      const emailExists = await User.emailExists(email, userId);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another user'
        });
      }
      updateData.email = email.toLowerCase().trim();
    }

    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    if (profile_id !== undefined) {
      updateData.profile_id = profile_id;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const updatedUser = await User.updateUser(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    // Basic UUID validation
    if (!userId || userId.length !== 36) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const deleted = await User.deleteUser(userId);

    if (!deleted) {
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
      message: 'Error deleting user'
    });
  }
});

export default router;
