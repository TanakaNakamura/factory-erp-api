import { Request, Response } from 'express';
import { CustomerService } from '../services/CustomerService';
import { ApiResponse, IQueryParams } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
  try {
    const queryParams = req.query as IQueryParams & { 
      search?: string;
      isActive?: string;
    };
    
    const processedParams = {
      ...queryParams,
      isActive: queryParams.isActive !== undefined ? queryParams.isActive === 'true' : undefined
    };
    
    const customerService = req.services?.get(CustomerService) || new CustomerService();
    const result = await customerService.getAllCustomers(processedParams);
    
    res.json({
      success: true,
      data: result.customers,
      pagination: result.pagination,
      message: 'Customers retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const getCustomer = asyncHandler(async (req: Request, res: Response) => {
  try {
    const customerService = req.services?.get(CustomerService) || new CustomerService();
    const customer = await customerService.getCustomerById(req.params.id);

    return res.json({
      success: true,
      data: customer,
      message: 'Customer retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const createCustomer = asyncHandler(async (req: Request, res: Response) => {
  try {
    const customerService = req.services?.get(CustomerService) || new CustomerService();
    const customer = await customerService.createCustomer(req.body);

    res.status(201).json({
      success: true,
      data: customer,
      message: 'Customer created successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const updateCustomer = asyncHandler(async (req: Request, res: Response) => {
  try {
    const customerService = req.services?.get(CustomerService) || new CustomerService();
    const customer = await customerService.updateCustomer(req.params.id, req.body);

    return res.json({
      success: true,
      data: customer,
      message: 'Customer updated successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const deleteCustomer = asyncHandler(async (req: Request, res: Response) => {
  try {
    const customerService = req.services?.get(CustomerService) || new CustomerService();
    const customer = await customerService.deleteCustomer(req.params.id);

    return res.json({
      success: true,
      data: customer,
      message: 'Customer deleted successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const searchByCustomerCode = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { customerCode } = req.params;
    const customerService = req.services?.get(CustomerService) || new CustomerService();
    const customers = await customerService.searchByCustomerCode(customerCode);

    res.json({
      success: true,
      data: customers,
      message: 'Customers found by code'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const getActiveCustomers = asyncHandler(async (req: Request, res: Response) => {
  try {
    const customerService = req.services?.get(CustomerService) || new CustomerService();
    const customers = await customerService.getActiveCustomers();

    res.json({
      success: true,
      data: customers,
      message: 'Active customers retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});