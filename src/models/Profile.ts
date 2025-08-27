import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  CreatedAt,
  UpdatedAt,
  Unique,
  HasMany,
} from 'sequelize-typescript';

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

interface ProfileCreationAttributes {
  name: string;
  description?: string;
  permissions: Record<string, string[]>;
  is_active?: boolean;
}

@Table({
  tableName: 'profiles',
  timestamps: true,
  underscored: true,
})
export class Profile extends Model<Profile, ProfileCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(100))
  name!: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string;

  @AllowNull(false)
  @Column(DataType.JSONB)
  permissions!: Record<string, string[]>;

  @Default(true)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  is_active!: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  created_at!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updated_at!: Date;

  @HasMany(() => require('./User').User, 'profile_id')
  users?: any[];

  /**
   * Create a new profile
   */
  static async createProfile(profileData: CreateProfileData): Promise<Profile> {
    try {
      const { name, description, permissions, is_active = true } = profileData;

      const profile = await Profile.create({
        name,
        description,
        permissions,
        is_active,
      });

      return profile;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw new Error('Failed to create profile');
    }
  }

  /**
   * Find profile by ID
   */
  static async findByIdWithUsers(id: number): Promise<Profile | null> {
    try {
      const profile = await Profile.findByPk(id, {
        include: [
          {
            association: 'users',
            attributes: ['id', 'email', 'username', 'first_name', 'last_name', 'is_active', 'created_at'],
            where: { is_active: true },
            required: false,
          },
        ],
      });

      return profile;
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
      const profile = await Profile.findOne({
        where: { name },
      });

      return profile;
    } catch (error) {
      console.error('Error finding profile by name:', error);
      throw new Error('Failed to find profile');
    }
  }

  /**
   * Get all profiles
   */
  static async findAllProfiles(options?: { active_only?: boolean }): Promise<Profile[]> {
    try {
      const whereClause: any = {};

      if (options?.active_only) {
        whereClause.is_active = true;
      }

      const profiles = await Profile.findAll({
        where: whereClause,
        order: [['name', 'ASC']],
      });

      return profiles;
    } catch (error) {
      console.error('Error finding all profiles:', error);
      throw new Error('Failed to retrieve profiles');
    }
  }

  /**
   * Update profile
   */
  static async updateProfile(id: number, updateData: UpdateProfileData): Promise<Profile | null> {
    try {
      const [affectedRows] = await Profile.update(updateData, {
        where: { id },
      });

      if (affectedRows === 0) {
        return null;
      }

      const updatedProfile = await Profile.findByPk(id);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Delete profile (soft delete by setting is_active to false)
   */
  static async softDeleteProfile(id: number): Promise<boolean> {
    try {
      const [affectedRows] = await Profile.update(
        { is_active: false },
        { where: { id } }
      );

      return affectedRows > 0;
    } catch (error) {
      console.error('Error soft deleting profile:', error);
      throw new Error('Failed to delete profile');
    }
  }

  /**
   * Delete profile permanently
   */
  static async deleteProfile(id: number): Promise<boolean> {
    try {
      // Check if profile is in use by any users
      const usersCount = await Profile.count({
        include: [
          {
            association: 'users',
            required: true,
          },
        ],
        where: { id },
      });

      if (usersCount > 0) {
        throw new Error('Cannot delete profile that is assigned to users');
      }

      const deletedRows = await Profile.destroy({
        where: { id },
      });

      return deletedRows > 0;
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw new Error('Failed to delete profile');
    }
  }

  /**
   * Check if profile has specific permission
   */
  hasPermission(resource: string, action: string): boolean {
    try {
      const permissions = this.permissions;

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
   * Static method to check if profile has specific permission
   */
  static hasPermission(profile: Profile, resource: string, action: string): boolean {
    return profile.hasPermission(resource, action);
  }

  /**
   * Get users assigned to a profile
   */
  async getProfileUsers(): Promise<any[]> {
    try {
      const users = await this.$get('users', {
        attributes: ['id', 'email', 'username', 'first_name', 'last_name', 'is_active', 'created_at'],
        where: { is_active: true },
        order: [['created_at', 'DESC']],
      });

      return users || [];
    } catch (error) {
      console.error('Error getting users for profile:', error);
      throw new Error('Failed to get users for profile');
    }
  }

  /**
   * Static method to get users for a profile
   */
  static async getUsers(profileId: number): Promise<any[]> {
    try {
      const profile = await Profile.findByPk(profileId);

      if (!profile) {
        throw new Error('Profile not found');
      }

      return await profile.getProfileUsers();
    } catch (error) {
      console.error('Error getting users for profile:', error);
      throw new Error('Failed to get users for profile');
    }
  }
}

export default Profile;
