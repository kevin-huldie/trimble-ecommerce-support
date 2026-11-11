import React from 'react';
import {
  useSandbox,
  type SupportRoleType,
  type PurchaseType,
  type ReleaseStage,
} from '../context/SandboxContext';
import { DevNotesBanner } from './access-by-role/DevNotesBanner';

export const SandboxUtilityBar: React.FC = () => {
  const {
    releaseStage,
    setReleaseStage,
    activeRole,
    setActiveRole,
    purchaseType,
    setPurchaseType,
    isDevNotesOpen,
    toggleDevNotes,
  } = useSandbox();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#171C24] text-white shadow-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-2 sm:px-6">
        {/* Left: Branding & Environment Indicator */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-300">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#0063A3] ring-2 ring-white/20" />
            Trimble Support Prototype
          </span>
          <span className="hidden text-xs text-gray-400 sm:inline">|</span>
          <span className="rounded bg-[#252E3E] px-2 py-0.5 text-xs font-mono text-gray-200">
            DXPBK-2123
          </span>
        </div>

        {/* Center: Interactive Persona & Modality Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Persona Switcher */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="persona-select" className="text-gray-300">
              Role:
            </label>
            <select
              id="persona-select"
              aria-label="Active Support Persona"
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as SupportRoleType)}
              className="rounded border border-gray-600 bg-[#252E3E] px-2 py-1 text-white focus:border-[#0063A3] focus:outline-none focus:ring-1 focus:ring-[#0063A3]"
            >
              <option value="super-admin">Super Admin (All 14)</option>
              <option value="tier1-support">Tier 1 Support Rep</option>
              <option value="tier2-support">Tier 2 Support Specialist</option>
              <option value="compliance-auditor">Compliance Auditor</option>
            </select>
          </div>

          {/* Purchase Modality Switcher */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="purchase-select" className="text-gray-300">
              Modality:
            </label>
            <select
              id="purchase-select"
              aria-label="Purchase Modality"
              value={purchaseType}
              onChange={(e) => setPurchaseType(e.target.value as PurchaseType)}
              className="rounded border border-gray-600 bg-[#252E3E] px-2 py-1 text-white focus:border-[#0063A3] focus:outline-none focus:ring-1 focus:ring-[#0063A3]"
            >
              <option value="saas-subscription">SaaS Subscription</option>
              <option value="hardware-purchase">Hardware Purchase</option>
              <option value="hybrid-bundle">Hybrid Bundle</option>
            </select>
          </div>

          {/* Release Stage Switcher */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="stage-select" className="text-gray-300">
              Stage:
            </label>
            <select
              id="stage-select"
              aria-label="Release Stage View"
              value={releaseStage}
              onChange={(e) => setReleaseStage(e.target.value as ReleaseStage)}
              className="rounded border border-gray-600 bg-[#252E3E] px-2 py-1 text-white focus:border-[#0063A3] focus:outline-none focus:ring-1 focus:ring-[#0063A3]"
            >
              <option value="stage1-mvp">Stage 1 (MVP)</option>
              <option value="stage2-enhanced">Stage 2 (Enhanced)</option>
              <option value="stage3-northstar">Stage 3 (Northstar)</option>
            </select>
          </div>
        </div>

        {/* Right: Drawer Toggle */}
        <div className="flex items-center">
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

export const ConnectedSandboxUtilityBar = SandboxUtilityBar;
export default SandboxUtilityBar;