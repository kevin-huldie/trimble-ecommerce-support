import type { EmailLog } from '../components/workspace/LogsTable';

export type LogDeliveryStatus =
  | 'Delivered'
  | 'Bounced'
  | 'Deferred'
  | 'Pending'
  | 'Held';

export type LogPersona =
  | 'Account Owner'
  | 'Authorized User'
  | 'Buyer'
  | 'Tax-Exempt Org'
  | 'D-Country Org';

export type ActivityLogKind = 'standard' | 'resend_audit';

export interface ActivityLogRecord {
  id: string;
  /** Figma-style display ID, e.g. 00000000000-0000 */
  displayOrderId: string;
  /** Order ID shown in logs table and document title. */
  orderId: string;
  orderNumber: string;
  logKind: ActivityLogKind;
  deliveryStatus: LogDeliveryStatus;
  sender: string;
  subject: string;
  sendGridTemplateId: string;
  targetPersona: LogPersona;
  triggerCategory: string;
  triggeringEvent: string;
  recipientFirstName: string;
  recipientLastName: string;
  recipientEmail: string;
  sentAt: string;
  /** SMTP / MTA diagnostic line for native hover on status badge. */
  smtpDiagnostic: string;
  htmlBodySnapshot: string;
}

export type ActivityLogFilters = {
  searchQuery: string;
  recipientEmail: string;
  customerName: string;
  orderId: string;
  triggeringEvent: string;
  deliveryStatus: LogDeliveryStatus | '';
  eventCategory: string;
  dateFrom: string;
  dateTo: string;
  resendHistoryOnly: boolean;
};

export const DEFAULT_ACTIVITY_LOG_FILTERS: ActivityLogFilters = {
  searchQuery: '',
  recipientEmail: '',
  customerName: '',
  orderId: '',
  triggeringEvent: '',
  deliveryStatus: '',
  eventCategory: '',
  dateFrom: '',
  dateTo: '',
  resendHistoryOnly: false,
};

export type AdvancedFilterFields = Pick<
  ActivityLogFilters,
  | 'recipientEmail'
  | 'customerName'
  | 'orderId'
  | 'triggeringEvent'
  | 'deliveryStatus'
  | 'dateFrom'
  | 'dateTo'
>;

export const DEFAULT_ADVANCED_FILTER_FIELDS: AdvancedFilterFields = {
  recipientEmail: '',
  customerName: '',
  orderId: '',
  triggeringEvent: '',
  deliveryStatus: '',
  dateFrom: '',
  dateTo: '',
};

export function formatQueueBadgeCount(count: number): string {
  if (count >= 1000) return '999+';
  return `${String(count).padStart(3, '0')}+`;
}

export function countLogsByDeliveryStatus(
  logs: ActivityLogRecord[],
  status: LogDeliveryStatus,
): number {
  return logs.filter((log) => log.deliveryStatus === status).length;
}

/** Sidebar + filter groupings for activity log event types. */
export const EVENT_CATEGORY_HOLDS_COMPLIANCE = 'Holds & Compliance';
export const EVENT_CATEGORY_FAILED_ORDERS = 'Failed Orders';
export const EVENT_CATEGORY_CONFIRMATIONS = 'Confirmations & Statements';

const EVENT_SCENARIOS: Array<{
  triggerCategory: string;
  triggeringEvent: string;
  subjectPrefix: string;
  targetPersona: LogPersona;
  deliveryStatus: LogDeliveryStatus;
}> = [
  {
    triggerCategory: EVENT_CATEGORY_CONFIRMATIONS,
    triggeringEvent: 'Order confirmation sent',
    subjectPrefix: 'Order Confirmation',
    targetPersona: 'Buyer',
    deliveryStatus: 'Delivered',
  },
  {
    triggerCategory: EVENT_CATEGORY_CONFIRMATIONS,
    triggeringEvent: 'License provisioning key dispatched',
    subjectPrefix: 'License Provisioning',
    targetPersona: 'Authorized User',
    deliveryStatus: 'Delivered',
  },
  {
    triggerCategory: EVENT_CATEGORY_HOLDS_COMPLIANCE,
    triggeringEvent: 'Tax exemption certificate hold placed',
    subjectPrefix: 'Tax Exemption Hold',
    targetPersona: 'Tax-Exempt Org',
    deliveryStatus: 'Pending',
  },
  {
    triggerCategory: EVENT_CATEGORY_HOLDS_COMPLIANCE,
    triggeringEvent: 'D-Country compliance sanction review flagged',
    subjectPrefix: 'D-Country Compliance Review',
    targetPersona: 'D-Country Org',
    deliveryStatus: 'Held',
  },
  {
    triggerCategory: EVENT_CATEGORY_FAILED_ORDERS,
    triggeringEvent: 'Payment authorization failed - Expired Card',
    subjectPrefix: 'Payment Authorization Failed',
    targetPersona: 'Account Owner',
    deliveryStatus: 'Bounced',
  },
  {
    triggerCategory: EVENT_CATEGORY_FAILED_ORDERS,
    triggeringEvent: 'Failed order notification',
    subjectPrefix: 'Failed Order Notification',
    targetPersona: 'Buyer',
    deliveryStatus: 'Bounced',
  },
  {
    triggerCategory: EVENT_CATEGORY_HOLDS_COMPLIANCE,
    triggeringEvent: 'Tax exemption hold placed',
    subjectPrefix: 'Tax Exemption Hold Notice',
    targetPersona: 'Tax-Exempt Org',
    deliveryStatus: 'Pending',
  },
  {
    triggerCategory: EVENT_CATEGORY_CONFIRMATIONS,
    triggeringEvent: 'Order cancellation confirmation',
    subjectPrefix: 'Order Cancellation Confirmed',
    targetPersona: 'Account Owner',
    deliveryStatus: 'Delivered',
  },
];

const SYNTHESIS_STATUSES: LogDeliveryStatus[] = [
  'Delivered',
  'Delivered',
  'Pending',
  'Held',
  'Bounced',
  'Deferred',
];

export const EVENT_CATEGORY_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'All event categories', value: '' },
  { label: EVENT_CATEGORY_HOLDS_COMPLIANCE, value: EVENT_CATEGORY_HOLDS_COMPLIANCE },
  { label: EVENT_CATEGORY_FAILED_ORDERS, value: EVENT_CATEGORY_FAILED_ORDERS },
  { label: EVENT_CATEGORY_CONFIRMATIONS, value: EVENT_CATEGORY_CONFIRMATIONS },
];

export const TRIGGERING_EVENT_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'Select triggering event', value: '' },
  ...EVENT_SCENARIOS.map((s) => ({
    label: s.triggeringEvent,
    value: s.triggeringEvent,
  })),
];

const FIRST = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie'];
const LAST = ['Nguyen', 'Patel', 'Chen', 'Garcia', 'Kim', 'Brooks', 'Ali', 'Wright'];

/** Prototype rows for truncation / native `title` QA (page 1, rows 1–3). */
const RECIPIENT_FIXTURES: Record<
  number,
  { recipientFirstName: string; recipientLastName: string; recipientEmail: string }
> = {
  0: {
    recipientFirstName: 'Alex',
    recipientLastName: 'Garcia',
    recipientEmail: 'alex.garcia0@example.com',
  },
  1: {
    recipientFirstName: 'Christopher',
    recipientLastName: 'Wellington',
    recipientEmail:
      'christopher.montgomery.wellington@trimble-enterprise-division.com',
  },
  2: {
    recipientFirstName: 'Jordan',
    recipientLastName: 'Smith',
    recipientEmail: 'j.smith@trimble.com',
  },
};

/** Show native email tooltip when the address likely truncates in the recipient column. */
export const RECIPIENT_EMAIL_TOOLTIP_MIN_LENGTH = 25;

function pick<T>(items: T[], index: number): T {
  return items[index % items.length]!;
}

function buildHtmlSnapshot(headline: string, body: string): string {
  return `<!DOCTYPE html><html><body style="font-family:Open Sans,sans-serif;color:#121212"><h1 style="font-size:20px">${headline}</h1><p>${body}</p></body></html>`;
}

/** SendGrid dynamic template IDs: `d-` + 32 hex characters (34 total). */
const smtpDiagnosticFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
  timeZone: 'America/New_York',
});

export function buildSmtpDiagnostic(
  deliveryStatus: LogDeliveryStatus,
  sentAtIso: string,
): string {
  const ts = smtpDiagnosticFormatter.format(new Date(sentAtIso));
  switch (deliveryStatus) {
    case 'Delivered':
      return `SMTP 250 OK: Deliverability acknowledged by MTA on ${ts}`;
    case 'Bounced':
      return `SMTP 550 5.1.1: Recipient address rejected by MTA on ${ts}`;
    case 'Deferred':
      return `SMTP 451 4.7.1: Temporarily deferred by receiving MTA on ${ts}`;
    case 'Pending':
      return `Workflow hold: notification queued pending compliance review on ${ts}`;
    case 'Held':
      return `Compliance hold: delivery suppressed pending sanction review on ${ts}`;
    default:
      return `SMTP response recorded on ${ts}`;
  }
}

function scenarioForIndex(index: number) {
  if (index < EVENT_SCENARIOS.length) {
    return EVENT_SCENARIOS[index]!;
  }
  return pick(EVENT_SCENARIOS, index);
}

function buildSendGridTemplateId(index: number): string {
  const a = ((index * 2654435761) >>> 0).toString(16).padStart(8, '0');
  const b = ((index * 1597334677) >>> 0).toString(16).padStart(8, '0');
  const c = ((index * 2246822519) >>> 0).toString(16).padStart(8, '0');
  const d = ((index * 3266489917) >>> 0).toString(16).padStart(8, '0');
  return `d-${a}${b}${c}${d}`;
}

function synthesizeLog(index: number): ActivityLogRecord {
  const scenario = scenarioForIndex(index);
  const first = pick(FIRST, index);
  const last = pick(LAST, index + 3);
  const orderNum = `TR-${99400 + (index % 50000)}`;
  const status =
    index < EVENT_SCENARIOS.length
      ? scenario.deliveryStatus
      : pick(SYNTHESIS_STATUSES, index + (index % 3));
  const sent = new Date();
  sent.setDate(sent.getDate() - (index % 90));
  sent.setHours(9 + (index % 8), (index * 7) % 60, 0, 0);

  const headline = `${scenario.subjectPrefix} for order ${orderNum}`;
  const body = `This is a prototype notification for ${scenario.triggerCategory.toLowerCase()}.`;

  const displayOrderId = `${String(99000000000 + index).padStart(11, '0')}-${String(index % 10000).padStart(4, '0')}`;

  const fixture = RECIPIENT_FIXTURES[index];
  const recipientFirstName = fixture?.recipientFirstName ?? first;
  const recipientLastName = fixture?.recipientLastName ?? last;
  const recipientEmail =
    fixture?.recipientEmail
    ?? `${first.toLowerCase()}.${last.toLowerCase()}${index % 10}@example.com`;

  return {
    id: `log-${String(index + 1).padStart(5, '0')}`,
    displayOrderId,
    orderId: displayOrderId,
    orderNumber: orderNum,
    logKind: index % 17 === 0 ? 'resend_audit' : 'standard',
    deliveryStatus: status,
    sender: index % 5 === 0 ? 'noreply@trimble.com' : 'orders@trimble.com',
    subject: `${scenario.subjectPrefix} — ${orderNum}`,
    sendGridTemplateId: buildSendGridTemplateId(index),
    targetPersona: scenario.targetPersona,
    triggerCategory: scenario.triggerCategory,
    triggeringEvent: scenario.triggeringEvent,
    recipientFirstName,
    recipientLastName,
    recipientEmail,
    sentAt: sent.toISOString(),
    smtpDiagnostic: buildSmtpDiagnostic(status, sent.toISOString()),
    htmlBodySnapshot: buildHtmlSnapshot(headline, body),
  };
}

export const MOCK_ACTIVITY_LOGS: ActivityLogRecord[] = Array.from({ length: 1200 }, (_, i) =>
  synthesizeLog(i),
);

/** Default mock dataset alias for detail-page fallbacks and prototypes. */
export const mockLogs = MOCK_ACTIVITY_LOGS;

export function getActivityLogById(id: string): ActivityLogRecord | undefined {
  return MOCK_ACTIVITY_LOGS.find((log) => log.id === id);
}

export function activityLogToEmailLog(log: ActivityLogRecord): EmailLog {
  return {
    id: log.id,
    recipientName: `${log.recipientFirstName} ${log.recipientLastName}`.trim(),
    recipientEmail: log.recipientEmail,
    accountNumber: log.displayOrderId.split('-')[0] ?? '',
    orderId: log.orderId,
    triggeringEvent: log.triggeringEvent,
    sendgridTemplateId: log.sendGridTemplateId,
    status: log.deliveryStatus,
    timestamp: log.sentAt,
    smtpDiagnostic: log.smtpDiagnostic,
  };
}

function parseDateBound(value: string, endOfDay: boolean): Date | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = new Date(`${trimmed}T${endOfDay ? '23:59:59.999' : '00:00:00'}`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function filterActivityLogs(
  logs: ActivityLogRecord[],
  filters: ActivityLogFilters,
): ActivityLogRecord[] {
  const q = filters.searchQuery.trim().toLowerCase();
  const from = parseDateBound(filters.dateFrom, false);
  const to = parseDateBound(filters.dateTo, true);

  return logs.filter((log) => {
    if (filters.resendHistoryOnly && log.logKind !== 'resend_audit') {
      return false;
    }

    if (filters.deliveryStatus && log.deliveryStatus !== filters.deliveryStatus) {
      return false;
    }

    const recipientEmailQ = filters.recipientEmail.trim().toLowerCase();
    if (recipientEmailQ && !log.recipientEmail.toLowerCase().includes(recipientEmailQ)) {
      return false;
    }

    const customerNameQ = filters.customerName.trim().toLowerCase();
    if (customerNameQ) {
      const fullName = `${log.recipientFirstName} ${log.recipientLastName}`.toLowerCase();
      if (!fullName.includes(customerNameQ)) return false;
    }

    const orderIdQ = filters.orderId.trim().toLowerCase();
    if (
      orderIdQ
      && !log.orderNumber.toLowerCase().includes(orderIdQ)
      && !log.displayOrderId.toLowerCase().includes(orderIdQ)
    ) {
      return false;
    }

    if (filters.triggeringEvent && log.triggeringEvent !== filters.triggeringEvent) {
      return false;
    }

    if (filters.eventCategory && log.triggerCategory !== filters.eventCategory) {
      return false;
    }

    if (from || to) {
      const sent = new Date(log.sentAt);
      if (from && sent < from) return false;
      if (to && sent > to) return false;
    }

    if (!q) return true;

    const haystack = [
      log.orderNumber,
      log.displayOrderId,
      log.sendGridTemplateId,
      log.subject,
      log.recipientFirstName,
      log.recipientLastName,
      log.recipientEmail,
      log.triggerCategory,
      log.triggeringEvent,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });
}

export function hasActiveActivityLogFilters(filters: ActivityLogFilters): boolean {
  return (
    filters.searchQuery.trim().length > 0
    || filters.recipientEmail.trim().length > 0
    || filters.customerName.trim().length > 0
    || filters.orderId.trim().length > 0
    || filters.triggeringEvent !== ''
    || filters.deliveryStatus !== ''
    || filters.eventCategory !== ''
    || filters.dateFrom.trim().length > 0
    || filters.dateTo.trim().length > 0
    || filters.resendHistoryOnly
  );
}

export const DELIVERY_STATUS_OPTIONS: Array<{ label: string; value: LogDeliveryStatus | '' }> = [
  { label: 'All', value: '' },
  { label: 'Delivered', value: 'Delivered' },
  { label: 'Bounced', value: 'Bounced' },
  { label: 'Deferred', value: 'Deferred' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Held', value: 'Held' },
];
