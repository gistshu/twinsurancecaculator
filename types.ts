
export interface CalculationInput {
  salary: number;
  dependents: number;
  pensionRate: number;
}

export interface InsuranceSettings {
  laborRate: number;
  laborEmployeeShare: number;
  laborEmployerShare: number;
  healthRate: number;
  healthAvgDependents: number;
  healthEmployeeShare: number;
  healthEmployerShare: number;
  healthDependentCap: number;
  pensionMinRate: number;
  laborTiers: number[];
  healthTiers: number[];
}

export interface CalculationResult {
  laborInsurance: {
    base: number;
    employee: number;
    employer: number;
    total: number;
  };
  healthInsurance: {
    base: number;
    employee: number;
    employer: number;
    total: number;
  };
  laborPension: {
    base: number;
    employer: number;
    employeeVoluntary: number;
  };
  summary: {
    totalEmployeeDeduction: number;
    totalEmployerCost: number;
    netPay: number;
  };
}

export interface SavedCalculation extends CalculationResult {
  id: string;
  timestamp: number;
  input: CalculationInput;
  label: string;
}
