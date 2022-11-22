import { Request, Response } from 'express';
import { UserService } from '../services/auth/UserService';
import { UserRole, ApiResponse, IQueryParams } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  try {
    const queryParams = req.query as IQueryParams & { 
      search?: string;
      role?: UserRole;
      isActive?: string;
      department?: string;
    };
    
    const processedParams = {
      ...queryParams,
      isActive: queryParams.isActive !== undefined ? queryParams.isActive === 'true' : undefined
    };
    
    const result = await UserService.getAllUsers(processedParams);
    
    res.json({
      success: true,
      data: result.users,
      pagination: result.pagination,
      message: 'Users retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = await UserService.getUserById(req.params.id);

    return res.json({
      success: true,
      data: user,
      message: 'User retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = await UserService.updateUser(req.params.id, req.body);

    return res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const deactivateUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = await UserService.deactivateUser(req.params.id);

    return res.json({
      success: true,
      data: user,
      message: 'User deactivated successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const activateUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = await UserService.activateUser(req.params.id);

    return res.json({
      success: true,
      data: user,
      message: 'User activated successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const getUsersByRole = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const users = await UserService.getUsersByRole(role as UserRole);

    res.json({
      success: true,
      data: users,
      message: `Users with role '${role}' retrieved successfully`
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const getUsersByDepartment = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { department } = req.params;
    const users = await UserService.getUsersByDepartment(department);

    res.json({
      success: true,
      data: users,
      message: `Users in department '${department}' retrieved successfully`
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const updatedBy = req.user?._id?.toString() || '';
    
    const result = await UserService.updateUserRole(req.params.id, role, updatedBy);
    
    return res.json({
      success: true,
      data: result,
      message: 'User role updated successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});