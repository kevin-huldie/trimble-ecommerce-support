import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Ban,
  BarChart3,
  CreditCard,
  FileText,
  Lock,
  Mail,
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

export interface PortalTile {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
  buttonLabel: string;
  isFutureRelease?: boolean;
}

export const ALL_PORTAL_TILES: PortalTile[] = [
  // ==========================================================================
  // 8 Active Operational Triage Modules
  // ==========================================================================
  {
    id: 'failed-orders',
    title: 'Reprocessing failed orders',
    description: 'Diagnose gateway timeouts, address verification flags, and reprocess stuck orders through fulfillment.',
    route: '/failed-orders',
    icon: RefreshCw,
    buttonLabel: 'Retry orders',
    isFutureRelease: false,
  },
  {
    id: 'cancel-orders',
    title: 'Cancel orders',
    description: 'Execute pre-fulfillment stops, trigger inventory restock webhooks, and issue cancellation notices.',
    route: '/cancel-orders',
    icon: Ban,
    buttonLabel: 'Cancel order',
    isFutureRelease: false,
  },
  {
    id: 'order-details',
    title: 'Order details',
    description: 'Inspect itemized lines, software license tiers, TID entitlements, and multi-carrier tracking timelines.',
    route: '/order-details',
    icon: FileText,
    buttonLabel: 'View details',
    isFutureRelease: false,
  },
  {
    id: 'refund-orders',
    title: 'Refund orders',
    description: 'Authorize full or partial payment reversals to original payment methods or generate store credits.',
    route: '/refund-orders',
    icon: CreditCard,
    buttonLabel: 'Issue refund',
    isFutureRelease: false,
  },
  {
    id: 'release-holds',
    title: 'Releasing holds',
    description: 'Clear operational, inventory allocation, and manual customer service reviews to resume order fulfillment.',
    route: '/release-holds',
    icon: PauseCircle,
    buttonLabel: 'Release holds',
    isFutureRelease: false,
  },
  {
    id: 'tax-exemption-holds',
    title: 'Releasing tax exempted holds',
    description: 'Verify state resale certificates, B2B VAT/GST IDs, and Canadian provincial tax exemptions (QST/PST).',
    route: '/tax-exemption-holds',
    icon: ShieldCheck,
    buttonLabel: 'Verify tax',
    isFutureRelease: false,
  },
  {
    id: 'reports',
    title: 'Reports',
    description: 'Export post-purchase audit logs, daily cancellation tallies, and financial reconciliation batches.',
    route: '/reports',
    icon: BarChart3,
    buttonLabel: 'Generate report',
    isFutureRelease: false,
  },
  {
    id: 'process-returns',
    title: 'Returns',
    description: 'Manage RMA lifecycles, warehouse receiving inspections, exchange dispatches, and restocking policies.',
    route: '/returns',
    icon: RotateCcw,
    buttonLabel: 'Process return',
    isFutureRelease: false,
  },

  // ==========================================================================
  // 6 Planned Roadmap Modules (Stage 2/3 Preview - Intercepted)
  // ==========================================================================
  {
    id: 'product-upload',
    title: 'Product upload',
    description: 'Bulk catalog ingestion, SKU attribute mapping, and Trimble price book synchronization.',
    route: '/product-upload',
    icon: UploadCloud,
    buttonLabel: 'Upload catalog',
    isFutureRelease: true,
  },
  {
    id: 'promo-code-upload',
    title: 'Promo code upload',
    description: 'Ingest campaign coupon tables, discount eligibility rules, and regional promotional overrides.',
    route: '/promo-code-upload',
    icon: Tag,
    buttonLabel: 'Manage promos',
    isFutureRelease: true,
  },
  {
    id: 'process-chargeback',
    title: 'Process chargeback',
    description: 'Assemble representment evidence packs, dispute friendly fraud, and track bank arbitration status.',
    route: '/chargebacks',
    icon: AlertTriangle,
    buttonLabel: 'Review dispute',
    isFutureRelease: true,
  },
  {
    id: 'email-activity-logs',
    title: 'Email activity logs',
    description: 'Inspect message gateway event streams, deliverability telemetry, and customer notification histories.',
    route: '/email-activity-logs',
    icon: Mail,
    buttonLabel: 'Search logs',
    isFutureRelease: true,
  },
  {
    id: 'role-management',
    title: 'Role management',
    description: 'Provision support personas, adjust operational scopes, and enforce principle of least privilege.',
    route: '/role-management',
    icon: Users,
    buttonLabel: 'Manage roles',
    isFutureRelease: true,
  },
  {
    id: 'trial-frequency-cap',
    title: 'Trial frequency cap',
    description: 'Configure software evaluation throttle thresholds and prevent serial trial license abuse.',
    route: '/trial-frequency-cap',
    icon: Lock,
    buttonLabel: 'Manage caps',
    isFutureRelease: true,
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { allowedTiles, releaseStage } = useSandbox();

  // Evaluated inline safely without hoisting dependencies; includes Stage 1 MVP roadmap modules
  const showPlannedBadges = 
    releaseStage === 'stage1-mvp' || 
    releaseStage === 'stage2-enhanced' || 
    releaseStage === 'stage3-northstar';

  // State hook managing click-to-open and click-to-close inline card tooltips
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  // Strict sorting: 8 Active triage modules lead, 6 Planned roadmap modules anchor at the end
  const visibleCards = useMemo(() => {
    const cards = ALL_PORTAL_TILES.filter((tile) => allowedTiles.includes(tile.id));

    return cards.sort((a, b) => {
      const aPlanned = Boolean(a.isFutureRelease);
      const bPlanned = Boolean(b.isFutureRelease);
      if (!aPlanned && bPlanned) return -1;
      if (aPlanned && !bPlanned) return 1;
      return 0;
    });
  }, [allowedTiles]);

  const handleCardClick = (tile: PortalTile) => {
    if (tile.isFutureRelease) {
      alert(`The "${tile.title}" capability is currently scheduled for future release (${releaseStage}).`);
      return;
    }
    navigate(tile.route);
  };

  return (
    <PortalShell>
      <main
        id="main-content"
        className="min-h-screen bg-[#F4F6F8] px-4 py-8 sm:px-6 lg:px-8"
        onClick={() => setActiveTooltipId(null)}
      >
        <div className="mx-auto max-w-7xl">
         {/* Dynamic Page Header: Borderless in Stage 1, Divided in Stage 2 */}
         <header
            className={
              releaseStage === 'stage1-mvp'
                ? 'mb-6'
                : 'mb-6 border-b border-[#D8DCDE] pb-4'
            }
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#252A2E]">
                  eCommerce Order Support Portal
                </h1>
                <p className="mt-1 text-xs text-[#5C6670]">
                  Select an operational module below to begin order triage, exception review, or customer account support.
                </p>
              </div>
              <span className="rounded bg-[#E5EDF2] px-2.5 py-1 text-xs font-semibold text-[#0063A3]">
                {releaseStage === 'stage1-mvp' ? 'Stage 1: 5-Column Tiles' : 'Stage 2: 3-Column Cards'}
              </span>
            </div>
          </header>

          {/* Dynamic Grid: Stage 1 (Strict 5-Cols) vs. Stage 2 (Strict 3-Cols) */}
          <section
            aria-label="Support Operational Modules"
            className={
              releaseStage === 'stage1-mvp'
                ? 'grid grid-cols-5 gap-4'
                : 'grid grid-cols-3 gap-6'
            }
          >
            {visibleCards.map((tile) => {
            const Icon = tile.icon;
            const isStage1 = releaseStage === 'stage1-mvp';

            return isStage1 ? (
              /* ==========================================================
                 STAGE 1 (MVP): Centered Modus Operational Tile (Figma Spec)
                 - Strict 194px height
                 - 36px icon within 42px bounding frame
                 - 16px bold title
                 - Bottom-pinned single-line primary blue CTA
                 - Absolute top-right PLANNED roadmap badge
                 ========================================================== */
              <article
                key={tile.id}
                className="relative flex h-[194px] w-full flex-col items-center justify-between rounded border border-[#D8DCDE] bg-white px-3 pb-4 pt-6 shadow-sm transition hover:border-[#0063A3] hover:shadow"
              >
                {/* Planned Roadmap Tag (Stage 2 token parity, non-disruptive overlay) */}
                {tile.isFutureRelease && showPlannedBadges && (
                  <span className="absolute right-2.5 top-2.5 rounded bg-[#F1F3F5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#495057]">
                    PLANNED
                  </span>
                )}

                {/* 1. Elevated Content Zone: Centered 36px Glyph & 16px Title */}
                <div className="flex w-full flex-col items-center text-center">
                  <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center text-[#252A2E]">
                    {Icon && <Icon className="h-9 w-9 stroke-[1.5]" aria-hidden="true" />}
                  </div>
                  <h2 className="mt-2 line-clamp-2 px-1 text-center text-base font-bold leading-tight text-[#252A2E]">
                    {tile.title}
                  </h2>
                </div>

                {/* 2. Pinned Bottom Zone: Primary Label-Hugging Action Button */}
                <div className="mt-auto flex w-full justify-center">
                  <button
                    type="button"
                    onClick={() => handleCardClick(tile)}
                    aria-label={
                      tile.isFutureRelease
                        ? `${tile.buttonLabel || 'Open'} (Planned module: ${tile.title})`
                        : `${tile.buttonLabel || 'Open'} ${tile.title}`
                    }
                    className="inline-flex w-auto items-center justify-center whitespace-nowrap rounded bg-[#0063A3] px-5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#004F82] focus:outline-none focus:ring-2 focus:ring-[#0063A3] focus:ring-offset-2"
                  >
                    {tile.buttonLabel || 'Open'}
                  </button>
                </div>
              </article>
            ) : (
            /* ==========================================================
               STAGE 2 (ENHANCED): Option 2 Stack (Semibold Title)
               - Top-left icon with #EBF4FA background fill
               - 16px Semibold title for balanced visual hierarchy
               - Short description retained
               - Left-aligned Modus text link with directional arrow
               ========================================================== */
            <article
              key={tile.id}
              className="flex w-full flex-col justify-between rounded-lg border border-[#D8DCDE] bg-white p-5 shadow-sm transition hover:border-[#0063A3] hover:shadow-md"
            >
              {/* 1. Header & Operational Description */}
              <div className="text-left">
                <div className="flex items-center justify-between">
                  {/* Retained Icon Frame with Soft Blue Fill */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EBF4FA] text-[#0063A3]">
                    {Icon && <Icon className="h-6 w-6 stroke-[1.75]" aria-hidden="true" />}
                  </div>

                  {/* Planned Roadmap Tag */}
                  {tile.isFutureRelease && showPlannedBadges && (
                    <span className="rounded bg-[#F1F3F5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#495057]">
                      PLANNED
                    </span>
                  )}
                </div>

                {/* Refined Semibold Operational Title */}
                <h2 className="mt-4 text-base font-semibold text-[#252A2E]">
                  {tile.title}
                </h2>

                {/* Retained Short Description */}
                <p className="mt-2 text-xs leading-relaxed text-[#5C6670]">
                  {tile.description}
                </p>
              </div>

              {/* 2. Action Area: Left-Aligned Modus Text Link */}
              <div className="mt-6 border-t border-[#EFEFEF] pt-3 text-left">
                <button
                  type="button"
                  onClick={() => handleCardClick(tile)}
                  aria-label={
                    tile.isFutureRelease
                      ? `${tile.buttonLabel || 'Open'} ${tile.title} (Planned feature)`
                      : `${tile.buttonLabel || 'Open'} ${tile.title}`
                  }
                  className="group inline-flex items-center gap-1.5 rounded text-xs font-semibold text-[#0063A3] transition hover:text-[#004F82] focus:outline-none focus:ring-2 focus:ring-[#0063A3] focus:ring-offset-2"
                >
                  <span>{tile.buttonLabel || 'Open triage workflow'}</span>
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-150 group-hover:translate-x-1"
                  >
                    &rarr;
                  </span>
                </button>
              </div>
            </article>
          );
          })}
          </section>
        </div>
      </main>
    </PortalShell>
  );
};