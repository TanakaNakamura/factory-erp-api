import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { UserRole } from '../types';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  updateOrderStatus,
  fulfillOrder,
  getOrdersByCustomer,
  getOrdersBySupplier
} from '../controllers/orderController';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getOrders);
router.get('/customer/:customerId', getOrdersByCustomer);
router.get('/supplier/:supplierId', getOrdersBySupplier);
router.get('/:id', getOrder);
router.post('/', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERVISOR), createOrder);
router.put('/:id', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERVISOR), updateOrder);
router.patch('/:id/status', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERVISOR), updateOrderStatus);
router.post('/:id/fulfill', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERVISOR), fulfillOrder);

export default router;