import express from 'express';
import {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  adjustStock,
  getLowStockItems,
  getInventoryByWarehouse,
  getStockMovements
} from '../controllers/inventoryController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest, validateParams, validateQuery } from '../middleware/validation';
import { UserRole } from '../types';
import Joi from 'joi';

const router = express.Router();

router.use(authenticateToken);


const createInventorySchema = Joi.object({
  product: Joi.string().hex().length(24).required(),
  location: Joi.object({
    warehouse: Joi.string().required(),
    zone: Joi.string().required(),
    aisle: Joi.string().required(),
    shelf: Joi.string().required(),
    bin: Joi.string()
  }).required(),
  currentStock: Joi.number().min(0).default(0),
  reservedStock: Joi.number().min(0).default(0),
  minimumStock: Joi.number().min(0).default(10),
  maximumStock: Joi.number().min(0).default(1000),
  reorderPoint: Joi.number().min(0).default(20),
  averageCost: Joi.number().min(0)
});

const updateInventorySchema = createInventorySchema.fork(
  ['product', 'location'],
  (schema) => schema.optional()
);

const adjustStockSchema = Joi.object({
  quantity: Joi.number().required(),
  reason: Joi.string().required(),
  type: Joi.string().valid('inbound', 'outbound', 'adjustment', 'transfer', 'production', 'return').default('adjustment'),
  reference: Joi.string(),
  cost: Joi.number().min(0)
});

const querySchema = Joi.object({
  page: Joi.number().integer().positive().default(1),
  limit: Joi.number().integer().positive().max(100).default(10),
  sort: Joi.string().default('product.name'),
  order: Joi.string().valid('asc', 'desc').default('asc'),
  warehouse: Joi.string(),
  lowStock: Joi.boolean()
});

const idParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

const warehouseParamSchema = Joi.object({
  warehouse: Joi.string().required()
});

router.get('/', validateQuery(querySchema), getInventoryItems);

router.get('/low-stock', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERVISOR), getLowStockItems);

router.get('/warehouse/:warehouse', validateParams(warehouseParamSchema), getInventoryByWarehouse);

router.get('/:id', validateParams(idParamSchema), getInventoryItem);

router.get('/:id/movements', validateParams(idParamSchema), getStockMovements);

router.post('/',
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERVISOR),
  validateRequest(createInventorySchema),
  createInventoryItem
);

router.put('/:id',
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERVISOR),
  validateParams(idParamSchema),
  validateRequest(updateInventorySchema),
  updateInventoryItem
);


router.post('/:id/adjust',
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERVISOR, UserRole.OPERATOR),
  validateParams(idParamSchema),
  validateRequest(adjustStockSchema),
  adjustStock
);

export default router;