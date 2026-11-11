import React, { useState } from 'react';
import { useSandbox } from '../context/SandboxContext';
import { ALL_PORTAL_TILES } from '../pages/HomePage';

export const SandboxDevNotes: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentRole, releaseStage, visibleModuleNames } = useSandbox();

  // Filter the authoritative tiles down strictly to what is currently visible on the grid
  const currentTiles = ALL_PORTAL_TILES.filter((tile) =>
    (visibleModuleNames ?? []).includes(tile.title as any)
  );

  const activeCount = currentTiles.filter((t) => !t.isFutureRelease).length;
  const plannedCount = currentTiles.filter((t) => t.isFutureRelease).length;

  return (
    <aside
      aria-label="Developer Architecture and Role Specifications"
      className="w-full border-b border-[#0D1F33] bg-[#050E17] text-[#D0D7DE] font-sans text-xs transition-colors"
    >
      {/* Collapsed Top Bar matching Screenshot 1 */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5">
        <div className="flex items-center gap-3">
          {/* Vertical Cyan Accent Marker */}
          <span className="h-4 w-1 rounded-full bg-[#00A3E0]" aria-hidden="true" />
          
          <div className="flex items-center gap-2">
            <span className="text-[#00A3E0] font-bold text-xs" aria-hidden="true">ℹ</span>
            <span className="font-bold tracking-wider text-white uppercase text-[11px]">
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
          className="rounded border border-[#213854] bg-[#0B1B2B] px-3 py-1 text-[11px] font-medium text-[#C9D1D9] transition hover:border-[#00A3E0] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#00A3E0]"
          aria-expanded={isOpen}
        >
          {isOpen ? 'Hide Dev Notes' : 'Show Dev Notes'}
        </button>
      </div>

      {/* Expanded Content matching Screenshot 2 */}
      {isOpen && (
        <div className="border-t border-[#0D1F33] bg-[#07111E] px-6 pt-3 pb-5">
          <div className="mx-auto max-w-7xl">
            {/* Subtitle Scope Description */}
            <p className="text-xs text-[#8B949E] leading-relaxed mb-4">
              Restricts workspace visibility to authoritative modules calibrated for{' '}
              <strong className="text-white">{currentRole}</strong> ({activeCount} Active, {plannedCount} Planned).
            </p>

            {/* Two-Column Specification Grid */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              
              {/* Column 1: Role Access & Persona Governance */}
              <div>
                <h4 className="text-[11px] font-bold tracking-wider text-[#00A3E0] uppercase mb-3">
                  ROLE ACCESS & PERSONA GOVERNANCE
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="rounded bg-[#0B1B2B] border border-[#213854] px-2 py-0.5 text-[10px] font-bold text-[#8B949E] uppercase shrink-0 min-w-[125px]">
                      Active Persona:
                    </span>
                    <span className="text-[#C9D1D9] self-center font-semibold text-white">
                      {currentRole}
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="rounded bg-[#0B1B2B] border border-[#213854] px-2 py-0.5 text-[10px] font-bold text-[#8B949E] uppercase shrink-0 min-w-[125px]">
                      Operational SLA:
                    </span>
                    <span className="text-[#C9D1D9] self-center">
                      {currentRole === 'Customer Support' && 'Immediate post-purchase inquiry resolution; 4-hour FCR target.'}
                      {currentRole === 'E-Payments Team' && '7-to-45 day banking representment dispute evidence deadline.'}
                      {currentRole === 'Administrator' && 'Unrestricted system configuration and cross-platform role assignment.'}
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="rounded bg-[#0B1B2B] border border-[#213854] px-2 py-0.5 text-[10px] font-bold text-[#8B949E] uppercase shrink-0 min-w-[125px]">
                      Override Authority:
                    </span>
                    <span className="text-[#C9D1D9] self-center">
                      {currentRole === 'Customer Support' && 'Standard tax exemption hold verification and unfulfilled order cancellation.'}
                      {currentRole === 'E-Payments Team' && 'Payment gateway representment, TID timelines, and forensic dispute logs.'}
                      {currentRole === 'Administrator' && 'D-Country embargo releases, product SKU ingestion, and role policies.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Column 2: Permitted Workspace Modules */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[11px] font-bold tracking-wider text-[#00A3E0] uppercase">
                    PERMITTED WORKSPACE MODULES
                  </h4>
                  <span className="text-[10px] text-[#8B949E]">
                    Showing {currentTiles.length} of {ALL_PORTAL_TILES.length} Modules
                  </span>
                </div>

                {/* Dynamic Badges Container: Solid Blue for Active; Outlined for Planned */}
                <div className="flex flex-wrap gap-2">
                  {currentTiles.map((tile) => (
                    <span
                      key={tile.id}
                      className={`inline-flex items-center rounded px-2.5 py-1 text-[11px] font-semibold tracking-wide transition ${
                        tile.isFutureRelease
                          ? 'border border-[#465362] bg-transparent text-[#8C9BA5]'
                          : 'bg-[#0063A3] text-white shadow-sm'
                      }`}
                    >
                      <span
                        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                          tile.isFutureRelease ? 'bg-[#8C9BA5]' : 'bg-white'
                        }`}
                        aria-hidden="true"
                      />
                      {tile.title}
                      {tile.isFutureRelease && (
                        <span className="ml-1 text-[9px] font-normal uppercase tracking-wider text-[#8C9BA5]">
                          (Planned)
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Evaluation Callout Box matching Screenshot 2 */}
            <div className="mt-5 rounded border border-[#16273B] bg-[#0A1624] px-4 py-2.5 flex items-center gap-2 text-xs">
              <span className="text-sm" aria-hidden="true">💡</span>
              <p className="text-[#8B949E]">
                <strong className="text-[#C9D1D9]">Evaluation Guide:</strong> Toggle between{' '}
                <span className="text-white font-medium">Customer Support</span> (9 operational modules),{' '}
                <span className="text-white font-medium">E-Payments Team</span> (2 focused modules), and{' '}
                <span className="text-white font-medium">Administrator</span> in Tier 2 to observe dynamic badge and workspace grid filtering.
              </p>
            </div>

          </div>
        </div>
      )}
    </aside>
  );
};

export default SandboxDevNotes;