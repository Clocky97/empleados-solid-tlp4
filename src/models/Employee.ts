import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee {
  name: string;
  position: string;
  baseSalary: number;
  yearsOfService: number;
  finalSalary: number;
}

export interface IEmployeeDocument extends IEmployee, Document {}

const employeeSchema = new Schema<IEmployeeDocument>(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    baseSalary: { type: Number, required: true },
    yearsOfService: { type: Number, required: true },
    finalSalary: { type: Number, required: true }
  },
  { timestamps: true }
);

export const EmployeeModel = mongoose.model<IEmployeeDocument>('Employee', employeeSchema);
