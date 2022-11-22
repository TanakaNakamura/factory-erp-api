import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { UserRole } from '../types';
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  searchBySupplierCode,
  getActiveSuppliers,
  getSupplierProducts
} from '../controllers/supplierController';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getSuppliers);
router.get('/active', getActiveSuppliers);
router.get('/search/:supplierCode', searchBySupplierCode);
router.get('/:id', getSupplier);
router.get('/:id/products', getSupplierProducts);
router.post('/', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), createSupplier);
router.put('/:id', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), updateSupplier);
router.delete('/:id', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), deleteSupplier);

export default router;