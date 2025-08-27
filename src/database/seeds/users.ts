import { BaseSeeder } from '../BaseSeeder';
import { User } from '../../models/User';
import { Profile } from '../../models/Profile';
import bcrypt from 'bcrypt';

export class UsersSeeder extends BaseSeeder {
  name = 'users_seeder';
  description = 'Create default test users with profiles';

  async run(): Promise<void> {
    // Test user data
    const testUsers = [
      {
        email: 'admin@test.com',
        username: 'admin',
        password: 'admin123',
        first_name: 'Administrator',
        last_name: 'System',
        profile_name: 'admin'
      },
      {
        email: 'editor@test.com',
        username: 'editor',
        password: 'editor123',
        first_name: 'Content',
        last_name: 'Editor',
        profile_name: 'editor'
      },
      {
        email: 'user@test.com',
        username: 'user',
        password: 'user123',
        first_name: 'Test',
        last_name: 'User',
        profile_name: 'user'
      },
      {
        email: 'viewer@test.com',
        username: 'viewer',
        password: 'viewer123',
        first_name: 'Read',
        last_name: 'Only',
        profile_name: 'viewer'
      }
    ];

    console.log('Creating test users...');

    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({
          where: { email: userData.email }
        });

        if (existingUser) {
          console.log(`User "${userData.email}" already exists, skipping...`);
          continue;
        }

        // Find the profile
        const profile = await Profile.findOne({
          where: { name: userData.profile_name }
        });

        if (!profile) {
          console.warn(`Profile "${userData.profile_name}" not found for user ${userData.email}, skipping...`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user
        const newUser = await User.create({
          email: userData.email,
          username: userData.username,
          password_hash: hashedPassword,
          first_name: userData.first_name,
          last_name: userData.last_name,
          profile_id: profile.id,
          is_active: true,
          is_verified: true
        });

        console.log(`User "${userData.email}" created successfully with ID: ${newUser.id}`);

      } catch (error) {
        console.error(`Error creating user "${userData.email}":`, error);
      }
    }

    console.log('User seeding completed');
  }
}
