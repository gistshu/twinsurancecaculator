
import { CalculationInput, CalculationResult, InsuranceSettings } from '../types';

const findTier = (salary: number, tiers: number[]): number => {
  const tier = tiers.find(t => t >= salary);
  return tier || (tiers.length > 0 ? tiers[tiers.length - 1] : salary);
};

export const calculateInsurance = (input: CalculationInput, settings: InsuranceSettings): CalculationResult => {
  const { salary, dependents, pensionRate } = input;
  
  // 1. Labor Insurance
  const laborBase = findTier(salary, settings.laborTiers);
  const laborTotal = Math.round(laborBase * settings.laborRate);
  const laborEmployee = Math.round(laborTotal * settings.laborEmployeeShare);
  const laborEmployer = Math.round(laborTotal * settings.laborEmployerShare);

  // 2. Health Insurance
  const healthBase = findTier(salary, settings.healthTiers);
  const healthUnitPrice = healthBase * settings.healthRate;
  
  const healthEmployee = Math.round(
    healthUnitPrice * 
    settings.healthEmployeeShare * 
    (1 + Math.min(dependents, settings.healthDependentCap))
  );
  
  const healthEmployer = Math.round(
    healthUnitPrice * 
    settings.healthEmployerShare * 
    (1 + settings.healthAvgDependents)
  );

  // 3. Labor Pension
  const pensionBase = findTier(salary, settings.healthTiers); 
  const pensionEmployer = Math.round(pensionBase * settings.pensionMinRate);
  const pensionEmployeeVoluntary = Math.round(pensionBase * (pensionRate / 100));

  // 4. Summaries
  const totalEmployeeDeduction = laborEmployee + healthEmployee + pensionEmployeeVoluntary;
  const totalEmployerCost = salary + laborEmployer + healthEmployer + pensionEmployer;
  const netPay = salary - totalEmployeeDeduction;

  return {
    laborInsurance: {
      base: laborBase,
      employee: laborEmployee,
      employer: laborEmployer,
      total: laborTotal,
    },
    healthInsurance: {
      base: healthBase,
      employee: healthEmployee,
      employer: healthEmployer,
      total: healthEmployer + healthEmployee 
    },
    laborPension: {
      base: pensionBase,
      employer: pensionEmployer,
      employeeVoluntary: pensionEmployeeVoluntary
    },
    summary: {
      totalEmployeeDeduction,
      totalEmployerCost,
      netPay
    }
  };
};
