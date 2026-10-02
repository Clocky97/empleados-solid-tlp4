import { IEmployeeDocument } from '../models/Employee';

export interface CreateEmployeeDTO {
  name: string;
  position: string;
  baseSalary: number;
  yearsOfService: number;
}

export interface IEmployeeService {
  createEmployee(data: CreateEmployeeDTO): Promise<IEmployeeDocument>;
  getAllEmployees(): Promise<IEmployeeDocument[]>;
  getEmployeeById(id: string): Promise<IEmployeeDocument>;
}
