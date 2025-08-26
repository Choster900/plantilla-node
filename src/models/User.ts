import { query } from '../database/connection';

export interface User {
  id?: number;
  email: string;
  username: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  profile_id?: number;
  is_active?: boolean;
  is_verified?: boolean;
  avatar_url?: string;
  last_login_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateUserData {
  email: string;
  username: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  profile_id?: number;
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_id?: number;
  is_active?: boolean;
  is_verified?: boolean;
  avatar_url?: string;
  last_login_at?: Date;
}

export class UserModel {
  // Create a new user
  static async create(userData: CreateUserData): Promise<User> {
    const {
      email,
      username,
      password_hash,
      first_name,
      last_name,
      profile_id
    } = userData;

    const result = await query(
      `INSERT INTO users (email, username, password_hash, first_name, last_name, profile_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [email, username, password_hash, first_name, last_name, profile_id]
    );

    return result.rows[0];
  }

  // Find user by ID
  static async findById(id: number): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    return result.rows[0] || null;
  }

  // Find user by username
  static async findByUsername(username: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    return result.rows[0] || null;
  }

  // Get all users with pagination
  static async findAll(limit: number = 10, offset: number = 0): Promise<User[]> {
    const result = await query(
      `SELECT * FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows;
  }

  // Update user
  static async update(id: number, userData: UpdateUserData): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Dynamically build update query
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    const result = await query(
      `UPDATE users
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  // Delete user (soft delete - mark as inactive)
  static async softDelete(id: number): Promise<boolean> {
    const result = await query(
      'UPDATE users SET is_active = false WHERE id = $1',
      [id]
    );

    return result.rowCount > 0;
  }

  // Delete user permanently
  static async delete(id: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );

    return result.rowCount > 0;
  }

  // Count total users
  static async count(): Promise<number> {
    const result = await query('SELECT COUNT(*) as count FROM users');
    return parseInt(result.rows[0].count);
  }

  // Check if email exists
  static async emailExists(email: string, excludeId?: number): Promise<boolean> {
    let queryText = 'SELECT 1 FROM users WHERE email = $1';
    const values: any[] = [email];

    if (excludeId) {
      queryText += ' AND id != $2';
      values.push(excludeId);
    }

    const result = await query(queryText, values);
    return result.rows.length > 0;
  }

  // Check if username exists
  static async usernameExists(username: string, excludeId?: number): Promise<boolean> {
    let queryText = 'SELECT 1 FROM users WHERE username = $1';
    const values: any[] = [username];

    if (excludeId) {
      queryText += ' AND id != $2';
      values.push(excludeId);
    }

    const result = await query(queryText, values);
    return result.rows.length > 0;
  }

  // Update last login
  static async updateLastLogin(id: number): Promise<void> {
    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }

  // Get user with profile information
  static async findWithProfile(id: number): Promise<any | null> {
    const result = await query(`
      SELECT
        u.id, u.email, u.username, u.first_name, u.last_name,
        u.profile_id, u.is_active, u.is_verified, u.avatar_url,
        u.last_login_at, u.created_at, u.updated_at,
        p.name as profile_name, p.description as profile_description,
        p.permissions as profile_permissions
      FROM users u
      LEFT JOIN profiles p ON u.profile_id = p.id
      WHERE u.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return {
      ...user,
      profile: user.profile_name ? {
        id: user.profile_id,
        name: user.profile_name,
        description: user.profile_description,
        permissions: typeof user.profile_permissions === 'string'
          ? JSON.parse(user.profile_permissions)
          : user.profile_permissions
      } : null
    };
  }

  // Assign profile to user
  static async assignProfile(userId: number, profileId: number): Promise<boolean> {
    try {
      const result = await query(
        'UPDATE users SET profile_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [profileId, userId]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error assigning profile to user:', error);
      throw new Error('Failed to assign profile to user');
    }
  }

  // Remove profile from user
  static async removeProfile(userId: number): Promise<boolean> {
    try {
      const result = await query(
        'UPDATE users SET profile_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error removing profile from user:', error);
      throw new Error('Failed to remove profile from user');
    }
  }

  // Check if user has specific permission
  static async hasPermission(userId: number, resource: string, action: string): Promise<boolean> {
    try {
      const result = await query(`
        SELECT p.permissions
        FROM users u
        JOIN profiles p ON u.profile_id = p.id
        WHERE u.id = $1 AND u.is_active = true AND p.is_active = true
      `, [userId]);

      if (result.rows.length === 0) {
        return false;
      }

      const permissions = typeof result.rows[0].permissions === 'string'
        ? JSON.parse(result.rows[0].permissions)
        : result.rows[0].permissions;

      const resourcePermissions = permissions[resource];

      if (!Array.isArray(resourcePermissions)) {
        return false;
      }

      return resourcePermissions.includes(action);
    } catch (error) {
      console.error('Error checking user permission:', error);
      return false;
    }
  }
}
