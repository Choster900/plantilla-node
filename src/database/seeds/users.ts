import { BaseSeeder } from '../BaseSeeder';
import { query } from '../connection';
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
        const existingUser = await query(
          'SELECT id FROM users WHERE email = $1 OR username = $2',
          [userData.email, userData.username]
        );

        if (existingUser.rows.length > 0) {
          console.log(`User ${userData.username} already exists, skipping...`);
          continue;
        }

        // Get profile ID
        const profileResult = await query(
          'SELECT id FROM profiles WHERE name = $1',
          [userData.profile_name]
        );

        const profile_id = profileResult.rows.length > 0 ? profileResult.rows[0].id : null;

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user
        await query(
          `INSERT INTO users (email, username, password_hash, first_name, last_name, profile_id, is_active, is_verified)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            userData.email,
            userData.username,
            hashedPassword,
            userData.first_name,
            userData.last_name,
            profile_id,
            true,
            true
          ]
        );

        console.log(`User ${userData.username} created successfully with profile ${userData.profile_name}`);
      } catch (error) {
        console.error(`Error creating user ${userData.username}:`, error);
        throw error;
      }
    }

    console.log('Users seeding completed');
  }
}

// Export the seeder instance
export const usersSeeder = new UsersSeeder();
