import { ISalaryCalculator } from './ISalaryCalculator';

export class AntiquitySalaryCalculator implements ISalaryCalculator {
  private readonly ratePerYear: number;

  constructor(ratePerYear: number = 0.02) {
    this.ratePerYear = ratePerYear;
  }

  calculate(baseSalary: number, yearsOfService: number): number {
    const bonus = baseSalary * this.ratePerYear * yearsOfService;
    return baseSalary + bonus;
  }
}
