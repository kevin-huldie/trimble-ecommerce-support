import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type ProductHorizon = 'H1' | 'H2' | 'H3';

type HorizonContextValue = {
  horizon: ProductHorizon;
  setHorizon: (horizon: ProductHorizon) => void;
};

const HorizonContext = createContext<HorizonContextValue | null>(null);

export function HorizonProvider({ children }: { children: ReactNode }) {
  const [horizon, setHorizon] = useState<ProductHorizon>('H1');

  const value = useMemo(() => ({ horizon, setHorizon }), [horizon]);

  return <HorizonContext.Provider value={value}>{children}</HorizonContext.Provider>;
}

export function useHorizon(): HorizonContextValue {
  const ctx = useContext(HorizonContext);
  if (!ctx) {
    throw new Error('useHorizon must be used within a HorizonProvider');
  }
  return ctx;
}

export function horizonLevel(horizon: ProductHorizon): number {
  switch (horizon) {
    case 'H3':
      return 3;
    case 'H2':
      return 2;
    default:
      return 1;
  }
}

export function isHorizonAtLeast(current: ProductHorizon, required: ProductHorizon): boolean {
  return horizonLevel(current) >= horizonLevel(required);
}
