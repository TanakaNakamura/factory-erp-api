import { Product } from '../models/Product';
import { IQueryParams } from '../types';

export class ProductService {
  async getAllProducts(queryParams: IQueryParams & { 
    category?: string; 
    type?: string; 
    isActive?: boolean 
  }) {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'name', 
      order = 'asc', 
      search,
      category,
      type,
      isActive
    } = queryParams;

    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { partNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive;

    const sortObj: any = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('supplier', 'name supplierCode')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter)
    ]);

    return {
      products,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    };
  }

  async getProductById(id: string) {
    const product = await Product.findById(id)
      .populate('supplier', 'name supplierCode contactPerson email phone');

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  async createProduct(productData: any) {
    const product = await Product.create(productData);
    return product;
  }

  async updateProduct(id: string, updateData: any) {
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('supplier', 'name supplierCode');

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  async deleteProduct(id: string) {
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  async getProductsByCategory(category: string) {
    const products = await Product.find({ 
      category, 
      isActive: true 
    }).populate('supplier', 'name supplierCode');

    return products;
  }

  async searchByPartNumber(partNumber: string) {
    const products = await Product.find({
      partNumber: { $regex: partNumber, $options: 'i' },
      isActive: true
    }).populate('supplier', 'name supplierCode');

    return products;
  }

  async getLowStockProducts() {
    const products = await Product.find({
      isActive: true,
      leadTimeDays: { $gte: 7 }
    }).populate('supplier', 'name supplierCode contactPerson');

    return products;
  }
}