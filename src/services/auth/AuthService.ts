import jwt from 'jsonwebtoken';
import { User } from '../../models/User';
import { UserRole, IUser } from '../../types';

export class AuthService {
  async registerUser(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
    department?: string;
  }) {
    const { username, email, password, firstName, lastName, role, department } = userData;

    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || UserRole.VIEWER,
      department
    });

    const token = this.generateToken(user._id.toString(), user.email);

    return { user, token };
  }

  async loginUser(email: string, password: string) {
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    user.lastLogin = new Date();
    await user.save();

    const token = this.generateToken(user._id.toString(), user.email);

    return {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
        lastLogin: user.lastLogin
      },
      token
    };
  }

  async updateUserProfile(userId: string, updateData: {
    firstName?: string;
    lastName?: string;
    department?: string;
  }) {
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    return user;
  }

  async changeUserPassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw new Error('User not found');
    }

    if (!(await user.comparePassword(currentPassword))) {
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return true;
  }

  private generateToken(id: string, email: string): string {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    return jwt.sign({ id, email }, jwtSecret, { expiresIn: jwtExpiresIn } as jwt.SignOptions);
  }
}