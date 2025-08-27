import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  BelongsTo,
  ForeignKey,
  Unique,
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Profile } from './Profile';

export interface CreateUserData {
  email: string;
  password_hash: string;
  profile_id?: number;
}

export interface UpdateUserData {
  email?: string;
  password_hash?: string;
  profile_id?: number;
}

interface UserCreationAttributes {
  email: string;
  password_hash: string;
  profile_id?: number;
}

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})
export class User extends Model<User, UserCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(255))
  email!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  password_hash!: string;

  @ForeignKey(() => Profile)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  profile_id?: number;

  @CreatedAt
  @Column(DataType.DATE)
  created_at!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updated_at!: Date;

  @BelongsTo(() => Profile)
  profile?: Profile;

  /**
   * Create a new user
   */
  static async createUser(userData: CreateUserData): Promise<User> {
    try {
      const user = await User.create(userData);
      console.log(`User created successfully with ID: ${user.id}`);
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    try {
      return await User.findOne({
        where: { email },
        include: [{ model: Profile }]
      });
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Update user data
   */
  static async updateUser(userId: string, updateData: UpdateUserData): Promise<User | null> {
    try {
      const [affectedRows] = await User.update(updateData, {
        where: { id: userId },
        returning: true
      });

      if (affectedRows === 0) {
        return null;
      }

      return await User.findByPk(userId, {
        include: [{ model: Profile }]
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Delete user (soft delete)
   */
  static async deleteUser(userId: string): Promise<boolean> {
    try {
      const deletedRows = await User.destroy({
        where: { id: userId }
      });

      return deletedRows > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string, excludeId?: string): Promise<boolean> {
    try {
      const whereClause: any = { email };
      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }

      const user = await User.findOne({ where: whereClause });
      return !!user;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw new Error('Failed to check email existence');
    }
  }

  /**
   * Get all users with their profiles
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      return await User.findAll({
        include: [{ model: Profile }],
        order: [['created_at', 'DESC']]
      });
    } catch (error) {
      console.error('Error getting all users:', error);
      throw new Error('Failed to get users');
    }
  }

  /**
   * Get user by ID with profile
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      return await User.findOne({
        where: { id: userId },
        include: [{ model: Profile }]
      });
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw new Error('Failed to get user');
    }
  }
}
