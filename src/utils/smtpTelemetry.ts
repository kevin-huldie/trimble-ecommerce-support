import type { ActivityLogRecord } from '../data/mockLogs';

const smtpTimestampFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
  timeZone: 'America/New_York',
});

export function smtpTelemetryForLog(log: ActivityLogRecord): string {
  const ts = smtpTimestampFormatter.format(new Date(log.sentAt));
  switch (log.deliveryStatus) {
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

export type DeliveryTimelineStep = {
  id: string;
  label: string;
  detail: string;
  state: 'complete' | 'current' | 'pending';
};

export function deliveryTimelineForLog(log: ActivityLogRecord): DeliveryTimelineStep[] {
  const sent = smtpTimestampFormatter.format(new Date(log.sentAt));
  const base = [
    {
      id: 'queued',
      label: 'Queued in OMS',
      detail: `Trigger: ${log.triggeringEvent}`,
      state: 'complete' as const,
    },
    {
      id: 'sendgrid',
      label: 'Handed off to SendGrid',
      detail: `Template ${log.sendGridTemplateId}`,
      state: 'complete' as const,
    },
    {
      id: 'mta',
      label: 'MTA response',
      detail: smtpTelemetryForLog(log),
      state: 'current' as const,
    },
  ];

  if (log.deliveryStatus === 'Deferred') {
    return [
      ...base,
      {
        id: 'retry',
        label: 'Retry scheduled',
        detail: `Next attempt after ${sent}`,
        state: 'pending' as const,
      },
    ];
  }

  return base;
}
