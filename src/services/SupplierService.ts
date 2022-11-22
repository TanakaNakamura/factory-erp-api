import { Supplier } from '../models/Supplier';
import { IQueryParams } from '../types';

export class SupplierService {
  async getAllSuppliers(queryParams: IQueryParams & { 
    search?: string;
    isActive?: boolean;
  }) {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'name', 
      order = 'asc',
      search,
      isActive
    } = queryParams;

    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { supplierCode: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isActive !== undefined) filter.isActive = isActive;

    const sortObj: any = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const skip = (pageNum - 1) * limitNum;

    const [suppliers, total] = await Promise.all([
      Supplier.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Supplier.countDocuments(filter)
    ]);

    return {
      suppliers,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    };
  }

  async getSupplierById(id: string) {
    const supplier = await Supplier.findById(id);

    if (!supplier) {
      throw new Error('Supplier not found');
    }

    return supplier;
  }

  async createSupplier(supplierData: any) {
    const existingSupplier = await Supplier.findOne({
      $or: [
        { supplierCode: supplierData.supplierCode },
        { email: supplierData.email }
      ]
    });

    if (existingSupplier) {
      throw new Error('Supplier with this code or email already exists');
    }

    const supplier = await Supplier.create(supplierData);
    return supplier;
  }

  async updateSupplier(id: string, updateData: any) {
    const supplier = await Supplier.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!supplier) {
      throw new Error('Supplier not found');
    }

    return supplier;
  }

  async deleteSupplier(id: string) {
    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!supplier) {
      throw new Error('Supplier not found');
    }

    return supplier;
  }

  async searchBySupplierCode(supplierCode: string) {
    const suppliers = await Supplier.find({
      supplierCode: { $regex: supplierCode, $options: 'i' },
      isActive: true
    });

    return suppliers;
  }

  async getActiveSuppliers() {
    const suppliers = await Supplier.find({ isActive: true })
      .sort({ name: 1 });

    return suppliers;
  }

  async getSupplierProducts(supplierId: string) {
    const supplier = await Supplier.findById(supplierId);

    if (!supplier) {
      throw new Error('Supplier not found');
    }

    return [];
  }
}