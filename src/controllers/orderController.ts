import { Request, Response } from 'express';
import { OrderService } from '../services/order/OrderService';
import { OrderStatus, OrderType, ApiResponse, IQueryParams } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

const orderService = new OrderService();

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  try {
    const queryParams = req.query as IQueryParams & { 
      status?: OrderStatus;
      type?: OrderType;
      startDate?: string;
      endDate?: string;
    };
    
    const result = await orderService.getAllOrders(queryParams);
    
    res.json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
      message: 'Orders retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  try {
    const order = await orderService.getOrderById(req.params.id);

    return res.json({
      success: true,
      data: order,
      message: 'Order retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  try {
    const order = await orderService.createOrder(req.body);

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  try {
    const order = await orderService.updateOrder(req.params.id, req.body);

    return res.json({
      success: true,
      data: order,
      message: 'Order updated successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const userId = req.user?._id?.toString() || '';
    
    const order = await orderService.updateOrderStatus(req.params.id, status, userId);
    
    return res.json({
      success: true,
      data: order,
      message: 'Order status updated successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const fulfillOrder = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || '';
    const order = await orderService.fulfillOrder(req.params.id, userId);
    
    return res.json({
      success: true,
      data: order,
      message: 'Order fulfilled successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const getOrdersByCustomer = asyncHandler(async (req: Request, res: Response) => {
  try {
    const orders = await orderService.getOrdersByCustomer(req.params.customerId);

    res.json({
      success: true,
      data: orders,
      message: 'Customer orders retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export const getOrdersBySupplier = asyncHandler(async (req: Request, res: Response) => {
  try {
    const orders = await orderService.getOrdersBySupplier(req.params.supplierId);

    res.json({
      success: true,
      data: orders,
      message: 'Supplier orders retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});