import React from 'react';
import {
  useSandbox,
  ROLE_DEFINITIONS,
  PORTAL_OPERATIONAL_TILE_COUNT,
  type SupportRoleType,
  type ReleaseStage,
  type PurchaseType,
} from '../context/SandboxContext';
import { DevNotesBanner } from './access-by-role/DevNotesBanner';

export const SandboxUtilityBar: React.FC = () => {
  const {
    activeRole,
    setActiveRole,
    releaseStage,
    setReleaseStage,
    purchaseType,
    setPurchaseType,
    allowedTiles,
    isDevNotesOpen,
    toggleDevNotes,
  } = useSandbox();

  return (
    <header className="sticky top-0 z-50 flex flex-col bg-[#1A222D] text-white shadow-md">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-2 text-xs">
        {/* Environment & Role Selector */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="role-select" className="font-semibold text-gray-300">
              Role:
            </label>
            <select
              id="role-select"
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as SupportRoleType)}
              className="rounded border border-gray-600 bg-[#252E3E] px-2 py-1 text-xs text-white focus:border-[#0063A3] focus:outline-none"
            >
              {Object.values(ROLE_DEFINITIONS).map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="stage-select" className="font-semibold text-gray-300">
              Stage:
            </label>
            <select
              id="stage-select"
              value={releaseStage}
              onChange={(e) => setReleaseStage(e.target.value as ReleaseStage)}
              className="rounded border border-gray-600 bg-[#252E3E] px-2 py-1 text-xs text-white focus:border-[#0063A3] focus:outline-none"
            >
              <option value="stage1-mvp">Stage 1: MVP</option>
              <option value="stage2-enhanced">Stage 2: Enhanced</option>
              <option value="stage3-northstar">Stage 3: Northstar</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="purchase-select" className="font-semibold text-gray-300">
              Order Type:
            </label>
            <select
              id="purchase-select"
              value={purchaseType}
              onChange={(e) => setPurchaseType(e.target.value as PurchaseType)}
              className="rounded border border-gray-600 bg-[#252E3E] px-2 py-1 text-xs text-white focus:border-[#0063A3] focus:outline-none"
            >
              <option value="saas-subscription">SaaS Subscription</option>
              <option value="physical-hardware">Physical Hardware</option>
              <option value="perpetual-license">Perpetual License</option>
            </select>
          </div>
        </div>

        {/* Counter and Dev Notes Toggle */}
        <div className="flex items-center gap-4">
          <div
            aria-live="polite"
            className="flex items-center gap-2 rounded bg-[#252E3E] px-3 py-1 font-mono text-xs font-semibold text-[#80BFFF]"
          >
            <span>Active Modules:</span>
            <span className="text-white">
              {allowedTiles.length} / {PORTAL_OPERATIONAL_TILE_COUNT}
            </span>
          </div>

          <button
type="button"
onClick={toggleDevNotes}
aria-expanded={isDevNotesOpen}
className={`rounded px-3 py-1 text-xs font-semibold transition ${
  isDevNotesOpen
    ? 'bg-[#0063A3] text-white hover:bg-[#004F82]'
    : 'border border-gray-500 bg-transparent text-gray-300 hover:bg-[#252E3E]'
}`}
>
{isDevNotesOpen ? 'Hide Dev Notes' : 'Show Dev Notes'}
</button>
</div>
</div>

{/* Synchronized Dev Notes Banner Drawer */}
<DevNotesBanner />
</header>
);
};

// ---> ADD THESE TWO LINES DIRECTLY BELOW <---
export const ConnectedSandboxUtilityBar = SandboxUtilityBar;
export default SandboxUtilityBar;