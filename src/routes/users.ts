import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest, validateParams, validateQuery } from '../middleware/validation';
import { UserRole } from '../types';
import {
  getUsers,
  getUser,
  updateUser,
  deactivateUser,
  activateUser,
  getUsersByRole,
  getUsersByDepartment,
  updateUserRole
} from '../controllers/userController';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles(UserRole.ADMIN));

router.get('/', getUsers);
router.get('/role/:role', getUsersByRole);
router.get('/department/:department', getUsersByDepartment);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.patch('/:id/deactivate', deactivateUser);
router.patch('/:id/activate', activateUser);
router.patch('/:id/role', updateUserRole);

export default router;