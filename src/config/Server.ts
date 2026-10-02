import 'dotenv/config';
import express, { Express } from 'express';
import mongoose from 'mongoose';
import { EmployeeRoutes } from '../routes/EmployeeRoutes';
import { EmployeeController } from '../controllers/EmployeeController';
import { EmployeeService } from '../services/EmployeeService';
import { EmployeeRepository } from '../repositories/EmployeeRepository';
import { AntiquitySalaryCalculator } from '../services/AntiquitySalaryCalculator';
import { ErrorHandler } from '../errors/ErrorHandler';

export class Server {
  private readonly app: Express;
  private readonly port: number;
  private readonly mongoUri: string;

  constructor() {
    this.app = express();
    this.port = Number(process.env.PORT ?? 3000);
    this.mongoUri = process.env.MONGO_URI ?? 'mongodb://localhost:27017/employees_db';
    this.configureMiddlewares();
    this.configureRoutes();
    this.configureErrorHandler();
  }

  private configureMiddlewares(): void {
    this.app.use(express.json());
  }

  private configureRoutes(): void {
    const salaryCalculator = new AntiquitySalaryCalculator();
    const employeeRepository = new EmployeeRepository();
    const employeeService = new EmployeeService(employeeRepository, salaryCalculator);
    const employeeController = new EmployeeController(employeeService);
    const employeeRoutes = new EmployeeRoutes(employeeController);

    this.app.use(employeeRoutes.getRoutes());
  }

  private configureErrorHandler(): void {
    const errorHandler = new ErrorHandler();
    this.app.use(errorHandler.handle);
  }

  public async start(): Promise<void> {
    try {
      await mongoose.connect(this.mongoUri);
      console.log('MongoDB conectado');
      this.app.listen(this.port, () => {
        console.log(`Servidor escuchando en http://localhost:${this.port}`);
      });
    } catch (error) {
      console.error('No se pudo conectar a MongoDB', error);
      process.exit(1);
    }
  }
}
