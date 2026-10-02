import { IEmployeeRepository } from './IEmployeeRepository';
import { EmployeeModel, IEmployee, IEmployeeDocument } from '../models/Employee';

export class EmployeeRepository implements IEmployeeRepository {
  async create(data: IEmployee): Promise<IEmployeeDocument> {
    return EmployeeModel.create(data);
  }

  async findAll(): Promise<IEmployeeDocument[]> {
    return EmployeeModel.find().sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<IEmployeeDocument | null> {
    return EmployeeModel.findById(id);
  }
}
