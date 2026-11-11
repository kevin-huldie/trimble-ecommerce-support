import React, { useState } from 'react';
import { useSandbox } from '../context/SandboxContext';
import { ALL_PORTAL_TILES } from '../pages/HomePage';

export const DevNotesBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { currentRole, releaseStage, visibleModuleNames } = useSandbox();

  // Filter authoritative tiles down strictly to what is currently visible on the grid for the active role
  const currentTiles = ALL_PORTAL_TILES.filter((tile) =>
    (visibleModuleNames ?? []).includes(tile.title as any)
  );

  const activeCount = currentTiles.filter((t) => !t.isFutureRelease).length;
  const plannedCount = currentTiles.filter((t) => t.isFutureRelease).length;

  return (
    <aside
      aria-label="Developer Architecture and Role Specifications"
      className="w-full border-b border-[#0D1F33] bg-[#050E17] font-sans text-xs text-white transition-colors"
    >
      {/* 1. Full-width Persistent Summary Bar */}
      <div className="flex w-full items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {/* Vertical Cyan Accent Marker */}
          <span className="h-4 w-1 rounded-full bg-[#00A3E0]" aria-hidden="true" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#00A3E0]" aria-hidden="true">ℹ</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white">
              {releaseStage === 'stage1-mvp' && 'STAGE 1: MVP SCOPE (BASELINE OPERATIONAL TRIAGE)'}
              {releaseStage === 'stage2-enhanced' && 'STAGE 2: ENHANCED SCOPE (OPERATIONAL & TELEMETRY)'}
              {releaseStage === 'stage3-northstar' && 'STAGE 3: NORTH STAR SCOPE (AUTONOMOUS ORCHESTRATION)'}
            </span>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="rounded border border-[#213854] bg-[#0B1B2B] px-3 py-1 text-[11px] font-semibold text-white transition hover:border-[#00A3E0] hover:bg-[#102438] focus:outline-none focus:ring-2 focus:ring-[#00A3E0]"
          aria-expanded={isOpen}
          aria-controls="dev-notes-drawer-content"
        >
          {isOpen ? 'Hide Dev Notes' : 'Show Dev Notes'}
        </button>
      </div>

      {/* 2. Full-width Expanded Content */}
      {isOpen && (
        <section
          id="dev-notes-drawer-content"
          className="w-full border-t border-[#0D1F33] bg-[#07111E] px-4 pt-3 pb-5 sm:px-6 lg:px-8"
        >
          <div className="w-full">
            {/* Scope Subtitle Description with High-Contrast White Text */}
            <p className="mb-4 text-xs leading-relaxed text-white">
              Restricts workspace visibility to authoritative modules calibrated for{' '}
              <strong className="font-bold text-[#38BDF8]">{currentRole}</strong>{' '}
              <span className="text-[#E2E8F0]">({activeCount} Active, {plannedCount} Planned)</span>.
            </p>

            {/* Two-Column Specification Grid */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

              {/* Column 1: Role Access & Persona Governance */}
              <div>
                <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#00A3E0]">
                  ROLE ACCESS & PERSONA GOVERNANCE
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="min-w-[130px] shrink-0 rounded border border-[#2A4365] bg-[#0E1E32] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#E2E8F0]">
                      Active Persona:
                    </span>
                    <span className="self-center font-bold text-white">
                      {currentRole}
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="min-w-[130px] shrink-0 rounded border border-[#2A4365] bg-[#0E1E32] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#E2E8F0]">
                      Operational SLA:
                    </span>
                    <span className="self-center font-normal leading-relaxed text-white">
                      {currentRole === 'Customer Support' && 'Immediate post-purchase inquiry resolution; 4-hour FCR target.'}
                      {currentRole === 'E-Payments Team' && '7-to-45 day banking representment dispute evidence deadline.'}
                      {currentRole === 'Administrator' && 'Unrestricted system configuration and cross-platform role assignment.'}
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="min-w-[130px] shrink-0 rounded border border-[#2A4365] bg-[#0E1E32] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#E2E8F0]">
                      Override Authority:
                    </span>
                    <span className="self-center font-normal leading-relaxed text-white">
                      {currentRole === 'Customer Support' && 'Standard tax exemption hold verification and unfulfilled order cancellation.'}
                      {currentRole === 'E-Payments Team' && 'Payment gateway representment, TID timelines, and forensic dispute logs.'}
                      {currentRole === 'Administrator' && 'D-Country embargo releases, product SKU ingestion, and role policies.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Column 2: Permitted Workspace Modules */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#00A3E0]">
                    PERMITTED WORKSPACE MODULES
                  </h4>
                  {/* High-Visibility Status Pill Badge */}
                  <span className="inline-flex items-center rounded-full border border-[#00A3E0]/50 bg-[#0B1B2B] px-2.5 py-0.5 text-[11px] font-semibold text-[#38BDF8] shadow-sm">
                    Showing {currentTiles.length} of {ALL_PORTAL_TILES.length} Modules
                  </span>
                </div>

                {/* Badges Container: Solid Primary Blue (#0063A3) vs. High-Contrast Tertiary Slate (#1C2C3D) */}
                <div className="flex flex-wrap gap-2">
                  {currentTiles.map((tile) => (
                    <span
                      key={tile.id}
                      className={`inline-flex items-center rounded px-2.5 py-1 text-[11px] font-semibold tracking-wide transition ${
                        tile.isFutureRelease
                          ? 'border border-[#384C62] bg-[#1C2C3D] text-[#E2E8F0] shadow-inner'
                          : 'bg-[#0063A3] text-white shadow-sm'
                      }`}
                    >
                      {/* Status indicator dot */}
                      <span
                        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                          tile.isFutureRelease ? 'bg-[#94A3B8]' : 'bg-white'
                        }`}
                        aria-hidden="true"
                      />
                      {tile.title}
                      {tile.isFutureRelease && (
                        <span className="ml-1 text-[9px] font-bold uppercase tracking-wider text-[#94A3B8]">
                          (Planned)
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* 3. Full-width Evaluation Callout Box */}
<div className="mt-5 flex items-center gap-2.5 rounded border border-[#1B324B] bg-[#0A1A2C] px-4 py-2.5 text-xs text-white">
  <span className="text-base" aria-hidden="true">💡</span>
  <p className="leading-relaxed text-white">
    <strong className="font-bold text-[#38BDF8]">Evaluation guide:</strong> Toggle between{' '}
    <span className="font-semibold text-white">Customer Support</span>,{' '}
    <span className="font-semibold text-white">E-Payments Team</span>, and{' '}
    <span className="font-semibold text-white">Administrator</span> using the{' '}
    <strong className="font-semibold text-[#38BDF8]">Support Rep Role</strong> dropdown above to observe dynamic badge and workspace grid filtering.
  </p>
</div>

          </div>
        </section>
      )}
    </aside>
  );
};

export default DevNotesBanner;