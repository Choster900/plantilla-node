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
        password: 'admin123',
        profile_name: 'admin'
      },
      {
        email: 'editor@test.com',
        password: 'editor123',
        profile_name: 'editor'
      },
      {
        email: 'user@test.com',
        password: 'user123',
        profile_name: 'user'
      },
      {
        email: 'viewer@test.com',
        password: 'viewer123',
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
          password_hash: hashedPassword,
          profile_id: profile.id
        });

        console.log(`User "${userData.email}" created successfully with ID: ${newUser.id}`);

      } catch (error) {
        console.error(`Error creating user "${userData.email}":`, error);
      }
    }

    console.log('User seeding completed');
  }
}
