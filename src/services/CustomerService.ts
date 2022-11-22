import { Customer } from '../models/Customer';
import { IQueryParams } from '../types';

export class CustomerService {
  async getAllCustomers(queryParams: IQueryParams & { 
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
        { customerCode: { $regex: search, $options: 'i' } },
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

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Customer.countDocuments(filter)
    ]);

    return {
      customers,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    };
  }

  async getCustomerById(id: string) {
    const customer = await Customer.findById(id);

    if (!customer) {
      throw new Error('Customer not found');
    }

    return customer;
  }

  async createCustomer(customerData: any) {
    const existingCustomer = await Customer.findOne({
      $or: [
        { customerCode: customerData.customerCode },
        { email: customerData.email }
      ]
    });

    if (existingCustomer) {
      throw new Error('Customer with this code or email already exists');
    }

    const customer = await Customer.create(customerData);
    return customer;
  }

  async updateCustomer(id: string, updateData: any) {
    const customer = await Customer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!customer) {
      throw new Error('Customer not found');
    }

    return customer;
  }

  async deleteCustomer(id: string) {
    const customer = await Customer.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!customer) {
      throw new Error('Customer not found');
    }

    return customer;
  }

  async searchByCustomerCode(customerCode: string) {
    const customers = await Customer.find({
      customerCode: { $regex: customerCode, $options: 'i' },
      isActive: true
    });

    return customers;
  }

  async getActiveCustomers() {
    const customers = await Customer.find({ isActive: true })
      .sort({ name: 1 });

    return customers;
  }
}