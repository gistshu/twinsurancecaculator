
import { InsuranceSettings } from './types';

export const DEFAULT_SETTINGS: InsuranceSettings = {
  // Labor Insurance (勞保)
  laborRate: 0.12, // 11% + 1% unemployment
  laborEmployeeShare: 0.2,
  laborEmployerShare: 0.7,
  
  // Health Insurance (健保)
  healthRate: 0.0517,
  healthAvgDependents: 0.57, // Employer pays based on 1 + 0.57
  healthEmployeeShare: 0.3,
  healthEmployerShare: 0.6,
  healthDependentCap: 3, // Max dependents for employee share calculation

  // Labor Pension (勞退)
  pensionMinRate: 0.06,

  // Tiers (114 Year Defaults)
  laborTiers: [
    28590, 29700, 30300, 31800, 33300, 34800, 36300, 38200, 40100, 42000, 43900, 45800
  ],
  
  healthTiers: [
    28590, 29700, 30300, 31800, 33300, 34800, 36300, 38200, 40100, 42000, 43900, 45800,
    48200, 50600, 53000, 55400, 57800, 60800, 63800, 66800, 69800, 72800, 76500, 80200,
    83900, 87600, 92100, 96600, 101100, 105600, 110100, 115500, 120900, 126300, 131700,
    137100, 142500, 147900, 153300, 158700, 164100, 169500, 175000, 182000, 189000, 
    196000, 203000, 210000, 219500
  ]
};

export const MIN_WAGE_114 = 28590;
