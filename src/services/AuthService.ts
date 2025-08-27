import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config';
import { User, CreateUserData } from '../models/User';
import { Profile } from '../models/Profile';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
  profile_name?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id: number;
      email: string;
      username: string;
      first_name?: string;
      last_name?: string;
      profile?: {
        id: number;
        name: string;
        permissions: Record<string, string[]>;
      };
    };
  };
}

export interface TokenPayload {
  userId: number;
  email: string;
  username: string;
  profileId?: number;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(registerData: RegisterData): Promise<AuthResponse> {
    try {
      const { email, username, password, first_name, last_name, profile_name } = registerData;

      // Validate input
      if (!email || !username || !password) {
        return {
          success: false,
          message: 'Email, username, and password are required'
        };
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return {
          success: false,
          message: 'Username is already taken'
        };
      }

      // Get profile ID if profile_name is provided
      let profile_id: number | undefined;
      if (profile_name) {
        const profile = await Profile.findByName(profile_name);
        if (!profile) {
          return {
            success: false,
            message: `Profile "${profile_name}" not found`
          };
        }
        profile_id = profile.id;
      } else {
        // Default to 'user' profile if no profile specified
        const defaultProfile = await Profile.findByName('user');
        if (defaultProfile) {
          profile_id = defaultProfile.id;
        }
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Create user
      const userData: CreateUserData = {
        email,
        username,
        password_hash,
        first_name,
        last_name,
        profile_id
      };

      const newUser = await User.createUser(userData);

      // Generate token
      const token = this.generateToken({
        userId: newUser.id!,
        email: newUser.email,
        username: newUser.username,
        profileId: newUser.profile_id
      });

      // Get user with profile info
      const userWithProfile = await User.findWithProfile(newUser.id!);

      return {
        success: true,
        message: 'User registered successfully',
        data: {
          token,
          user: {
            id: newUser.id!,
            email: newUser.email,
            username: newUser.username,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            profile: userWithProfile?.profile || undefined
          }
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { email, password } = credentials;

      // Validate input
      if (!email || !password) {
        return {
          success: false,
          message: 'Email and password are required'
        };
      }

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Check if user is active
      if (!user.is_active) {
        return {
          success: false,
          message: 'Account is deactivated. Please contact support.'
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Update last login
      await User.updateLastLogin(user.id!);

      // Generate token
      const token = this.generateToken({
        userId: user.id!,
        email: user.email,
        username: user.username,
        profileId: user.profile_id
      });

      // Get user with profile info
      const userWithProfile = await User.findWithProfile(user.id!);

      return {
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id!,
            email: user.email,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            profile: userWithProfile?.profile || undefined
          }
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  /**
   * Generate JWT token
   */
  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Validate user permissions
   */
  static async validatePermission(userId: number, resource: string, action: string): Promise<boolean> {
    try {
      return await User.hasPermission(userId, resource, action);
    } catch (error) {
      console.error('Permission validation error:', error);
      return false;
    }
  }

  /**
   * Get user by token
   */
  static async getUserByToken(token: string): Promise<any | null> {
    try {
      const payload = this.verifyToken(token);
      if (!payload) return null;

      const user = await User.findWithProfile(payload.userId);
      if (!user || !user.is_active) return null;

      // Remove sensitive information
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Get user by token error:', error);
      return null;
    }
  }
}
