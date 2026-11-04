import type { ReactNode } from 'react';
import type { ActivityLogRecord } from '../../data/mockLogs';
import { DeliveryStatusBadge } from './DeliveryStatusBadge';
import { OrderIdField } from './MessageMetadataSection';

type MessageMetadataCardProps = {
  log: ActivityLogRecord;
};

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 border-b border-[#CBCDD6] pb-3 last:border-b-0 last:pb-0">
      <dt className="text-xs font-bold text-[#121212]">{label}</dt>
      <dd className="mt-0.5 text-xs text-[#121212]">{children}</dd>
    </div>
  );
}

export function MessageMetadataCard({ log }: MessageMetadataCardProps) {
  const recipientName = `${log.recipientFirstName} ${log.recipientLastName}`.trim();

  return (
    <section
      aria-labelledby="message-metadata-heading"
      className="w-full rounded-md border border-[#CBCDD6] bg-white p-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="message-metadata-heading" className="text-sm font-bold text-[#121212]">
          Message metadata
        </h2>
        <DeliveryStatusBadge status={log.deliveryStatus} />
      </div>

      <dl className="flex flex-col gap-3">
        <MetaRow label="From (sender)">{log.sender}</MetaRow>
        <MetaRow label="To (recipient)">
          <span className="block">{recipientName}</span>
          <span className="mt-0.5 block text-[#525866]">{log.recipientEmail}</span>
        </MetaRow>
        <MetaRow label="Dispatch timestamp (ISO)">
          <time dateTime={log.sentAt} className="font-mono text-[11px]">
            {log.sentAt}
          </time>
        </MetaRow>
        <MetaRow label="SendGrid delivery diagnostics">
          <p className="rounded border border-[#CBCDD6] bg-[#F1F1F6] px-2 py-1.5 font-mono text-[11px] leading-snug text-[#121212]">
            {log.smtpDiagnostic}
          </p>
        </MetaRow>
        <div className="min-w-0 border-b border-[#CBCDD6] pb-3">
          <OrderIdField displayOrderId={log.displayOrderId} />
        </div>
        <MetaRow label="Triggering event">{log.triggeringEvent}</MetaRow>
      </dl>
    </section>
  );
}
