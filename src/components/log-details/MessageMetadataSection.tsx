import { useCallback, useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import type { ActivityLogRecord } from '../../data/mockLogs';
import { SENDGRID_TEMPLATE_ID_COPIED_MESSAGE } from '../../utils/successToastMessages';

const COPY_FEEDBACK_MS = 2000;

function trimbleAdminOrderDetailsUrl(displayOrderId: string): string {
  return `https://admin.trimble.com/ecommerce/orders/${encodeURIComponent(displayOrderId)}`;
}

function MetadataLabel({ children }: { children: string }) {
  return <span className="mb-1 block font-medium text-[#525866]">{children}</span>;
}

function MetadataBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <MetadataLabel>{label}</MetadataLabel>
      <div className="text-[#121212]">{children}</div>
    </div>
  );
}

export function OrderIdField({ displayOrderId }: { displayOrderId: string }) {
  const [copied, setCopied] = useState(false);
  const adminUrl = trimbleAdminOrderDetailsUrl(displayOrderId);

  const copyOrderId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(displayOrderId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch {
      setCopied(false);
    }
  }, [displayOrderId]);

  return (
    <MetadataBlock label="Order ID">
      <div className="flex items-center gap-1.5 font-semibold text-[#0063A3]">
        <a
          href={adminUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]"
        >
          [{displayOrderId}]
        </a>
        <span className="relative inline-flex shrink-0">
          <button
            type="button"
            aria-label={`Copy order ID ${displayOrderId}`}
            className="rounded p-0.5 text-[#525866] hover:text-[#0063A3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]"
            onClick={() => void copyOrderId()}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-[#056A36]" aria-hidden />
            ) : (
              <Copy className="h-3.5 w-3.5 cursor-pointer" aria-hidden />
            )}
          </button>
          {copied ? (
            <span
              className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-[#121212] px-2 py-1 text-[11px] font-medium text-white"
              role="tooltip"
            >
              Copied!
            </span>
          ) : null}
        </span>
      </div>
      <p className="sr-only" aria-live="polite">
        {copied ? `Order ID ${displayOrderId} copied to clipboard` : ''}
      </p>
    </MetadataBlock>
  );
}

function SendGridTemplateIdField({
  templateId,
  onSuccessToast,
}: {
  templateId: string;
  onSuccessToast?: (message: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyTemplateId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(templateId);
      setCopied(true);
      onSuccessToast?.(SENDGRID_TEMPLATE_ID_COPIED_MESSAGE);
      window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch {
      setCopied(false);
    }
  }, [templateId, onSuccessToast]);

  return (
    <MetadataBlock label="SendGrid Template ID">
      <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#CBCDD6] bg-white px-3 py-1 font-mono text-[11px] text-[#121212]">
        <span className="truncate">{templateId}</span>
        <span className="relative inline-flex shrink-0">
          <button
            type="button"
            aria-label={`Copy SendGrid Template ID ${templateId} to clipboard`}
            className="rounded p-0.5 text-[#525866] hover:text-[#0063A3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]"
            onClick={() => void copyTemplateId()}
          >
            {copied ? (
              <Check className="h-3 w-3 text-[#056A36]" aria-hidden />
            ) : (
              <Copy className="h-3 w-3 cursor-pointer" aria-hidden />
            )}
          </button>
          {copied ? (
            <span
              className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-[#056A36] px-2 py-1 text-[11px] font-medium text-white shadow-sm"
              role="tooltip"
            >
              Copied!
            </span>
          ) : null}
        </span>
      </div>
      <p className="sr-only" aria-live="polite">
        {copied ? 'SendGrid Template ID copied to clipboard' : ''}
      </p>
    </MetadataBlock>
  );
}

export function MessageMetadataSection({
  log,
  onSuccessToast,
}: {
  log: ActivityLogRecord;
  onSuccessToast?: (message: string) => void;
}) {
  const recipientName = `${log.recipientFirstName} ${log.recipientLastName}`.trim();

  return (
    <section aria-labelledby="message-metadata-heading" className="mb-8 w-full">
      <h2 id="message-metadata-heading" className="mb-4 text-sm font-bold text-[#121212]">
        Message Metadata
      </h2>
      <div className="grid grid-cols-2 gap-x-12 gap-y-5 text-xs">
        <div className="space-y-4">
          <MetadataBlock label="Customer Name">
            <span className="font-semibold text-[#121212]">{recipientName}</span>
          </MetadataBlock>
          <MetadataBlock label="To (Recipient)">{log.recipientEmail}</MetadataBlock>
          <MetadataBlock label="From (Sender)">{log.sender}</MetadataBlock>
        </div>
        <div className="space-y-4">
          <OrderIdField displayOrderId={log.displayOrderId} />
          <MetadataBlock label="Triggering Event">{log.triggeringEvent}</MetadataBlock>
          <SendGridTemplateIdField
            templateId={log.sendGridTemplateId}
            onSuccessToast={onSuccessToast}
          />
        </div>
      </div>
    </section>
  );
}
