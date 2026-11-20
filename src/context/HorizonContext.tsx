import type { ReactNode } from 'react';
import {
  horizonToReleaseStage,
  releaseStageToHorizon,
  useSandbox,
} from './SandboxContext';

export type ProductHorizon = 'H1' | 'H2' | 'H3';

type HorizonContextValue = {
  horizon: ProductHorizon;
  setHorizon: (horizon: ProductHorizon) => void;
};

/** @deprecated Use `SandboxProvider` and `useSandbox` release stage instead. */
export function HorizonProvider({ children }: { children: ReactNode }) {
  return children;
}

export function useHorizon(): HorizonContextValue {
  const { releaseStage, setReleaseStage } = useSandbox();
  return {
    horizon: releaseStageToHorizon(releaseStage),
    setHorizon: (horizon) => setReleaseStage(horizonToReleaseStage(horizon)),
  };
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
