import { Request, Response } from 'express';
import { SupplierService } from '../services/SupplierService';
import { ApiResponse, IQueryParams } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

export const getSuppliers = asyncHandler(async (req: Request, res: Response) => {
  try {
    const queryParams = req.query as IQueryParams & { 
      search?: string;
      isActive?: string;
    };
    
    const processedParams = {
      ...queryParams,
      isActive: queryParams.isActive !== undefined ? queryParams.isActive === 'true' : undefined
    };
    
    const result = await SupplierService.getAllSuppliers(processedParams);
    
    res.json({
      success: true,
      data: result.suppliers,
      pagination: result.pagination,
      message: 'Suppliers retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const getSupplier = asyncHandler(async (req: Request, res: Response) => {
  try {
    const supplier = await SupplierService.getSupplierById(req.params.id);

    return res.json({
      success: true,
      data: supplier,
      message: 'Supplier retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const createSupplier = asyncHandler(async (req: Request, res: Response) => {
  try {
    const supplier = await SupplierService.createSupplier(req.body);

    res.status(201).json({
      success: true,
      data: supplier,
      message: 'Supplier created successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const updateSupplier = asyncHandler(async (req: Request, res: Response) => {
  try {
    const supplier = await SupplierService.updateSupplier(req.params.id, req.body);

    return res.json({
      success: true,
      data: supplier,
      message: 'Supplier updated successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const deleteSupplier = asyncHandler(async (req: Request, res: Response) => {
  try {
    const supplier = await SupplierService.deleteSupplier(req.params.id);

    return res.json({
      success: true,
      data: supplier,
      message: 'Supplier deleted successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const searchBySupplierCode = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { supplierCode } = req.params;
    const suppliers = await SupplierService.searchBySupplierCode(supplierCode);

    res.json({
      success: true,
      data: suppliers,
      message: 'Suppliers found by code'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const getActiveSuppliers = asyncHandler(async (req: Request, res: Response) => {
  try {
    const suppliers = await SupplierService.getActiveSuppliers();

    res.json({
      success: true,
      data: suppliers,
      message: 'Active suppliers retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const getSupplierProducts = asyncHandler(async (req: Request, res: Response) => {
  try {
    const products = await SupplierService.getSupplierProducts(req.params.id);

    res.json({
      success: true,
      data: products,
      message: 'Supplier products retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});