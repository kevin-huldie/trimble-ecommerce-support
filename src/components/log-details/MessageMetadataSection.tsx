import { useCallback, useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { logAccountId, type ActivityLogRecord } from '../../data/mockLogs';
import { SENDGRID_TEMPLATE_ID_COPIED_MESSAGE } from '../../utils/successToastMessages';

const COPY_FEEDBACK_MS = 2000;

const VALUE_TEXT_CLASS = 'mt-0.5 block text-sm font-normal text-gray-900';

function trimbleAdminOrderDetailsUrl(displayOrderId: string): string {
  return `https://admin.trimble.com/ecommerce/orders/${encodeURIComponent(displayOrderId)}`;
}

function MetadataLabel({ children }: { children: string }) {
  return <span className="block text-xs font-semibold text-gray-500">{children}</span>;
}

function MetadataBlock({
  label,
  children,
  breakAll = false,
}: {
  label: string;
  children: ReactNode;
  breakAll?: boolean;
}) {
  return (
    <div className="min-w-0">
      <MetadataLabel>{label}</MetadataLabel>
      <div className={`${VALUE_TEXT_CLASS}${breakAll ? ' break-all' : ''}`}>{children}</div>
    </div>
  );
}

function CopyIconButton({
  ariaLabel,
  onCopy,
  copied,
  hoverMuted = false,
}: {
  ariaLabel: string;
  onCopy: () => void;
  copied: boolean;
  hoverMuted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={ariaLabel}
      className={`rounded p-0.5 text-gray-400 transition-colors focus:outline-none focus:ring-1 focus:ring-[#0063A3] ${
        hoverMuted ? 'hover:text-gray-700' : 'hover:text-gray-600'
      }`}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-[#056A36]" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden />
      )}
    </button>
  );
}

/** Legacy card layout — {@link MessageMetadataCard}. */
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
      <div className="mt-0.5 flex items-center gap-1.5">
        <a
          href={adminUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-normal text-[#0063A3] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]"
        >
          {displayOrderId}
        </a>
        <CopyIconButton
          ariaLabel={`Copy Order ID ${displayOrderId}`}
          copied={copied}
          onCopy={() => void copyOrderId()}
        />
      </div>
      <p className="sr-only" aria-live="polite">
        {copied ? `Order ID ${displayOrderId} copied to clipboard` : ''}
      </p>
    </MetadataBlock>
  );
}

function AccountIdField({ accountId }: { accountId: string }) {
  const [copied, setCopied] = useState(false);

  const copyAccountId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(accountId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch {
      setCopied(false);
    }
  }, [accountId]);

  return (
    <MetadataBlock label="Account ID">
      <div className="mt-0.5 flex items-center gap-1.5">
        <span className="text-sm font-normal text-gray-900">{accountId}</span>
        <CopyIconButton
          ariaLabel={`Copy Account ID ${accountId}`}
          copied={copied}
          onCopy={() => void copyAccountId()}
        />
      </div>
      <p className="sr-only" aria-live="polite">
        {copied ? `Account ID ${accountId} copied to clipboard` : ''}
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
    <div className="min-w-0">
      <MetadataLabel>SendGrid Template ID</MetadataLabel>
      <div className="mt-1 inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#CBCDD6] bg-white px-3 py-1 font-mono text-[11px] text-[#121212]">
        <span className="truncate">{templateId}</span>
        <span className="relative inline-flex shrink-0">
          <button
            type="button"
            aria-label={`Copy SendGrid Template ID ${templateId} to clipboard`}
            className="rounded p-0.5 text-[#525866] transition-colors hover:text-[#0063A3] focus:outline-none focus:ring-1 focus:ring-[#0063A3]"
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
    </div>
  );
}

export function MessageMetadataSection({
  log,
  onSuccessToast,
  isStage1Mvp = false,
  showAccountId = true,
  showSystemTelemetry = true,
}: {
  log: ActivityLogRecord;
  onSuccessToast?: (message: string) => void;
  /** Stage 1: MVP — two-column grid; omits system telemetry column. */
  isStage1Mvp?: boolean;
  showAccountId?: boolean;
  /** Triggering Event + SendGrid Template ID (Enhanced & North Star). */
  showSystemTelemetry?: boolean;
}) {
  const recipientName = `${log.recipientFirstName} ${log.recipientLastName}`.trim();
  const accountId = logAccountId(log);
  const showTelemetryColumn = !isStage1Mvp && showSystemTelemetry;

  const gridClassName = isStage1Mvp
    ? 'grid grid-cols-1 gap-6 md:grid-cols-2'
    : 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3';

  return (
    <section
      aria-labelledby="message-metadata-heading"
      className="mb-6 rounded bg-white px-0 py-5"
    >
      <h2 id="message-metadata-heading" className="mb-4 text-sm font-semibold text-gray-900">
        Message Metadata
      </h2>

      <div className={gridClassName}>
        {/* Column 1: Recipient & Sender */}
        <div className="min-w-0 space-y-4">
          <MetadataBlock label="Customer Name">{recipientName}</MetadataBlock>
          <MetadataBlock label="To (Recipient)" breakAll>
            {log.recipientEmail}
          </MetadataBlock>
          <MetadataBlock label="From (Sender)" breakAll>
            {log.sender}
          </MetadataBlock>
        </div>

        {/* Column 2: Order & Account */}
        <div className="min-w-0 space-y-4">
          <OrderIdField displayOrderId={log.displayOrderId} />
          {showAccountId ? <AccountIdField accountId={accountId} /> : null}
        </div>

        {/* Column 3: System Telemetry (Enhanced & North Star) */}
        {showTelemetryColumn ? (
          <div className="min-w-0 space-y-4">
            <MetadataBlock label="Triggering Event">{log.triggeringEvent}</MetadataBlock>
            <SendGridTemplateIdField
              templateId={log.sendGridTemplateId}
              onSuccessToast={onSuccessToast}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
