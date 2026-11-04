import type { ActivityLogRecord, LogDeliveryStatus } from '../data/mockLogs';

export type AuditActionBadge = 'RESEND' | 'REPLY' | 'FORWARD' | 'SYSTEM_DISPATCH';

export type AuditTimelineEntry = {
  id: string;
  occurredAt: string;
  actionBadge: AuditActionBadge;
  actorLabel: string;
  destinationEmail: string;
  deliveryStatus: LogDeliveryStatus;
  repTid?: string;
  repName?: string;
  justification?: string;
  notes?: string;
};

/** @deprecated Use AuditTimelineEntry — kept for transitional imports */
export type AuditLogEntry = AuditTimelineEntry;

/** Display row for the Log Details audit history table. */
export type AuditLog = {
  date: string;
  time: string;
  repId: string;
  repName: string;
  actionType: string;
  justification: string;
  recipient: string;
  notes: string;
};

export const DEFAULT_REP_TID = 'REP-4402';
export const DEFAULT_REP_NAME = 'Sarah Jenkins';

export const ACTION_BADGE_CLASS: Record<AuditActionBadge, string> = {
  RESEND: 'bg-[#0063A3]',
  REPLY: 'bg-[#1E5631]',
  FORWARD: 'bg-[#121212]',
  SYSTEM_DISPATCH: 'bg-[#333742]',
};

export function formatAuditTableDateTime(iso: string): {
  date: string;
  time: string;
  datetime: string;
  utcTitle: string;
} {
  const dateObj = new Date(iso);
  const date = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  }).format(dateObj);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'America/New_York',
    timeZoneName: 'short',
  }).format(dateObj);
  return {
    date,
    time,
    datetime: iso,
    utcTitle: `${dateObj.toISOString()} (UTC)`,
  };
}

export function auditActionTypeLabel(badge: AuditActionBadge): string {
  switch (badge) {
    case 'REPLY':
      return 'Reply';
    case 'FORWARD':
      return 'Forward';
    case 'SYSTEM_DISPATCH':
      return 'System';
    default:
      return 'Resend';
  }
}

export function auditActionTypeTagClass(badge: AuditActionBadge): string {
  switch (badge) {
    case 'REPLY':
      return 'bg-[#1E5631]';
    case 'FORWARD':
      return 'bg-[#121212]';
    case 'SYSTEM_DISPATCH':
      return 'bg-[#333742]';
    default:
      return 'bg-[#0063A3]';
  }
}

export function resolveAuditRowRepFields(entry: AuditTimelineEntry): {
  repId: string;
  repName: string;
} {
  if (entry.repTid) {
    return {
      repId: entry.repTid,
      repName: entry.repName ?? entry.actorLabel,
    };
  }
  const parenMatch = /^(.+?)\s*\((.+)\)\s*$/.exec(entry.actorLabel);
  if (parenMatch) {
    return { repId: parenMatch[1].trim(), repName: parenMatch[2].trim() };
  }
  return { repId: '—', repName: entry.actorLabel };
}

export function resolveAuditRowJustificationAndNotes(entry: AuditTimelineEntry): {
  justification: string;
  notes: string;
} {
  if (entry.justification !== undefined && entry.justification !== '') {
    return {
      justification: entry.justification,
      notes: entry.notes?.trim() ?? '',
    };
  }
  const rawNotes = entry.notes?.trim() ?? '';
  if (!rawNotes) {
    return { justification: '—', notes: '' };
  }
  if (rawNotes.includes(' — ')) {
    const [justification, ...rest] = rawNotes.split(' — ');
    return {
      justification: justification.trim() || '—',
      notes: rest.join(' — ').trim(),
    };
  }
  return {
    justification: rawNotes,
    notes: '',
  };
}

export function mapAuditTimelineEntryToAuditLog(entry: AuditTimelineEntry): AuditLog {
  const { date, time } = formatAuditTableDateTime(entry.occurredAt);
  const { repId, repName } = resolveAuditRowRepFields(entry);
  const { justification, notes } = resolveAuditRowJustificationAndNotes(entry);
  return {
    date,
    time,
    repId,
    repName,
    actionType: auditActionTypeLabel(entry.actionBadge),
    justification,
    recipient: entry.destinationEmail,
    notes,
  };
}

export function formatAuditTimelineLocal(iso: string): { display: string; utcTitle: string; datetime: string } {
  const date = new Date(iso);
  const display = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
  return {
    display,
    utcTitle: `${date.toISOString()} (UTC)`,
    datetime: iso,
  };
}

export function actionBadgeFromTab(tab: 'resend' | 'reply' | 'forward'): AuditActionBadge {
  switch (tab) {
    case 'reply':
      return 'REPLY';
    case 'forward':
      return 'FORWARD';
    default:
      return 'RESEND';
  }
}

export function createSystemDispatchEntry(log: ActivityLogRecord): AuditTimelineEntry {
  return {
    id: `system-${log.id}`,
    occurredAt: log.sentAt,
    actionBadge: 'SYSTEM_DISPATCH',
    actorLabel: 'SendGrid Webhook Processor',
    destinationEmail: log.recipientEmail,
    deliveryStatus: log.deliveryStatus,
  };
}

export function createRepCommunicationEntry(params: {
  tab: 'resend' | 'reply' | 'forward';
  destinationEmail: string;
  justification?: string;
  notes?: string;
}): AuditTimelineEntry {
  return {
    id: crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
    actionBadge: actionBadgeFromTab(params.tab),
    actorLabel: `${DEFAULT_REP_TID} (${DEFAULT_REP_NAME})`,
    repTid: DEFAULT_REP_TID,
    repName: DEFAULT_REP_NAME,
    destinationEmail: params.destinationEmail,
    deliveryStatus: 'Pending',
    justification: params.justification,
    notes: params.notes,
  };
}

export function sortAuditTimelineNewestFirst(entries: AuditTimelineEntry[]): AuditTimelineEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}

/** Oldest-first order for vertical chronological streams (top → bottom). */
export function sortAuditTimelineChronological(entries: AuditTimelineEntry[]): AuditTimelineEntry[] {
  return [...entries].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
  );
}
