import { User } from '../../models/User';
import { UserRole, IQueryParams } from '../../types';

export class UserService {
  async getAllUsers(queryParams: IQueryParams & { 
    search?: string;
    role?: UserRole;
    isActive?: boolean;
    department?: string;
  }) {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'firstName', 
      order = 'asc',
      search,
      role,
      isActive,
      department
    } = queryParams;

    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive;
    if (department) filter.department = department;

    const sortObj: any = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(filter)
    ]);

    return {
      users,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    };
  }

  async getUserById(id: string) {
    const user = await User.findById(id).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateUser(id: string, updateData: any) {
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async deactivateUser(id: string) {
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async activateUser(id: string) {
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async getUsersByRole(role: UserRole) {
    const users = await User.find({ role, isActive: true })
      .select('-password')
      .sort({ firstName: 1, lastName: 1 });

    return users;
  }

  async getUsersByDepartment(department: string) {
    const users = await User.find({ department, isActive: true })
      .select('-password')
      .sort({ firstName: 1, lastName: 1 });

    return users;
  }

  async updateUserRole(id: string, newRole: UserRole, updatedBy: string) {
    const user = await User.findById(id);
    
    if (!user) {
      throw new Error('User not found');
    }

    const oldRole = user.role;
    user.role = newRole;
    await user.save();

    return {
      user: user.toObject({ transform: (doc, ret) => { delete ret.password; return ret; } }),
      roleChange: {
        from: oldRole,
        to: newRole,
        updatedBy,
        updatedAt: new Date()
      }
    };
  }
}