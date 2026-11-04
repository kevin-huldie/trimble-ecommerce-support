import {
  Clock,
  CheckCircle2,
  List,
  RefreshCcw,
  RotateCcw,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import type { LogDeliveryStatus } from '../../data/mockLogs';
import {
  EVENT_CATEGORY_CONFIRMATIONS,
  EVENT_CATEGORY_FAILED_ORDERS,
  EVENT_CATEGORY_HOLDS_COMPLIANCE,
  formatQueueBadgeCount,
} from '../../data/mockLogs';

export type SidebarNavId =
  | 'all-logs'
  | 'resend-history'
  | 'holds-compliance'
  | 'failed-orders'
  | 'confirmations-statements'
  | 'queue-bounced'
  | 'queue-deferred';

const NAV_DEVELOPER_DESCRIPTIONS: Record<SidebarNavId, string> = {
  'all-logs':
    'Primary stream containing raw SendGrid webhook telemetry & OMS event logs.',
  'resend-history':
    'Audit trail of representative-initiated resends, replies, and forwards.',
  'holds-compliance':
    'Filtered queue for Tax Exemption holds and D-Country sanction reviews.',
  'failed-orders':
    'System exceptions mapping to payment failures, stock, or API glitches.',
  'confirmations-statements':
    'Filtered stream for transactional order confirmations and billing invoices.',
  'queue-bounced':
    'Delivery failures flagged by SendGrid webhooks (hard/soft bounce events).',
  'queue-deferred':
    'Temporary delivery delays flagged by receiving ISP or email server throttles.',
};

type SideNavigationProps = {
  activeNav: SidebarNavId;
  onNavChange: (nav: SidebarNavId) => void;
  bouncedCount: number;
  deferredCount: number;
};

function NavSectionTitle({ children }: { children: string }) {
  return (
    <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wider text-[#525866] first:mt-0">
      {children}
    </p>
  );
}

function SidebarItem({
  id,
  label,
  icon: Icon,
  active,
  onClick,
  badge,
  badgeTone,
  developerDescription,
}: {
  id: SidebarNavId;
  label: string;
  icon: typeof List;
  active: boolean;
  onClick: (id: SidebarNavId) => void;
  badge?: string;
  badgeTone?: 'danger' | 'warning';
  developerDescription: string;
}) {
  const descriptionId = `side-nav-desc-${id}`;

  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      aria-describedby={descriptionId}
      title={developerDescription}
      className={[
        'mb-0.5 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]',
        active
          ? 'bg-[#E5F1F8] font-semibold text-[#0063A3]'
          : 'font-normal text-[#121212] hover:bg-[#F1F1F6]',
      ].join(' ')}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge ? (
        <span
          className={[
            'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold text-white',
            badgeTone === 'danger' ? 'bg-[#DA212C]' : 'bg-[#E06D00]',
          ].join(' ')}
        >
          {badge}
        </span>
      ) : null}
      <span id={descriptionId} className="sr-only">
        {developerDescription}
      </span>
    </button>
  );
}

export function SideNavigation({
  activeNav,
  onNavChange,
  bouncedCount,
  deferredCount,
}: SideNavigationProps) {
  return (
    <nav aria-label="Email activity logs">
      <NavSectionTitle>Navigation</NavSectionTitle>
      <SidebarItem
        id="all-logs"
        label="All logs"
        icon={List}
        active={activeNav === 'all-logs'}
        onClick={onNavChange}
        developerDescription={NAV_DEVELOPER_DESCRIPTIONS['all-logs']}
      />
      <SidebarItem
        id="resend-history"
        label="Resend history"
        icon={RotateCcw}
        active={activeNav === 'resend-history'}
        onClick={onNavChange}
        developerDescription={NAV_DEVELOPER_DESCRIPTIONS['resend-history']}
      />

      <NavSectionTitle>Event categories</NavSectionTitle>
      <SidebarItem
        id="holds-compliance"
        label="Holds & Compliance"
        icon={ShieldAlert}
        active={activeNav === 'holds-compliance'}
        onClick={onNavChange}
        developerDescription={NAV_DEVELOPER_DESCRIPTIONS['holds-compliance']}
      />
      <SidebarItem
        id="failed-orders"
        label="Failed orders"
        icon={RefreshCcw}
        active={activeNav === 'failed-orders'}
        onClick={onNavChange}
        developerDescription={NAV_DEVELOPER_DESCRIPTIONS['failed-orders']}
      />
      <SidebarItem
        id="confirmations-statements"
        label="Confirmations & Statements"
        icon={CheckCircle2}
        active={activeNav === 'confirmations-statements'}
        onClick={onNavChange}
        developerDescription={NAV_DEVELOPER_DESCRIPTIONS['confirmations-statements']}
      />

      <NavSectionTitle>Delivery queues</NavSectionTitle>
      <SidebarItem
        id="queue-bounced"
        label="Bounced"
        icon={XCircle}
        active={activeNav === 'queue-bounced'}
        onClick={onNavChange}
        badge={formatQueueBadgeCount(bouncedCount)}
        badgeTone="danger"
        developerDescription={NAV_DEVELOPER_DESCRIPTIONS['queue-bounced']}
      />
      <SidebarItem
        id="queue-deferred"
        label="Deferred"
        icon={Clock}
        active={activeNav === 'queue-deferred'}
        onClick={onNavChange}
        badge={formatQueueBadgeCount(deferredCount)}
        badgeTone="warning"
        developerDescription={NAV_DEVELOPER_DESCRIPTIONS['queue-deferred']}
      />
    </nav>
  );
}

export function sidebarNavToFilters(
  nav: SidebarNavId,
): Partial<{
  eventCategory: string;
  deliveryStatus: LogDeliveryStatus | '';
}> {
  switch (nav) {
    case 'holds-compliance':
      return { eventCategory: EVENT_CATEGORY_HOLDS_COMPLIANCE, deliveryStatus: '' };
    case 'failed-orders':
      return { eventCategory: EVENT_CATEGORY_FAILED_ORDERS, deliveryStatus: '' };
    case 'confirmations-statements':
      return { eventCategory: EVENT_CATEGORY_CONFIRMATIONS, deliveryStatus: '' };
    case 'queue-bounced':
      return { eventCategory: '', deliveryStatus: 'Bounced' };
    case 'queue-deferred':
      return { eventCategory: '', deliveryStatus: 'Deferred' };
    case 'resend-history':
    case 'all-logs':
    default:
      return { eventCategory: '', deliveryStatus: '' };
  }
}
