import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import { ApiResponse, IQueryParams } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

const productService = new ProductService();

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  try {
    const queryParams = req.query as IQueryParams & { 
      category?: string; 
      type?: string; 
      isActive?: string 
    };
    
    const processedParams = {
      ...queryParams,
      isActive: queryParams.isActive !== undefined ? queryParams.isActive === 'true' : undefined
    };
    
    const result = await productService.getAllProducts(processedParams);
    
    res.json({
      success: true,
      data: result.products,
      pagination: result.pagination,
      message: 'Products retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  try {
    const product = await productService.getProductById(req.params.id);

    return res.json({
      success: true,
      data: product,
      message: 'Product retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});


export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  try {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);

    return res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  try {
    const product = await productService.deleteProduct(req.params.id);

    return res.json({
      success: true,
      data: product,
      message: 'Product deleted successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const getProductsByCategory = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const products = await productService.getProductsByCategory(category);

    res.json({
      success: true,
      data: products,
      message: `Products in category '${category}' retrieved successfully`
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const searchByPartNumber = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { partNumber } = req.params;
    const products = await productService.searchByPartNumber(partNumber);

    res.json({
      success: true,
      data: products,
      message: 'Products found by part number'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const getLowStockProducts = asyncHandler(async (req: Request, res: Response) => {
  try {
    const products = await productService.getLowStockProducts();

    res.json({
      success: true,
      data: products,
      message: 'Products with potential low stock retrieved'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});