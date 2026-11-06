import React, { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Ban,
  BarChart3,
  CreditCard,
  FileText,
  Lock,
  PauseCircle,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Tag,
  UploadCloud,
  Users,
} from 'lucide-react';
import { PortalShell } from '../components/PortalShell';
import { useSandbox } from '../context/SandboxContext';
import type { FeatureScope, ReleaseStage } from '../context/SandboxContext';

export interface PortalTile {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
  buttonLabel: string;
}

// 12 cards ordered by task-frequency & operational lifecycle
const ALL_PORTAL_TILES: PortalTile[] = [
  // Tier 1: Primary investigation & order mutation
  {
    id: 'order-details',
    title: 'Order details',
    description:
      'Search by order number or account ID. Access itemized records, license keys, and transaction history.',
    route: '/order-details',
    icon: FileText,
    buttonLabel: 'View orders',
  },
  {
    id: 'cancel-orders',
    title: 'Cancel orders',
    description:
      'Execute customer- or merchant-initiated order cancellations before warehouse fulfillment commences.',
    route: '/cancel-orders',
    icon: Ban,
    buttonLabel: 'Cancel order',
  },
  {
    id: 'refund-orders',
    title: 'Refund orders',
    description:
      'Issue full or partial refunds directly to original payment methods or grant Trimble store credit.',
    route: '/refund-orders',
    icon: CreditCard,
    buttonLabel: 'Issue refund',
  },
  {
    id: 'process-returns',
    title: 'Process returns',
    description:
      'Initiate customer returns, log damaged hardware, issue return labels, and track incoming RMA shipments.',
    route: '/process-returns',
    icon: RotateCcw,
    buttonLabel: 'Process return',
  },

  // Tier 2: Compliance, dispute & risk clearance
  {
    id: 'release-holds',
    title: 'Releasing holds',
    description:
      'Review and resolve compliance, credit, fraud, or high-risk D-Country holds requiring operational clearance.',
    route: '/release-holds',
    icon: PauseCircle,
    buttonLabel: 'Release holds',
  },
  {
    id: 'tax-exemption-holds',
    title: 'Releasing tax exempted holds',
    description:
      'Validate VAT/GST IDs, Canadian provincial exemption certificates, and US state forms to release pending orders.',
    route: '/tax-exemption-holds',
    icon: ShieldCheck,
    buttonLabel: 'Verify tax',
  },
  {
    id: 'process-chargebacks',
    title: 'Process chargeback',
    description:
      'Compile representment evidence, dispute issuing bank chargebacks, and handle customer payment reversals.',
    route: '/chargebacks',
    icon: AlertTriangle,
    buttonLabel: 'View disputes',
    isFutureRelease: true,
  },

  // Tier 3: System exception recovery & audit telemetry
  {
    id: 'failed-orders',
    title: 'Reprocessing failed orders',
    description:
      'Diagnose gateway timeouts, address verification flags, and reprocess stuck orders through fulfillment.',
    route: '/failed-orders',
    icon: RefreshCw,
    buttonLabel: 'Retry orders',
  },
  {
    id: 'generate-report',
    title: 'Generate report',
    description:
      'Generate and export User Access Review (UAR) audit logs and post-purchase exception reports as PDF or Excel.',
    route: '/reports',
    icon: BarChart3,
    buttonLabel: 'Generate report',
  },

  // Tier 4: Enterprise operations & administration
  {
    id: 'product-upload',
    title: 'Product upload',
    description:
      'Batch upload catalog SKU updates, software license bundle definitions, and enterprise pricing matrices.',
    route: '/product-upload',
    icon: UploadCloud,
    buttonLabel: 'Upload products',
    isFutureRelease: true,
  },
  {
    id: 'promo-code-upload',
    title: 'Promo code upload',
    description:
      'Configure and publish enterprise discount campaigns, seasonal promotional codes, and retention vouchers.',
    route: '/promo-code-upload',
    icon: Tag,
    buttonLabel: 'Upload codes',
    isFutureRelease: true,
  },
  {
    id: 'role-management',
    title: 'Role management',
    description:
      'Assign, stack, and revoke user roles across support personnel to enforce system access governance.',
    route: '/role-management',
    icon: Users,
    buttonLabel: 'Manage roles',
  },
];

function isStage1(releaseStage: ReleaseStage): boolean {
  return releaseStage === 'stage1-mvp';
}

function isStage2Or3(releaseStage: ReleaseStage): boolean {
  return releaseStage === 'stage2-enhanced' || releaseStage === 'stage3-northstar';
}

function homeTileTooltipMessage(title: string): string {
  return `Navigates to ${title} flow`;
}

function filterTilesForScope(
  featureScope: FeatureScope,
  isTileAllowed: (tileId: string) => boolean,
): PortalTile[] {
  if (featureScope === 'DXPBK-1900') {
    return ALL_PORTAL_TILES;
  }
  return ALL_PORTAL_TILES.filter((tile) => isTileAllowed(tile.id));
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { releaseStage, activeRole, featureScope, isTileAllowed } = useSandbox();
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const gridsRef = useRef<HTMLDivElement>(null);

  const visibleTiles = useMemo(
    () => filterTilesForScope(featureScope, isTileAllowed),
    [featureScope, isTileAllowed],
  );

  const showUnassignedEmpty =
    featureScope === 'DXPBK-2123' && activeRole === 'unassigned';

  const requestPortalAccess = useCallback(() => {
    const subject = encodeURIComponent('Request: eCommerce Order Support Portal access');
    const body = encodeURIComponent(
      'Please assign appropriate support rep roles so I can use the eCommerce Order Support portal.',
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, []);

  const dismissTooltip = useCallback(() => setActiveTooltipId(null), []);

  useEffect(() => {
    if (!activeTooltipId) return undefined;
    const timer = window.setTimeout(() => setActiveTooltipId(null), 4000);
    return () => window.clearTimeout(timer);
  }, [activeTooltipId]);

  useEffect(() => {
    if (!activeTooltipId) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismissTooltip();
    };

    const onPointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (gridsRef.current?.contains(target)) return;
      dismissTooltip();
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [activeTooltipId, dismissTooltip]);

  return (
    <PortalShell hideSidebar contentClassName="bg-[#F4F5F7] text-[#252525]">
      <main className="max-w-7xl mx-auto px-6 py-8" id="main-content">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#212529]">eCommerce Order Support Portal</h1>
          <p className="mt-1 text-sm text-[#495057]">
          Select an option below to begin order triage or account support tasks.
          </p>
        </div>

        <div ref={gridsRef}>
          {showUnassignedEmpty ? (
           <div className="max-w-xl mx-auto text-center bg-white border border-[#CED4DA] rounded-[4px] p-8 shadow-sm my-6" role="status" aria-live="polite">
           {/* Stage 1: MVP (Clean icon without background circle) | Stage 2: Enhanced (Contained rounded chip) */}
           {releaseStage === 'stage1-mvp' ? (
             <div className="flex justify-center mb-4 text-[#6A7481]" aria-hidden="true">
               <Lock className="w-10 h-10" strokeWidth={1.5} />
             </div>
           ) : (
             <div 
               className="w-14 h-14 mx-auto rounded-[8px] bg-[#F0F4F8] flex items-center justify-center text-[#0063A3] mb-4"
               aria-hidden="true"
             >
               <Lock className="w-7 h-7" strokeWidth={1.5} />
             </div>
           )}
         
           <h2 className="text-lg font-semibold text-[#212529] mb-2">
             No portal access yet
           </h2>
         
           {/* max-w-md mx-auto prevents wide stretching across large viewports */}
           <p className="text-xs text-[#6A7481] leading-relaxed max-w-md mx-auto mb-6">
             Your Trimble ID does not have any active roles assigned for this support portal. Contact your manager or IT to request the correct entitlements, or use the button below to draft an access request email.
           </p>
         
           <div className="relative inline-block">
  <button 
    type="button"
    onClick={requestPortalAccess}
    onMouseEnter={() => setActiveTooltipId('request-access')}
    onMouseLeave={() => setActiveTooltipId(null)}
    onFocus={() => setActiveTooltipId('request-access')}
    onBlur={() => setActiveTooltipId(null)}
    aria-describedby={activeTooltipId === 'request-access' ? 'tooltip-request-access' : undefined}
    className="py-2 px-5 bg-[#0063A3] text-white text-xs font-semibold rounded hover:bg-[#004f82] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#0063A3] focus:outline-none"
  >
    Request portal access
  </button>

  {/* Modus Design System Tooltip */}
  {activeTooltipId === 'request-access' && (
    <div
      id="tooltip-request-access"
      role="tooltip"
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[#212529] text-white text-[11px] font-normal rounded shadow-md whitespace-nowrap z-50 pointer-events-none"
    >
      Drafts an access request email to your manager
      <div 
        className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#212529]" 
        aria-hidden="true"
      />
    </div>
  )}
</div>
         </div>
          ) : null}

          {!showUnassignedEmpty && visibleTiles.length === 0 && featureScope === 'DXPBK-2123' ? (
            <p className="rounded border border-[#CED4DA] bg-white px-4 py-6 text-center text-sm text-[#6A7481]">
              No operational modules are available for the selected support rep role.
            </p>
          ) : null}

          {/* Stage 1: MVP — 5-column fluid grid + original card chrome */}
          {isStage1(releaseStage) && !showUnassignedEmpty && visibleTiles.length > 0 ? (
            <ul className="grid grid-cols-1 list-none gap-4 overflow-visible p-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {visibleTiles.map((tile) => {
                const Icon = tile.icon;
                const tooltipId = `home-tooltip-${tile.id}`;
                const isTooltipOpen = activeTooltipId === tile.id;

                const handlePrimaryClick = (event: MouseEvent<HTMLButtonElement>) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (activeTooltipId === tile.id) {
                    navigate(tile.route);
                    setActiveTooltipId(null);
                  } else {
                    setActiveTooltipId(tile.id);
                  }
                };

                return (
                  <li
                    key={tile.id}
                    className={`relative min-w-0 overflow-visible ${isTooltipOpen ? 'z-[80]' : 'z-0'}`}
                  >
                    <article className="flex h-full min-h-[200px] flex-col items-center justify-between overflow-visible rounded border border-[#E0E0E0] bg-white p-6 text-center shadow-[0_2px_4px_rgba(0,0,0,0.06)] transition-opacity transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
                      <div className="mt-2 flex flex-col items-center">
                        <Icon
                          className="mb-4 h-8 w-8 text-[#252525]"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                        <h3
                          id={`${tile.id}-title`}
                          className="max-w-[11rem] text-sm font-bold leading-tight text-[#252525]"
                        >
                          {tile.title}
                        </h3>
                      </div>

                      <div className="relative mt-6 w-full overflow-visible">
                        <div className="relative inline-block w-full">
                          {isTooltipOpen ? (
                            <div
                              id={tooltipId}
                              role="tooltip"
                              aria-live="polite"
                              className="pointer-events-none absolute bottom-full left-1/2 z-[100] mb-2.5 w-max max-w-[min(100vw-2rem,20rem)] -translate-x-1/2 rounded border border-[#3B424C] bg-[#1E2227] px-3 py-1.5 text-center text-xs font-medium whitespace-normal text-white shadow-xl"
                            >
                              {homeTileTooltipMessage(tile.title)}
                              <div
                                aria-hidden
                                className="absolute top-full left-1/2 mt-[-1px] h-0 w-0 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-[#1E2227]"
                              />
                              <div
                                aria-hidden
                                className="absolute top-full left-1/2 mt-[-2px] -z-10 h-0 w-0 -translate-x-1/2 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#3B424C]"
                              />
                            </div>
                          ) : null}
                          <button
                            type="button"
                            aria-describedby={isTooltipOpen ? tooltipId : undefined}
                            aria-expanded={isTooltipOpen}
                            onClick={handlePrimaryClick}
                            className="w-full rounded bg-[#0063A3] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#004f82] focus:outline-none focus:ring-2 focus:ring-[#0063A3] focus:ring-offset-1"
                          >
                            {tile.buttonLabel}
                          </button>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {/* Stage 2 & Stage 3 — 3-column content-rich cards */}
          {isStage2Or3(releaseStage) && !showUnassignedEmpty && visibleTiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {visibleTiles.map((tile) => {
                const Icon = tile.icon;
                const iconClassName = 'h-6 w-6 text-[#0063A3]';

                const tooltipId = `home-tooltip-${tile.id}`;
                const isTooltipOpen = activeTooltipId === tile.id;

                const goOrToggle = () => {
                  if (activeTooltipId === tile.id) {
                    navigate(tile.route);
                    setActiveTooltipId(null);
                  } else {
                    setActiveTooltipId(tile.id);
                  }
                };

                return (
                  <div
                    key={tile.id}
                    role="button"
                    tabIndex={0}
                    aria-describedby={isTooltipOpen ? tooltipId : undefined}
                    aria-expanded={isTooltipOpen}
                    onClick={(e) => {
                      e.stopPropagation();
                      goOrToggle();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        goOrToggle();
                      }
                    }}
                    className={`group flex w-full cursor-pointer flex-col justify-between rounded-[4px] border border-[#CED4DA] bg-white p-5 shadow-sm transition-all hover:border-[#0063A3] hover:shadow-md ${isTooltipOpen ? 'relative z-[80]' : ''}`}
                  >
                    <div>
 <div className="flex items-start gap-3.5">
  {/* Enclosed icon container */}
  <div 
    aria-hidden="true" 
    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-[#F0F4F8] transition-colors group-hover:bg-[#E1EDF7]"
  >
    <Icon className={iconClassName} aria-hidden="true" />
  </div>

  {/* Nested text column: groups title and description with tight, natural spacing */}
  <div className="min-w-0 flex-1 pt-0.5">
    <h3 className="text-base font-semibold leading-snug text-[#212529] transition-colors group-hover:text-[#0063A3]">
      {tile.title}
    </h3>
    <p className="mt-1 text-xs font-normal leading-relaxed text-[#495057]">
      {tile.description}
    </p>
  </div>
</div>
                    </div>

                    <div className="relative ml-9 mt-4 border-t border-gray-100 pt-3">
                      {isTooltipOpen ? (
                        <div
                          id={tooltipId}
                          role="tooltip"
                          aria-live="polite"
                          className="pointer-events-none absolute bottom-full left-0 z-[100] mb-2 max-w-[min(100%,18rem)] rounded border border-[#3B424C] bg-[#1E2227] px-3 py-1.5 text-xs font-medium text-white shadow-xl"
                        >
                          {homeTileTooltipMessage(tile.title)}
                          <div
                            aria-hidden
                            className="absolute top-full left-6 mt-[-1px] h-0 w-0 border-x-4 border-x-transparent border-t-4 border-t-[#1E2227]"
                          />
                        </div>
                      ) : null}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs font-semibold text-[#0063A3] group-hover:underline">
                          {tile.buttonLabel}
                          <svg
                            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </main>
    </PortalShell>
  );
};
