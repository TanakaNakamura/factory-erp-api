import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { UserRole } from '../types';
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchByCustomerCode,
  getActiveCustomers
} from '../controllers/customerController';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getCustomers);
router.get('/active', getActiveCustomers);
router.get('/search/:customerCode', searchByCustomerCode);
router.get('/:id', getCustomer);
router.post('/', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), createCustomer);
router.put('/:id', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), updateCustomer);
router.delete('/:id', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), deleteCustomer);

export default router;