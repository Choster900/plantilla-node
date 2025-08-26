import { Router, Request, Response } from 'express';
import { ProfileModel, CreateProfileData, UpdateProfileData } from '../models/Profile';
import { UserModel } from '../models/User';

const router = Router();

// GET /api/profiles - Get all profiles
router.get('/', async (req: Request, res: Response) => {
  try {
    const activeOnly = req.query.active_only === 'true';
    const profiles = await ProfileModel.findAll({ active_only: activeOnly });

    res.json({
      success: true,
      data: profiles,
      count: profiles.length
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profiles'
    });
  }
});

// GET /api/profiles/:id - Get profile by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const profileId = parseInt(req.params.id);

    if (isNaN(profileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile ID'
      });
    }

    const profile = await ProfileModel.findById(profileId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// GET /api/profiles/:id/users - Get users assigned to profile
router.get('/:id/users', async (req: Request, res: Response) => {
  try {
    const profileId = parseInt(req.params.id);

    if (isNaN(profileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile ID'
      });
    }

    const profile = await ProfileModel.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const users = await ProfileModel.getUsers(profileId);

    res.json({
      success: true,
      data: {
        profile: {
          id: profile.id,
          name: profile.name,
          description: profile.description
        },
        users: users
      }
    });
  } catch (error) {
    console.error('Error fetching profile users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile users'
    });
  }
});

// POST /api/profiles - Create new profile
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, permissions, is_active } = req.body;

    // Validation
    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Profile name is required and must be a string'
      });
    }

    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Permissions are required and must be an object'
      });
    }

    // Check if profile name already exists
    const existingProfile = await ProfileModel.findByName(name);
    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: 'Profile name already exists'
      });
    }

    const profileData: CreateProfileData = {
      name: name.trim(),
      description: description?.trim() || null,
      permissions,
      is_active: is_active !== undefined ? is_active : true
    };

    const newProfile = await ProfileModel.create(profileData);

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: newProfile
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create profile'
    });
  }
});

// PUT /api/profiles/:id - Update profile
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const profileId = parseInt(req.params.id);

    if (isNaN(profileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile ID'
      });
    }

    const { name, description, permissions, is_active } = req.body;

    // Check if profile exists
    const existingProfile = await ProfileModel.findById(profileId);
    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check if new name conflicts with existing profile
    if (name && name !== existingProfile.name) {
      const nameConflict = await ProfileModel.findByName(name);
      if (nameConflict) {
        return res.status(409).json({
          success: false,
          message: 'Profile name already exists'
        });
      }
    }

    const updateData: UpdateProfileData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (is_active !== undefined) updateData.is_active = is_active;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const updatedProfile = await ProfileModel.update(profileId, updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// DELETE /api/profiles/:id - Soft delete profile
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const profileId = parseInt(req.params.id);

    if (isNaN(profileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile ID'
      });
    }

    // Check if profile exists
    const existingProfile = await ProfileModel.findById(profileId);
    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check if there are users assigned to this profile
    const users = await ProfileModel.getUsers(profileId);
    if (users.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete profile that has users assigned to it',
        data: {
          assignedUsers: users.length
        }
      });
    }

    const deleted = await ProfileModel.softDelete(profileId);

    if (deleted) {
      res.json({
        success: true,
        message: 'Profile deactivated successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate profile'
      });
    }
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate profile'
    });
  }
});

// DELETE /api/profiles/:id/permanent - Permanently delete profile
router.delete('/:id/permanent', async (req: Request, res: Response) => {
  try {
    const profileId = parseInt(req.params.id);

    if (isNaN(profileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile ID'
      });
    }

    const deleted = await ProfileModel.delete(profileId);

    if (deleted) {
      res.json({
        success: true,
        message: 'Profile permanently deleted'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete profile'
      });
    }
  } catch (error) {
    console.error('Error permanently deleting profile:', error);

    if (error instanceof Error && error.message.includes('Cannot delete profile that is assigned to users')) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete profile that has users assigned to it'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete profile'
    });
  }
});

// POST /api/profiles/:id/assign-user - Assign profile to user
router.post('/:id/assign-user', async (req: Request, res: Response) => {
  try {
    const profileId = parseInt(req.params.id);
    const { userId } = req.body;

    if (isNaN(profileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile ID'
      });
    }

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required'
      });
    }

    // Check if profile exists
    const profile = await ProfileModel.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check if user exists
    const user = await UserModel.findById(parseInt(userId));
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const assigned = await UserModel.assignProfile(parseInt(userId), profileId);

    if (assigned) {
      res.json({
        success: true,
        message: 'Profile assigned to user successfully',
        data: {
          userId: parseInt(userId),
          profileId: profileId,
          profileName: profile.name
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to assign profile to user'
      });
    }
  } catch (error) {
    console.error('Error assigning profile to user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign profile to user'
    });
  }
});

// DELETE /api/profiles/:id/remove-user - Remove profile from user
router.delete('/:id/remove-user', async (req: Request, res: Response) => {
  try {
    const profileId = parseInt(req.params.id);
    const { userId } = req.body;

    if (isNaN(profileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile ID'
      });
    }

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required'
      });
    }

    // Check if user exists
    const user = await UserModel.findById(parseInt(userId));
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const removed = await UserModel.removeProfile(parseInt(userId));

    if (removed) {
      res.json({
        success: true,
        message: 'Profile removed from user successfully',
        data: {
          userId: parseInt(userId)
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to remove profile from user'
      });
    }
  } catch (error) {
    console.error('Error removing profile from user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove profile from user'
    });
  }
});

export default router;
