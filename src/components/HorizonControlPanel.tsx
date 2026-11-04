import type { FC } from 'react';
import { horizonLevel, useHorizon, type ProductHorizon } from '../context/HorizonContext';

const HORIZON_OPTIONS = [
  { id: 1, label: 'Horizon 1 (MVP)' },
  { id: 2, label: 'Horizon 2 (Intermediate)' },
  { id: 3, label: 'Horizon 3 (Blue-Sky)' },
] as const;

function numberToHorizon(level: number): ProductHorizon {
  if (level === 3) return 'H3';
  if (level === 2) return 'H2';
  return 'H1';
}

export type HorizonControlPanelProps = {
  currentHorizon: number;
  setHorizon: (h: number) => void;
};

export const HorizonControlPanel: FC<HorizonControlPanelProps> = ({
  currentHorizon,
  setHorizon,
}) => {
  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between bg-[#1E2229] px-6 py-3 text-white shadow-md">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold uppercase tracking-wide text-[#A0A8B6]">
          Trimble eCommerce Support Portal
        </span>
        <span className="rounded bg-[#2E3440] px-2 py-0.5 text-xs text-[#E5E9F0]">
          Modus 1.0 / MXP 2.0
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="mr-2 text-xs text-[#A0A8B6]">Product Horizon:</span>
        {HORIZON_OPTIONS.map((horizon) => (
          <button
            key={horizon.id}
            type="button"
            aria-pressed={currentHorizon === horizon.id}
            onClick={() => setHorizon(horizon.id)}
            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
              currentHorizon === horizon.id
                ? 'bg-[#0063A3] text-white'
                : 'bg-[#2E3440] text-[#D8DEE9] hover:bg-[#4C566A]'
            }`}
          >
            {horizon.label}
          </button>
        ))}
      </div>
    </header>
  );
};

/** Wired to `HorizonProvider` — used in `App.tsx`. */
export const ConnectedHorizonControlPanel: FC = () => {
  const { horizon, setHorizon } = useHorizon();
  return (
    <HorizonControlPanel
      currentHorizon={horizonLevel(horizon)}
      setHorizon={(level) => setHorizon(numberToHorizon(level))}
    />
  );
};
