import React, { useMemo } from 'react';
import { useSandbox } from '../context/SandboxContext';

export interface PortalTile {
  id: string;
  title: string;
  description: string;
  route: string;
  category?: 'triage' | 'operations' | 'admin';
  isFutureRelease?: boolean;
}

const MODULE_TO_TILE_ID: Record<string, string> = {
  'Cancel Orders': 'cancel-orders',
  'Email Activity Logs': 'email-activity-logs',
  'Order Details': 'order-details',
  'Process Chargeback': 'process-chargeback',
  'Product Upload': 'product-upload',
  'Promo Code Upload': 'promo-code-upload',
  'Refund Orders': 'refund-orders',
  'Reports': 'reports',
  'Returns': 'returns',
  'Releasing Holds': 'releasing-holds',
  'Releasing Tax Exempted Holds': 'tax-exemption-holds',
  'Reprocessing Failed Orders': 'reprocessing-failed-orders',
  'Role Management': 'role-management',
  'Trial Frequency Cap': 'trial-frequency-cap',
};

// =========================================================================
// 1. ROLE-SPECIFIC HERO COPY
// =========================================================================
const ROLE_HERO_COPY: Record<string, { title: string; subtitle: string }> = {
  'Customer Support': {
    title: 'eCommerce Support Portal',
    subtitle:
      'Centralized post-purchase issue resolution, customer return processing, and real-time order triage workspace.',
  },
  'E-Payments Team': {
    title: 'eCommerce Support Portal',
    subtitle:
      'Centralized payment dispute representment, forensic chargeback review, and financial reporting workspace.',
  },
  'Administrator': {
    title: 'eCommerce Support Portal',
    subtitle:
      'Centralized post-purchase operations, catalog governance, and system-wide compliance workspace.',
  },
};

// =========================================================================
// 2. DEFENSIVE HERO COPY FALLBACK
// =========================================================================
const DEFAULT_HERO_COPY = {
  title: 'eCommerce Support Portal',
  subtitle:
    'Centralized post-purchase issue resolution, order triage, and compliance review workspace.',
};

// =========================================================================
// 3. STAGE 2: ROLE BADGE LABELS (PASTE HERE)
// =========================================================================
export const ROLE_BADGE_LABELS: Record<string, string> = {
  'Customer Support': 'Support Rep',
  'E-Payments Team': 'E-Payments',
  'Administrator': 'Full Admin',
};

export const ALL_PORTAL_TILES: PortalTile[] = [
  // =========================================================================
  // ACTIVE OPERATIONAL TRIAGE MODULES (9 Active)
  // =========================================================================
  {
    id: 'cancel-orders',
    title: 'Cancel Orders',
    description: 'Cancel orders and terminate pending or active billing and access.',
    route: '/cancel-orders',
    category: 'triage',
    isFutureRelease: false,
  },
  {
    id: 'order-details',
    title: 'Order Details',
    description: 'View full transaction records, itemized order details, and account history.',
    route: '/order-details',
    category: 'triage',
    isFutureRelease: false,
  },
  {
    id: 'returns',
    title: 'Returns',
    description: 'Process product and subscription returns to deactivate access and adjust billing.',
    route: '/returns',
    category: 'triage',
    isFutureRelease: false,
  },
  {
    id: 'refund-orders',
    title: 'Refund Orders',
    description: 'Issue full or partial payment refunds and credits to customer accounts.',
    route: '/refund-orders',
    category: 'triage',
    isFutureRelease: false,
  },
  {
    id: 'releasing-holds',
    title: 'Releasing Holds',
    description: 'Review and release administrative, security, or compliance holds on orders.',
    route: '/releasing-holds',
    category: 'operations', // Mapped from compliance -> operations
    isFutureRelease: false,
  },
  {
    id: 'releasing-tax-exempted-holds',
    title: 'Releasing Tax Exempted Holds',
    description: 'Review tax exemption documentation and release orders held for tax review.',
    route: '/tax-exemption-holds',
    category: 'operations', // Mapped from compliance -> operations
    isFutureRelease: false,
  },
  {
    id: 'reprocessing-failed-orders',
    title: 'Reprocessing Failed Orders',
    description: 'Retry failed payments, resolve processing errors, and complete pending orders.',
    route: '/failed-orders',
    category: 'operations',
    isFutureRelease: false,
  },
  {
    id: 'reports',
    title: 'Reports',
    description: 'View and export order metrics, support activity, and resolution summaries.',
    route: '/reports',
    category: 'admin', // Mapped from analytics -> admin
    isFutureRelease: false,
  },
  {
    id: 'role-management',
    title: 'Role Management',
    description: 'Configure user permissions, approval limits, and team access levels.',
    route: '/role-management',
    category: 'admin', // Mapped from governance -> admin
    isFutureRelease: false,
  },

  // =========================================================================
  // ROADMAP MODULES (5 Planned)
  // =========================================================================
  {
    id: 'process-chargeback',
    title: 'Process Chargeback',
    description: 'Review payment disputes, submit documentation, and track claim outcomes.',
    route: '/chargebacks',
    category: 'operations', // Mapped from finance -> operations
    isFutureRelease: true,
  },
  {
    id: 'email-activity-logs',
    title: 'Email Activity Logs',
    description: 'Audit notification history, dispatch statuses, and customer communications.',
    route: '/email-activity-logs',
    category: 'admin', // Mapped from audit -> admin
    isFutureRelease: true,
  },
  {
    id: 'trial-frequency-cap',
    title: 'Trial Frequency Cap',
    description: 'Monitor trial usage limits, reset caps, and manage evaluation access.',
    route: '/trial-frequency-cap',
    category: 'operations', // Mapped from licensing -> operations
    isFutureRelease: true,
  },
  {
    id: 'product-upload',
    title: 'Product Upload',
    description: 'Upload, update, and manage product catalog data and pricing configurations.',
    route: '/product-upload',
    category: 'operations', // Mapped from catalog -> operations
    isFutureRelease: true,
  },
  {
    id: 'promo-code-upload',
    title: 'Promo Code Upload',
    description: 'Create, upload, and manage promotional codes and discount rules.',
    route: '/promo-code-upload',
    category: 'operations', // Mapped from marketing -> operations
    isFutureRelease: true,
  },
];

/*
  // --------------------------------------------------------------------------
  // ARCHIVED PROTOTYPE ARTIFACT: FALLBACK_MODULES
  // --------------------------------------------------------------------------
  // Legacy 9-module fallback list used prior to DXPBK-2123 14-module catalog integration.
  // Retained temporarily for historical reference; active rendering is now governed
  // exclusively by ALL_PORTAL_TILES and releaseStage.
  
  const FALLBACK_MODULES = [
    'Order Details',
    'Returns',
    'Releasing Holds',
    'Releasing Tax Exempted Holds',
    'Cancel Orders',
    'Refund Orders',
    'Reports',
    'Email Activity Logs',
    'Trial Frequency Cap',
  ];
*/

interface PortalCardProps {
  tile: PortalTile;
  stage: string;
  activeTooltipId: string | null;
  onToggleTooltip: (id: string, e: React.MouseEvent) => void;
}

const BUTTON_LABELS: Record<string, string> = {
  'Cancel Orders': 'Cancel order',
  'Order Details': 'View details',
  'Returns': 'Process return',
  'Refund Orders': 'Issue refund',
  'Releasing Holds': 'Release hold',
  'Releasing Tax Exempted Holds': 'Verify tax',
  'Reprocessing Failed Orders': 'Reprocess order',
  'Reports': 'View reports',
  'Role Management': 'Manage roles',
  'Process Chargeback': 'Review chargeback',
  'Email Activity Logs': 'View email logs',
  'Trial Frequency Cap': 'Check trial cap',
  'Product Upload': 'Upload catalog',
  'Promo Code Upload': 'Upload promos',
};

const LINK_LABELS: Record<string, string> = {
  'Cancel Orders': 'Cancel order →',
  'Order Details': 'View order details →',
  'Returns': 'Process return →',
  'Refund Orders': 'Issue refund →',
  'Releasing Holds': 'Review holds →',
  'Releasing Tax Exempted Holds': 'Review tax exemption →',
  'Reprocessing Failed Orders': 'Reprocess order →',
  'Reports': 'View reports →',
  'Role Management': 'Manage roles →',
  'Process Chargeback': 'Review chargebacks →',
  'Email Activity Logs': 'View email logs →',
  'Trial Frequency Cap': 'Manage trial caps →',
  'Product Upload': 'Manage products →',
  'Promo Code Upload': 'Manage promo codes →',
};

// ----------------------------------------------------------------------------
// MODUS 2PX VECTOR OUTLINE ICON DICTIONARY (Zero-dependency SVG)
// ----------------------------------------------------------------------------
export const MODULE_OUTLINE_ICONS: Record<string, React.ReactNode> = {
  // Cancel Orders: Prohibited / Cancelled Slash Circle
  'Cancel Orders': (
    <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="m4.93 4.93 14.14 14.14" />
    </svg>
  ),

  // Order Details: Magnifying Glass Inspector (Matches Screenshot)
  'Order Details': (
    <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),

  // Returns: Reverse Logistics Loop / Undo Arrow
  'Returns': (
    <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10h10a5 5 0 0 1 5 5v2" />
      <path d="m7 6-4 4 4 4" />
    </svg>
  ),

  // Refund Orders: Currency Coin Reversal / Reimbursement
  'Refund Orders': (
    <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9h-3.5a1.5 1.5 0 0 0 0 3h2a1.5 1.5 0 0 1 0 3H9" />
      <path d="M12 7v1.5m0 7V17" />
    </svg>
  ),

  // Releasing Holds: Unlocked Padlock Security Clearance
  'Releasing Holds': (
    <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8-1.5" />
    </svg>
  ),

  // Releasing Tax Exempted Holds: Tax Tag with Percentage Disc
  'Releasing Tax Exempted Holds': (
    <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.5 2H6a2 2 0 0 0-2 2v6.5a2 2 0 0 0 .58 1.42l8.5 8.5a2 2 0 0 0 2.83 0l5.17-5.17a2 2 0 0 0 0-2.83l-8.5-8.5A2 2 0 0 0 12.5 2Z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
    </svg>
  ),

  // Reprocessing Failed Orders: Lightning Bolt Circuit Recovery
  'Reprocessing Failed Orders': (
    <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m13 2-8 12h6l-1 8 8-12h-6l1-8Z" />
    </svg>
  ),

  // Reports: Analytics Bar Graph & Trending
  'Reports': (
    <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20h18" />
      <path d="M7 16v-4" />
      <path d="M12 16V8" />
      <path d="M17 16V4" />
    </svg>
  ),

  // Role Management: Multi-User Identity Governance
  'Role Management': (
    <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),

  // Process Chargeback: Legal Arbitration Gavel
  'Process Chargeback': (
    <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m14 13-7.5 7.5a2.12 2.12 0 1 1-3-3L11 10" />
      <path d="m16 16 6-6" />
      <path d="m8 8 6-6" />
      <path d="m9 7 8 8" />
      <path d="m21 11-8-8" />
    </svg>
  ),

  // Email Activity Logs: Dispatch Mail Envelope with Activity Lines
  'Email Activity Logs': (
    <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),

  // Trial Frequency Cap: Chronometer Stopwatch Threshold
  'Trial Frequency Cap': (
    <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5" />
      <path d="M10 2h4" />
      <path d="M12 2v3" />
    </svg>
  ),

  // Product Upload: Cloud Storage Upload Tray
  'Product Upload': (
    <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M12 12v9" />
      <path d="m16 16-4-4-4 4" />
    </svg>
  ),

  // Promo Code Upload: Ticket Voucher with Perforations
  'Promo Code Upload': (
    <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 11v2" />
      <path d="M13 17v2" />
    </svg>
  ),
};

const PortalCard: React.FC<PortalCardProps> = ({
  tile,
  stage,
  activeTooltipId,
  onToggleTooltip,
}) => {
  const isPlanned = !!tile.isFutureRelease;
  const isTooltipOpen = activeTooltipId === tile.id;
  const tooltipText = `Links to ${tile.title} page.`;

  const isStage2 = stage === 'stage2-enhanced';

  const outlineIcon = isStage2 ? (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EBF4FA] p-2">
      <img
        src={`/icons/${tile.id}.svg`}
        alt=""
        aria-hidden="true"
        className="h-5 w-5 object-contain [filter:brightness(0)_saturate(100%)_invert(24%)_sepia(96%)_saturate(1795%)_hue-rotate(187deg)_brightness(92%)_contrast(101%)]"
      />
    </div>
  ) : (
    <img
      src={`/icons/${tile.id}.svg`}
      alt=""
      aria-hidden="true"
      className="h-[42px] w-[42px] object-contain"
    />
  );

// ------------------------------------------------------------------------
  // STAGE 1: MVP (Full-Width Button Architecture: Maximum Fitts's Target)
  // ------------------------------------------------------------------------
  if (stage === 'stage1-mvp') {
    return (
      <article className="relative flex min-h-[204px] flex-col items-center justify-between rounded-lg border border-[#D0D7DE] bg-white p-6 text-center shadow-xs transition-all hover:border-[#0063A3] hover:shadow-md">
        {/* Outlined Planned Badge (Top Right) */}
        {isPlanned && (
          <span className="absolute top-2.5 right-2.5 rounded border border-[#6A7682] bg-transparent px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#46535F]">
            Planned
          </span>
        )}

        {/* Top-Aligned Outline Icon (Unboxed Modus 2px Vector) */}
        <div 
          aria-hidden="true" 
          className="flex h-8 w-8 items-center justify-center text-[#252A2E] select-none"
        >
          {outlineIcon}
        </div>

{/* Top-Aligned Title Container: Fixed h-11 Stabilizes 1-Line vs 2-Line Baseline */}
<div className="my-3 flex h-11 w-full items-start justify-center px-1">
          <h5 className="text-base font-bold leading-tight text-[#111315]">
            {tile.title}
          </h5>
        </div>

        {/* Full-Width Primary CTA with Top-Anchored Click Tooltip */}
        <div className="relative mt-auto w-full">
          {isTooltipOpen && (
            <div
              role="tooltip"
              className="absolute bottom-full left-1/2 mb-2 w-max max-w-[210px] -translate-x-1/2 rounded bg-[#0A1A2C] px-2.5 py-1.5 text-center text-xs font-medium text-white shadow-lg ring-1 ring-white/10 z-30"
            >
              {tooltipText}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0A1A2C]" />
            </div>
          )}

          <button
            type="button"
            onClick={(e) => onToggleTooltip(tile.id, e)}
            className="w-full rounded bg-[#0063A3] py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#004F82] focus:outline-none focus:ring-2 focus:ring-[#0063A3] focus:ring-offset-1"
          >
            {BUTTON_LABELS[tile.title] || 'Get started'}
          </button>
        </div>
      </article>
    );
  }

// ------------------------------------------------------------------------
  // STAGE 2: ENHANCED (Fixed Standard Padding + Isolated Header Bay)
  // ------------------------------------------------------------------------
  return (
    <article className="relative flex flex-col justify-between rounded-lg border border-[#D0D7DE] bg-white p-5 shadow-xs transition-all hover:border-[#0063A3] hover:shadow-md">
      {/* Main 2-Column Split */}
      <div className="flex items-start justify-between gap-3">
        {/* ===================================================================
            COLUMN 1: Content Hierarchy (Left Rail)
           =================================================================== */}
        <div className="flex-1 min-w-0">
          {/* Title Row: h-8 with items-end locks baseline with the 32px icon */}
          <div className="flex h-8 items-end">
            <h3 className="text-sm font-bold leading-tight text-[#111315]">
              {tile.title}
            </h3>
          </div>

          {/* SaaS Operational Description */}
          <p className="mt-1.5 text-xs leading-normal text-[#5C6670]">
            {tile.description}
          </p>

          {/* Bottom Action Link */}
          <div className="relative mt-3.5">
            {isTooltipOpen && (
              <div
                role="tooltip"
                className="absolute bottom-full left-0 mb-2 w-max max-w-[240px] rounded bg-[#0A1A2C] px-2.5 py-1.5 text-left text-xs font-medium text-white shadow-lg ring-1 ring-white/10 z-30"
              >
                {tooltipText}
                <div className="absolute top-full left-4 border-4 border-transparent border-t-[#0A1A2C]" />
              </div>
            )}

            <button
              type="button"
              onClick={(e) => onToggleTooltip(tile.id, e)}
              className="inline-flex items-center text-xs font-bold text-[#0063A3] transition hover:text-[#004F82] focus:outline-none focus:ring-2 focus:ring-[#0063A3] focus:ring-offset-2"
            >
              {LINK_LABELS[tile.title] || 'Open module →'}
            </button>
          </div>
        </div>

        {/* ===================================================================
            COLUMN 2: Metadata & Visual Anchor Bay (Icon + Badge)
           =================================================================== */}
        <div className="flex shrink-0 items-center gap-2">
          {isPlanned && (
            <span className="rounded border border-[#6A7682] bg-transparent px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#46535F] select-none">
              Planned
            </span>
          )}

          <div
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EBF4FA] text-[#0063A3] select-none"
          >
            <div className="flex h-[18px] w-[18px] items-center justify-center">
              {outlineIcon}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export const HomePage: React.FC = () => {
  const sandbox = useSandbox();

  // --------------------------------------------------------------------------
  // TOOLTIP INTERACTION STATE & HANDLERS (Placed right here)
  // --------------------------------------------------------------------------
  const [activeTooltipId, setActiveTooltipId] = React.useState<string | null>(null);

  const handleToggleTooltip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTooltipId((prev) => (prev === id ? null : id));
  };

  React.useEffect(() => {
    const handleOutsideClick = () => setActiveTooltipId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // --------------------------------------------------------------------------
  // ROLE & MODULE CONFIGURATION
  // --------------------------------------------------------------------------
  const currentRole = sandbox.currentRole || 'Customer Support';
  const releaseStage = sandbox.releaseStage || 'stage1-mvp';
  const visibleModuleNames = sandbox.visibleModuleNames ?? ALL_PORTAL_TILES.map((tile) => tile.title);

  // Resolve dynamic hero copy attuned to the active support persona
  const heroContent = ROLE_HERO_COPY[currentRole] ?? DEFAULT_HERO_COPY;

  const visibleCards = useMemo(() => {
    const allowedIdSet = new Set<string>(
      visibleModuleNames.map((name) => MODULE_TO_TILE_ID[name] || name.toLowerCase().replace(/\s+/g, '-'))
    );

    const cards = ALL_PORTAL_TILES.filter((tile) => {
      if (!tile) return false;
      return allowedIdSet.has(tile.id) || visibleModuleNames.includes(tile.title as any);
    });

    return cards.sort((a, b) => {
      const aPlanned = Boolean(a.isFutureRelease);
      const bPlanned = Boolean(b.isFutureRelease);
      if (!aPlanned && bPlanned) return -1;
      if (aPlanned && !bPlanned) return 1;
      return 0;
    });
  }, [visibleModuleNames]);

  return (
    <main id="main-content" className="min-h-screen bg-[#F4F6F8] px-4 py-8 font-sans text-[#16181A] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
     {/* Left-aligned operational cockpit header with bottom-right Stage 2 count chip */}
     <div className="mb-8 flex flex-col gap-4 text-left sm:flex-row sm:items-end sm:justify-between">
          <div className={releaseStage === 'stage2-enhanced' ? 'max-w-3xl' : 'w-full'}>
            <h1 
              id="portal-hero-title"
              className="text-2xl font-bold tracking-tight text-[#111315] sm:text-3xl"
            >
              {heroContent.title}
            </h1>
            <p 
  aria-live="polite" 
  aria-atomic="true"
  className="mt-1.5 w-full text-sm leading-normal text-[#252A2E]"
>
  {heroContent.subtitle}
</p>
          </div>

          {/* Stage 2: Enhanced Count Chip - Clean Role Scope */}
          {releaseStage === 'stage2-enhanced' && (
            <div className="shrink-0 self-start sm:self-end">
              <div
                role="status"
                aria-live="polite"
                aria-label={`${visibleCards.length} ${visibleCards.length === 1 ? 'module' : 'modules'} available for ${currentRole} role`}
                className="inline-flex items-center gap-2 rounded-full border border-[#D0D7DE] bg-[#F8FAFB] px-3.5 py-1 text-xs font-semibold text-[#252A2E] shadow-2xs select-none"
              >
                <span aria-hidden="true" className="flex h-2 w-2 rounded-full bg-[#0063A3]" />
                <span>
                  {visibleCards.length} {visibleCards.length === 1 ? 'module' : 'modules'}
                </span>
                <span aria-hidden="true" className="text-[#8C9BA5]">•</span>
                <span className="font-medium text-[#5C6670]">
                  {currentRole}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 14-Module Workspace Card Grid */}
        <section aria-label="Available operational support modules">
          <div
            className={
              releaseStage === 'stage1-mvp'
                ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
                : 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
            }
          >
            {visibleCards.map((tile) => (
              <PortalCard
                key={tile.id}
                tile={tile}
                stage={releaseStage}
                activeTooltipId={activeTooltipId}
                onToggleTooltip={handleToggleTooltip}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default HomePage;