import { BaseSeeder } from '../BaseSeeder';
import { query } from '../connection';

export class ProfilesSeeder extends BaseSeeder {
  name = 'profiles_seeder';
  description = 'Create default user profiles';

  async run(): Promise<void> {
    // Insert default profiles
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
          profile: ['read', 'update']
        }
      },
      {
        name: 'viewer',
        description: 'Read-only access to system',
        permissions: {
          content: ['read']
        }
      }
    ];

    console.log('Inserting profiles...');

    for (const profile of profiles) {
      // Check if profile already exists
      const existing = await query(
        'SELECT id FROM profiles WHERE name = $1',
        [profile.name]
      );

      if (existing.rows.length === 0) {
        await query(
          'INSERT INTO profiles (name, description, permissions, is_active) VALUES ($1, $2, $3, $4)',
          [profile.name, profile.description, JSON.stringify(profile.permissions), true]
        );
        console.log(`Profile "${profile.name}" created successfully`);
      } else {
        console.log(`Profile "${profile.name}" already exists, skipping...`);
      }
    }

    console.log('Profiles seeding completed');
  }
}

// Export the seeder instance
export const profilesSeeder = new ProfilesSeeder();
