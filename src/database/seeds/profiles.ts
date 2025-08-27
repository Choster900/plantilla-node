import { BaseSeeder } from '../BaseSeeder';
import { Profile } from '../../models/Profile';

export class ProfilesSeeder extends BaseSeeder {
  name = 'profiles_seeder';
  description = 'Create default user profiles';

  async run(): Promise<void> {
    // Insert default profiles using Sequelize model
    const profiles = [
      {
        name: 'admin',
        description: 'Administrator with full system access',
        permissions: {
          users: ['create', 'read', 'update', 'delete'],
          profiles: ['create', 'read', 'update', 'delete'],
          system: ['manage']
        }
      },
      {
        name: 'editor',
        description: 'Editor with content management permissions',
        permissions: {
          users: ['read', 'update'],
          content: ['create', 'read', 'update', 'delete']
        }
      },
      {
        name: 'user',
        description: 'Standard user with basic permissions',
        permissions: {
          users: ['read'],
          content: ['read']
        }
      },
      {
        name: 'viewer',
        description: 'Read-only access to system',
        permissions: {
          content: ['read']
        }
      }
    ] as Array<{
      name: string;
      description: string;
      permissions: Record<string, string[]>;
    }>;

    console.log('Inserting profiles...');

    for (const profileData of profiles) {
      // Check if profile already exists
      const existingProfile = await Profile.findOne({
        where: { name: profileData.name }
      });

      if (!existingProfile) {
        await Profile.create(profileData);
        console.log(`Profile "${profileData.name}" created successfully`);
      } else {
        console.log(`Profile "${profileData.name}" already exists, skipping...`);
      }
    }

    console.log('Profiles seeding completed');
  }
}
