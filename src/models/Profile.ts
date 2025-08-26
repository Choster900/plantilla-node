import { query } from '../database/connection';

export interface Profile {
  id?: number;
  name: string;
  description?: string;
  permissions: Record<string, string[]>;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateProfileData {
  name: string;
  description?: string;
  permissions: Record<string, string[]>;
  is_active?: boolean;
}

export interface UpdateProfileData {
  name?: string;
  description?: string;
  permissions?: Record<string, string[]>;
  is_active?: boolean;
}

export class ProfileModel {
  /**
   * Create a new profile
   */
  static async create(profileData: CreateProfileData): Promise<Profile> {
    try {
      const { name, description, permissions, is_active = true } = profileData;

      const result = await query(
        `INSERT INTO profiles (name, description, permissions, is_active)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, description, permissions, is_active, created_at, updated_at`,
        [name, description, JSON.stringify(permissions), is_active]
      );

      return {
        ...result.rows[0],
        permissions: typeof result.rows[0].permissions === 'string'
          ? JSON.parse(result.rows[0].permissions)
          : result.rows[0].permissions
      };
    } catch (error) {
      console.error('Error creating profile:', error);
      throw new Error('Failed to create profile');
    }
  }

  /**
   * Find profile by ID
   */
  static async findById(id: number): Promise<Profile | null> {
    try {
      const result = await query(
        'SELECT id, name, description, permissions, is_active, created_at, updated_at FROM profiles WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const profile = result.rows[0];
      return {
        ...profile,
        permissions: typeof profile.permissions === 'string'
          ? JSON.parse(profile.permissions)
          : profile.permissions
      };
    } catch (error) {
      console.error('Error finding profile by ID:', error);
      throw new Error('Failed to find profile');
    }
  }

  /**
   * Find profile by name
   */
  static async findByName(name: string): Promise<Profile | null> {
    try {
      const result = await query(
        'SELECT id, name, description, permissions, is_active, created_at, updated_at FROM profiles WHERE name = $1',
        [name]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const profile = result.rows[0];
      return {
        ...profile,
        permissions: typeof profile.permissions === 'string'
          ? JSON.parse(profile.permissions)
          : profile.permissions
      };
    } catch (error) {
      console.error('Error finding profile by name:', error);
      throw new Error('Failed to find profile');
    }
  }

  /**
   * Get all profiles
   */
  static async findAll(options?: { active_only?: boolean }): Promise<Profile[]> {
    try {
      let queryText = 'SELECT id, name, description, permissions, is_active, created_at, updated_at FROM profiles';
      const queryParams: any[] = [];

      if (options?.active_only) {
        queryText += ' WHERE is_active = $1';
        queryParams.push(true);
      }

      queryText += ' ORDER BY name ASC';

      const result = await query(queryText, queryParams);

      return result.rows.map((profile: any) => ({
        ...profile,
        permissions: typeof profile.permissions === 'string'
          ? JSON.parse(profile.permissions)
          : profile.permissions
      }));
    } catch (error) {
      console.error('Error finding all profiles:', error);
      throw new Error('Failed to retrieve profiles');
    }
  }

  /**
   * Update profile
   */
  static async update(id: number, updateData: UpdateProfileData): Promise<Profile | null> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramCounter = 1;

      if (updateData.name !== undefined) {
        fields.push(`name = $${paramCounter}`);
        values.push(updateData.name);
        paramCounter++;
      }

      if (updateData.description !== undefined) {
        fields.push(`description = $${paramCounter}`);
        values.push(updateData.description);
        paramCounter++;
      }

      if (updateData.permissions !== undefined) {
        fields.push(`permissions = $${paramCounter}`);
        values.push(JSON.stringify(updateData.permissions));
        paramCounter++;
      }

      if (updateData.is_active !== undefined) {
        fields.push(`is_active = $${paramCounter}`);
        values.push(updateData.is_active);
        paramCounter++;
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      fields.push(`updated_at = $${paramCounter}`);
      values.push(new Date());
      paramCounter++;

      values.push(id);

      const result = await query(
        `UPDATE profiles SET ${fields.join(', ')} WHERE id = $${paramCounter}
         RETURNING id, name, description, permissions, is_active, created_at, updated_at`,
        values
      );

      if (result.rows.length === 0) {
        return null;
      }

      const profile = result.rows[0];
      return {
        ...profile,
        permissions: typeof profile.permissions === 'string'
          ? JSON.parse(profile.permissions)
          : profile.permissions
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Delete profile (soft delete by setting is_active to false)
   */
  static async softDelete(id: number): Promise<boolean> {
    try {
      const result = await query(
        'UPDATE profiles SET is_active = false, updated_at = $1 WHERE id = $2',
        [new Date(), id]
      );

      return result.rowCount > 0;
    } catch (error) {
      console.error('Error soft deleting profile:', error);
      throw new Error('Failed to delete profile');
    }
  }

  /**
   * Delete profile permanently
   */
  static async delete(id: number): Promise<boolean> {
    try {
      // Check if profile is in use by any users
      const usersWithProfile = await query(
        'SELECT COUNT(*) as count FROM users WHERE profile_id = $1',
        [id]
      );

      if (parseInt(usersWithProfile.rows[0].count) > 0) {
        throw new Error('Cannot delete profile that is assigned to users');
      }

      const result = await query('DELETE FROM profiles WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw new Error('Failed to delete profile');
    }
  }

  /**
   * Check if profile has specific permission
   */
  static hasPermission(profile: Profile, resource: string, action: string): boolean {
    try {
      const permissions = profile.permissions;

      if (!permissions || typeof permissions !== 'object') {
        return false;
      }

      const resourcePermissions = permissions[resource];

      if (!Array.isArray(resourcePermissions)) {
        return false;
      }

      return resourcePermissions.includes(action);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Get users assigned to a profile
   */
  static async getUsers(profileId: number): Promise<any[]> {
    try {
      const result = await query(
        `SELECT id, email, username, first_name, last_name, is_active, created_at
         FROM users
         WHERE profile_id = $1 AND is_active = true
         ORDER BY created_at DESC`,
        [profileId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting users for profile:', error);
      throw new Error('Failed to get users for profile');
    }
  }
}
