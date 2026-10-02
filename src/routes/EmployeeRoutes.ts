import { Router } from 'express';
import { EmployeeController } from '../controllers/EmployeeController';

export class EmployeeRoutes {
  private readonly router: Router;
  private readonly employeeController: EmployeeController;

  constructor(employeeController: EmployeeController) {
    this.router = Router();
    this.employeeController = employeeController;
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post('/employees', this.employeeController.createEmployee);
    this.router.get('/employees', this.employeeController.getEmployees);
    this.router.get('/employees/:id', this.employeeController.getEmployeeById);
  }

  public getRoutes(): Router {
    return this.router;
  }
}
