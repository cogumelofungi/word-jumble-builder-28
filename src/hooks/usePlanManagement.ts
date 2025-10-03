import { useState } from 'react';
import { useUserPlan } from './useUserPlan';

export interface PlanUpgradeInfo {
  canUpgrade: boolean;
  canDowngrade: boolean;
  availableUpgrades: string[];
  downgradeLimitation: string | null;
}

export const usePlanManagement = (): PlanUpgradeInfo => {
  const { planName } = useUserPlan();

  const getPlanInfo = (currentPlan: string | null): PlanUpgradeInfo => {
    switch (currentPlan) {
      case 'Essencial':
        return {
          canUpgrade: true,
          canDowngrade: false,
          availableUpgrades: ['Profissional', 'Empresarial'],
          downgradeLimitation: 'Este é o plano base - não é possível fazer downgrade.'
        };
      
      case 'Profissional':
        return {
          canUpgrade: true,
          canDowngrade: true,
          availableUpgrades: ['Empresarial'],
          downgradeLimitation: 'Downgrade disponível apenas via suporte.'
        };
      
      case 'Empresarial':
        return {
          canUpgrade: false,
          canDowngrade: true,
          availableUpgrades: [],
          downgradeLimitation: 'Downgrade disponível apenas via suporte.'
        };
      
      default:
        return {
          canUpgrade: true,
          canDowngrade: false,
          availableUpgrades: ['Profissional', 'Empresarial'],
          downgradeLimitation: null
        };
    }
  };

  return getPlanInfo(planName);
};

export const getPlanLimits = (planName: string): number => {
  switch (planName) {
    case 'Essencial':
      return 1;
    case 'Profissional':
      return 5;
    case 'Empresarial':
      return 10;
    case 'Gratuito':
      return 0;
    default:
      return 0; // Plano gratuito como padrão
  }
};