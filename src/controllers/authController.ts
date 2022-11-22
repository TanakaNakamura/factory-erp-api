import { Request, Response } from 'express';
import { AuthService } from '../services/auth/AuthService';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

const authService = new AuthService();

export const register = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { user, token } = await authService.registerUser(req.body);
    
    return res.status(201).json({
      success: true,
      data: {
        user,
        token
      },
      message: 'User registered successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser(email, password);
    
    return res.json({
      success: true,
      data: {
        user,
        token
      },
      message: 'Login successful'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: req.user,
    message: 'Profile retrieved successfully'
  } as ApiResponse);
});


export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, department } = req.body;
    const user = await authService.updateUserProfile(req.user?._id, {
      firstName,
      lastName,
      department
    });

    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changeUserPassword(req.user?._id, currentPassword, newPassword);
    
    return res.json({
      success: true,
      message: 'Password changed successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});