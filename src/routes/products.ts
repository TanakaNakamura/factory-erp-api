import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchByPartNumber,
  getLowStockProducts
} from '../controllers/productController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest, validateParams, validateQuery } from '../middleware/validation';
import { UserRole } from '../types';
import Joi from 'joi';

const router = express.Router();

router.use(authenticateToken);


const createProductSchema = Joi.object({
  partNumber: Joi.string().required(),
  name: Joi.string().max(200).required(),
  description: Joi.string().max(1000).required(),
  category: Joi.string().valid(
    'engine_parts', 'transmission', 'brakes', 'suspension',
    'electrical', 'body_parts', 'interior', 'tools', 'raw_materials'
  ).required(),
  type: Joi.string().valid(
    'finished_good', 'raw_material', 'component', 'assembly', 'tool'
  ).required(),
  specifications: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    value: Joi.string().required(),
    unit: Joi.string(),
    tolerance: Joi.string()
  })),
  dimensions: Joi.object({
    length: Joi.number().positive().required(),
    width: Joi.number().positive().required(),
    height: Joi.number().positive().required(),
    unit: Joi.string().default('mm')
  }).required(),
  weight: Joi.number().positive().required(),
  material: Joi.string().required(),
  manufacturingProcess: Joi.array().items(Joi.string()),
  qualityStandards: Joi.array().items(Joi.string()),
  supplier: Joi.string().hex().length(24),
  unitPrice: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('USD'),
  minimumOrderQuantity: Joi.number().integer().positive().default(1),
  leadTimeDays: Joi.number().integer().min(0).default(7)
});

const updateProductSchema = createProductSchema.fork(
  ['partNumber', 'name', 'description', 'category', 'type', 'dimensions', 'weight', 'material', 'unitPrice'],
  (schema) => schema.optional()
);

const querySchema = Joi.object({
  page: Joi.number().integer().positive().default(1),
  limit: Joi.number().integer().positive().max(100).default(10),
  sort: Joi.string().default('name'),
  order: Joi.string().valid('asc', 'desc').default('asc'),
  search: Joi.string(),
  category: Joi.string(),
  type: Joi.string(),
  isActive: Joi.boolean()
});

const idParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

const categoryParamSchema = Joi.object({
  category: Joi.string().required()
});

const partNumberParamSchema = Joi.object({
  partNumber: Joi.string().required()
});

router.get('/', validateQuery(querySchema), getProducts);

router.get('/low-stock', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERVISOR), getLowStockProducts);

router.get('/category/:category', validateParams(categoryParamSchema), getProductsByCategory);

router.get('/search/:partNumber', validateParams(partNumberParamSchema), searchByPartNumber);

router.get('/:id', validateParams(idParamSchema), getProduct);

router.post('/',
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(createProductSchema),
  createProduct
);

router.put('/:id',
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER),
  validateParams(idParamSchema),
  validateRequest(updateProductSchema),
  updateProduct
);

router.delete('/:id',
  authorizeRoles(UserRole.ADMIN),
  validateParams(idParamSchema),
  deleteProduct
);

export default router;