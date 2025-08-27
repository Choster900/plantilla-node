import { Router, Request, Response } from 'express';
import { Profile } from '../models/Profile';

const router = Router();

// GET /api/profiles - Get all profiles (public for now)
router.get('/', async (req: Request, res: Response) => {
  try {
    const profiles = await Profile.findAllProfiles();

    res.json({
      success: true,
      data: profiles
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profiles'
    });
  }
});

// GET /api/profiles/:id - Get profile by ID (public for now)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const profileId = parseInt(req.params.id);

    if (isNaN(profileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile ID'
      });
    }

    const profile = await Profile.findByIdWithUsers(profileId);

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
      message: 'Error fetching profile'
    });
  }
});

// POST /api/profiles - Create new profile (public for now)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, permissions } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Profile name is required'
      });
    }

    // Check if profile with the same name already exists
    const existingProfile = await Profile.findByName(name);
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Profile with this name already exists'
      });
    }

    const profileData = {
      name: name.trim(),
      description: description?.trim(),
      permissions: permissions || {}
    };

    const newProfile = await Profile.createProfile(profileData);

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: newProfile
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating profile'
    });
  }
});

export default router;
