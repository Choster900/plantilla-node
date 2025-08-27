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
  BelongsTo,
  ForeignKey,
  Unique,
} from 'sequelize-typescript';
import { Profile } from './Profile';

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

interface UserCreationAttributes {
  email: string;
  username: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  profile_id?: number;
  is_active?: boolean;
  is_verified?: boolean;
  avatar_url?: string;
}

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})
export class User extends Model<User, UserCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(255))
  email!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(50))
  username!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  password_hash!: string;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  first_name?: string;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  last_name?: string;

  @ForeignKey(() => Profile)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  profile_id?: number;

  @Default(true)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  is_active!: boolean;

  @Default(false)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  is_verified!: boolean;

  @AllowNull(true)
  @Column(DataType.STRING(500))
  avatar_url?: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  last_login_at?: Date;

  @CreatedAt
  @Column(DataType.DATE)
  created_at!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updated_at!: Date;

  @BelongsTo(() => require('./Profile').Profile, 'profile_id')
  profile?: any;

  /**
   * Create a new user
   */
  static async createUser(userData: CreateUserData): Promise<User> {
    try {
      const user = await User.create(userData);
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Find user by ID
   */
  static async findByIdWithProfile(id: number): Promise<User | null> {
    try {
      const user = await User.findByPk(id, {
        include: [
          {
            model: Profile,
            as: 'profile',
            required: false,
          },
        ],
      });
      return user;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await User.findOne({
        where: { email },
      });
      return user;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Find user by username
   */
  static async findByUsername(username: string): Promise<User | null> {
    try {
      const user = await User.findOne({
        where: { username },
      });
      return user;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Get all users with pagination
   */
  static async findAllUsers(limit: number = 10, offset: number = 0): Promise<User[]> {
    try {
      const users = await User.findAll({
        limit,
        offset,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: Profile,
            as: 'profile',
            required: false,
          },
        ],
      });
      return users;
    } catch (error) {
      console.error('Error finding all users:', error);
      throw new Error('Failed to retrieve users');
    }
  }

  /**
   * Update user
   */
  static async updateUser(id: number, userData: UpdateUserData): Promise<User | null> {
    try {
      const [affectedRows] = await User.update(userData, {
        where: { id },
      });

      if (affectedRows === 0) {
        return null;
      }

      const updatedUser = await User.findByPk(id);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Delete user (soft delete - mark as inactive)
   */
  static async softDeleteUser(id: number): Promise<boolean> {
    try {
      const [affectedRows] = await User.update(
        { is_active: false },
        { where: { id } }
      );
      return affectedRows > 0;
    } catch (error) {
      console.error('Error soft deleting user:', error);
      throw new Error('Failed to soft delete user');
    }
  }

  /**
   * Delete user permanently
   */
  static async deleteUser(id: number): Promise<boolean> {
    try {
      const deletedRows = await User.destroy({
        where: { id },
      });
      return deletedRows > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Count total users
   */
  static async countUsers(): Promise<number> {
    try {
      const count = await User.count();
      return count;
    } catch (error) {
      console.error('Error counting users:', error);
      throw new Error('Failed to count users');
    }
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string, excludeId?: number): Promise<boolean> {
    try {
      const whereClause: any = { email };

      if (excludeId) {
        whereClause.id = { [require('sequelize').Op.ne]: excludeId };
      }

      const user = await User.findOne({
        where: whereClause,
      });

      return user !== null;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw new Error('Failed to check email existence');
    }
  }

  /**
   * Check if username exists
   */
  static async usernameExists(username: string, excludeId?: number): Promise<boolean> {
    try {
      const whereClause: any = { username };

      if (excludeId) {
        whereClause.id = { [require('sequelize').Op.ne]: excludeId };
      }

      const user = await User.findOne({
        where: whereClause,
      });

      return user !== null;
    } catch (error) {
      console.error('Error checking username existence:', error);
      throw new Error('Failed to check username existence');
    }
  }

  /**
   * Update last login
   */
  static async updateLastLogin(id: number): Promise<void> {
    try {
      await User.update(
        { last_login_at: new Date() },
        { where: { id } }
      );
    } catch (error) {
      console.error('Error updating last login:', error);
      throw new Error('Failed to update last login');
    }
  }

  /**
   * Get user with profile information
   */
  static async findWithProfile(id: number): Promise<any | null> {
    try {
      const user = await User.findByPk(id, {
        include: [
          {
            model: Profile,
            as: 'profile',
            required: false,
          },
        ],
      });

      if (!user) {
        return null;
      }

      return user.toJSON();
    } catch (error) {
      console.error('Error finding user with profile:', error);
      throw new Error('Failed to find user with profile');
    }
  }

  /**
   * Assign profile to user
   */
  static async assignProfile(userId: number, profileId: number): Promise<boolean> {
    try {
      const [affectedRows] = await User.update(
        { profile_id: profileId },
        { where: { id: userId } }
      );
      return affectedRows > 0;
    } catch (error) {
      console.error('Error assigning profile to user:', error);
      throw new Error('Failed to assign profile to user');
    }
  }

  /**
   * Remove profile from user
   */
  static async removeProfile(userId: number): Promise<boolean> {
    try {
      const [affectedRows] = await User.update(
        { profile_id: undefined },
        { where: { id: userId } }
      );
      return affectedRows > 0;
    } catch (error) {
      console.error('Error removing profile from user:', error);
      throw new Error('Failed to remove profile from user');
    }
  }

  /**
   * Check if user has specific permission
   */
  static async hasPermission(userId: number, resource: string, action: string): Promise<boolean> {
    try {
      const user = await User.findOne({
        where: { id: userId, is_active: true },
        include: [
          {
            model: Profile,
            as: 'profile',
            required: true,
            where: { is_active: true },
          },
        ],
      });

      if (!user || !user.profile) {
        return false;
      }

      return user.profile.hasPermission(resource, action);
    } catch (error) {
      console.error('Error checking user permission:', error);
      return false;
    }
  }
}

export default User;
