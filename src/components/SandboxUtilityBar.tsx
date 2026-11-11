import React, { useState } from 'react';
import { useSandbox, type SupportRepRole, type ReleaseStage } from '../context/SandboxContext';
import * as DevNotesModule from './DevNotesBanner';

// Defensive component resolution to prevent "Element type is invalid" crashes
const DevNotesBannerComponent: React.ComponentType | null =
  (DevNotesModule as any).DevNotesBanner ||
  (DevNotesModule as any).default ||
  null;

export const SandboxUtilityBar: React.FC = () => {
  const {
    releaseStage,
    setReleaseStage,
    currentRole,
    setCurrentRole,
    visibleModuleCountString,
  } = useSandbox();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (typeof setReleaseStage === 'function') {
      setReleaseStage(e.target.value as ReleaseStage);
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (typeof setCurrentRole === 'function') {
      setCurrentRole(e.target.value as SupportRepRole);
    }
  };

  return (
    <header
      aria-label="Trimble prototype sandbox environment controls"
      className="sticky top-0 z-50 w-full font-sans antialiased bg-[#111315] border-b border-[#2A2E33] text-white"
    >
      {/* =========================================================================
          TIER 1: PRIMARY GLOBAL SANDBOX BAR (Aligned to Ideal Figma Spec)
          ========================================================================= */}
      <div className="mx-auto flex w-full items-center justify-between border-b border-[#2A2E33] bg-[#111315] px-4 py-2 font-sans text-xs text-white">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {/* Global Branding Title */}
          <span className="whitespace-nowrap text-[13px] font-bold tracking-tight text-white">
            Trimble Prototype Sandbox
          </span>

          {/* Feature Scope (Read-Only Pill Matching Ideal) */}
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap font-bold text-white">
              Feature Scope:
            </span>
            <div 
              aria-readonly="true"
              className="inline-flex items-center rounded border border-[#2A2E33] bg-[#111315] px-3 py-1.5 font-normal text-white select-all"
            >
              DXPBK-2123 | Enhance Support Portal to Restrict Access By Role
            </div>
          </div>

          {/* Purchase Type (Read-Only Pill Matching Ideal) */}
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap font-bold text-white">
              Purchase Type:
            </span>
            <div 
              aria-readonly="true"
              className="inline-flex items-center rounded border border-[#2A2E33] bg-[#111315] px-3 py-1.5 font-normal text-white select-none"
            >
              SaaS Subscription
            </div>
          </div>
        </div>

        {/* Global Expand / Collapse Control Button */}
        <div className="ml-4 flex items-center">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? 'Expand sandbox controls' : 'Collapse sandbox controls'}
            className="flex h-7 w-7 items-center justify-center rounded border border-[#2A2E33] bg-[#111315] text-white transition hover:bg-[#1E2226] focus:outline-none focus:ring-1 focus:ring-[#0063A3]"
          >
            <span className="select-none text-sm font-bold leading-none">
              {isCollapsed ? '+' : '−'}
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TIER 2: SECONDARY FEATURE-LEVEL BAR (DXPBK-2123 Feature Controls)
          ========================================================================= */}
      {!isCollapsed && (
        <div className="mx-auto flex w-full flex-wrap items-center gap-x-6 gap-y-2 border-b border-[#2A2E33] bg-[#16181A] px-4 py-2 font-sans text-xs text-white">
          {/* Branch Prefix & Feature Header */}
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-mono text-sm leading-none text-[#8C9BA5]">↳</span>
            <span className="font-bold text-white">Feature Controls (DXPBK-2123):</span>
          </div>

          {/* Release Stage Switcher */}
          <div className="flex items-center gap-2">
            <label htmlFor="release-stage-select" className="whitespace-nowrap font-bold text-white">
              Release Stage:
            </label>
            <select
              id="release-stage-select"
              value={releaseStage}
              onChange={handleStageChange}
              className="rounded border border-[#2A2E33] bg-[#111315] px-3 py-1.5 font-normal text-white focus:border-[#0063A3] focus:outline-none focus:ring-1 focus:ring-[#0063A3]"
            >
              <option value="stage1-mvp" className="bg-[#111315] text-white">Stage 1: MVP</option>
              <option value="stage2-enhanced" className="bg-[#111315] text-white">Stage 2: Enhanced</option>
              <option value="stage3-northstar" disabled className="bg-[#111315] text-[#5C6670] cursor-not-allowed">
                Stage 3: North Star (Disabled)
              </option>
            </select>
          </div>

          {/* Support Rep Role (Active Feature Driver in Tier 2) */}
          <div className="flex items-center gap-2">
            <label htmlFor="role-select" className="whitespace-nowrap font-bold text-white">
              Support Rep Role:
            </label>
            <select
              id="role-select"
              value={currentRole}
              onChange={handleRoleChange}
              className="rounded border border-[#2A2E33] bg-[#111315] px-3 py-1.5 font-normal text-white focus:border-[#0063A3] focus:outline-none focus:ring-1 focus:ring-[#0063A3]"
            >
              <option value="Customer Support" className="bg-[#111315] text-white">Customer Support</option>
              <option value="E-Payments Team" className="bg-[#111315] text-white">E-Payments Team</option>
              <option value="Administrator" className="bg-[#111315] text-white">Administrator</option>
            </select>
          </div>

          {/* Dynamic Read-Only Visible Modules Counter */}
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap font-bold text-white">
              Visible Modules:
            </span>
            <div
              aria-readonly="true"
              aria-live="polite"
              className="inline-flex items-center rounded border border-[#2A2E33] bg-[#111315] px-3 py-1.5 font-normal text-white select-none"
            >
              {visibleModuleCountString}
            </div>
          </div>
        </div>
      )}

      {/* Embedded Developer Notes Drawer with Safe Fallback */}
      {DevNotesBannerComponent ? <DevNotesBannerComponent /> : null}
    </header>
  );
};

export const ConnectedSandboxUtilityBar = SandboxUtilityBar;
export default SandboxUtilityBar;