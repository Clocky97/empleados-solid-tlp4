import { NextFunction, Request, Response } from 'express';
import { IEmployeeService } from '../services/IEmployeeService';

export class EmployeeController {
  private readonly employeeService: IEmployeeService;

  constructor(employeeService: IEmployeeService) {
    this.employeeService = employeeService;
  }

  createEmployee = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const employee = await this.employeeService.createEmployee(req.body);
      return res.status(201).json(employee);
    } catch (error) {
      next(error);
    }
  };

  getEmployees = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const employees = await this.employeeService.getAllEmployees();
      return res.json(employees);
    } catch (error) {
      next(error);
    }
  };

  getEmployeeById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const employeeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const employee = await this.employeeService.getEmployeeById(employeeId);
      return res.json(employee);
    } catch (error) {
      next(error);
    }
  };
}
