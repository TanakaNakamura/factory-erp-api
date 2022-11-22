import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory/InventoryService';
import { StockMovementType, ApiResponse, IQueryParams } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

const inventoryService = new InventoryService();

// Get all inventory items with pagination
export const getInventoryItems = asyncHandler(async (req: Request, res: Response) => {
  try {
    const queryParams = req.query as IQueryParams & { warehouse?: string; lowStock?: string };
    
    const processedParams = {
      ...queryParams,
      lowStock: queryParams.lowStock === 'true'
    };
    
    const result = await inventoryService.getAllInventoryItems(processedParams);
    
    res.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
      message: 'Inventory items retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Get single inventory item
export const getInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  try {
    const item = await inventoryService.getInventoryItemById(req.params.id);

    res.json({
      success: true,
      data: item,
      message: 'Inventory item retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Create new inventory item
export const createInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  try {
    const item = await inventoryService.createInventoryItem(req.body);

    res.status(201).json({
      success: true,
      data: item,
      message: 'Inventory item created successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Update inventory item
export const updateInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  try {
    const item = await inventoryService.updateInventoryItem(req.params.id, req.body);

    res.json({
      success: true,
      data: item,
      message: 'Inventory item updated successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Adjust stock levels
export const adjustStock = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { quantity, reason, type = StockMovementType.ADJUSTMENT, reference, cost } = req.body;
    const userId = req.user?._id?.toString() || '';
    
    const item = await inventoryService.adjustStock(
      req.params.id,
      { quantity, reason, type, reference, cost },
      userId
    );
    
    res.json({
      success: true,
      data: item,
      message: 'Stock adjusted successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Get low stock items
export const getLowStockItems = asyncHandler(async (req: Request, res: Response) => {
  try {
    const items = await inventoryService.getLowStockItems();

    res.json({
      success: true,
      data: items,
      message: 'Low stock items retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Get inventory by warehouse
export const getInventoryByWarehouse = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { warehouse } = req.params;
    const items = await inventoryService.getInventoryByWarehouse(warehouse);

    res.json({
      success: true,
      data: items,
      message: `Inventory for warehouse '${warehouse}' retrieved successfully`
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Get stock movement history
export const getStockMovements = asyncHandler(async (req: Request, res: Response) => {
  try {
    const movements = await inventoryService.getStockMovements(req.params.id);

    res.json({
      success: true,
      data: {
        movements
      },
      message: 'Stock movements retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});