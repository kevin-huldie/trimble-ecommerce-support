import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  RECIPIENT_EMAIL_TOOLTIP_MIN_LENGTH,
  type LogDeliveryStatus,
} from '../../data/mockLogs';
import { formatLogMvpDateTimeStack } from '../../utils/formatLogDate';
import { getStatusBadgeStyle } from '../../utils/getStatusBadgeStyle';
import { CompactDeliveryStatusBadge } from './CompactDeliveryStatusBadge';
import { TriggeringEventTooltipLabel } from './TriggeringEventTooltipLabel';

export interface EmailLog {
  id: string;
  /** Display name for MVP recipient column (customer). */
  customerName: string;
  recipientName: string;
  recipientEmail: string;
  accountNumber: string;
  orderId: string;
  subjectLine: string;
  triggeringEvent: string;
  sendgridTemplateId: string;
  status: LogDeliveryStatus;
  timestamp: string;
  smtpDiagnostic: string;
}

interface LogsTableProps {
  logs: EmailLog[];
  onClearFilters?: () => void;
  /** Stage 1: MVP or Stage 2: Enhanced — 3-column Recipient / Subject / Date-Time layout. */
  compactLayout?: boolean;
  /** Stage 2: Enhanced — status badge above stacked date/time in column 3. */
  showStatusInDateColumn?: boolean;
  /** @deprecated Use `compactLayout`. */
  stage1Mvp?: boolean;
}

export const LogsTable: React.FC<LogsTableProps> = ({
  logs,
  onClearFilters,
  compactLayout: compactLayoutProp,
  showStatusInDateColumn = false,
  stage1Mvp = false,
}) => {
  const compactLayout = compactLayoutProp ?? stage1Mvp;
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyOrderId = (e: React.MouseEvent, orderId: string) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents row click navigation
    navigator.clipboard.writeText(orderId);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Zero-Result State (Unmounts the table completely per Trimble UX specs)
  if (logs.length === 0) {
    return (
      <div className="bg-white border border-[#CBCDD6] rounded-md p-12 text-center my-4">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-bold text-[#121212] mb-2">No matching activity logs found</h3>
          <p className="text-xs text-[#525866] mb-6">
            We couldn't find any email records matching your current search parameters or active filters.
          </p>
          <div className="bg-[#F1F1F6] p-4 rounded text-left mb-6">
            <p className="text-xs font-bold text-[#121212] mb-2">Troubleshooting suggestions:</p>
            <ul className="text-xs text-[#525866] list-disc list-inside space-y-1">
              <li>Check for typos in customer email, order ID, or account number.</li>
              <li>Verify if the transaction occurred under a different event category.</li>
              <li>Clear active date or status filters to broaden your search scope.</li>
            </ul>
          </div>
          {onClearFilters && (
            <button
              onClick={onClearFilters}
              className="bg-[#0063A3] hover:bg-[#004B7A] text-white font-bold text-xs px-5 py-2.5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[#0063A3]"
            >
              Clear search & filters
            </button>
          )}
        </div>
      </div>
    );
  }

  const rowNavProps = (log: EmailLog) => ({
    tabIndex: 0 as const,
    role: 'button' as const,
    'aria-label': compactLayout
      ? `View log details for ${log.recipientEmail}`
      : `View log details for order ${log.orderId}`,
    onClick: () => navigate(`/logs/${log.id}`),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigate(`/logs/${log.id}`);
      }
    },
    className:
      'cursor-pointer border-b border-[#CBCDD6] transition-colors hover:bg-[#F1F1F6]/70 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0063A3]',
  });

  if (compactLayout) {
    return (
      <div className="w-full overflow-hidden bg-white">
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed border-collapse text-left">
            <thead className="border-b border-[#CBCDD6] bg-[#F1F1F6]">
              <tr>
                <th className="w-[34%] px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#121212]">
                  Recipient
                </th>
                <th className="w-[40%] px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#121212]">
                  Subject
                </th>
                <th className="w-[26%] px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#121212]">
                  Date/Time
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const stackedDateTime = formatLogMvpDateTimeStack(log.timestamp);
                return (
                  <tr key={log.id} {...rowNavProps(log)}>
                    <td className="px-6 py-3.5 align-top text-xs">
                      <div className="min-w-0">
                        <div className="truncate text-xs font-bold text-gray-900">
                          {log.customerName || 'John Doe'}
                        </div>
                        <div
                          className="mt-0.5 min-w-0 truncate text-xs text-gray-500"
                          title={
                            log.recipientEmail.length >= RECIPIENT_EMAIL_TOOLTIP_MIN_LENGTH
                              ? log.recipientEmail
                              : undefined
                          }
                        >
                          <span className="sr-only">Email: </span>
                          {log.recipientEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 align-top text-xs">
                      <div className="min-w-0 truncate text-xs text-gray-900" title={log.subjectLine}>
                        {log.subjectLine}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 align-top text-xs">
                      {showStatusInDateColumn ? (
                        <div className="mb-1">
                          <span className="sr-only">Status: </span>
                          <CompactDeliveryStatusBadge
                            status={log.status}
                            diagnostic={log.smtpDiagnostic}
                          />
                        </div>
                      ) : null}
                      <time
                        dateTime={stackedDateTime.datetime}
                        title={stackedDateTime.title}
                        className="block min-w-0"
                      >
                        <span className="block truncate font-normal text-gray-900">
                          {stackedDateTime.dateLine}
                        </span>
                        {stackedDateTime.timeLine ? (
                          <span className="mt-0.5 block truncate font-normal text-gray-500">
                            {stackedDateTime.timeLine}
                          </span>
                        ) : null}
                      </time>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-white">
      <div className="w-full overflow-hidden">
        <table className="w-full table-fixed border-collapse text-left">
          <thead className="border-b border-[#CBCDD6] bg-[#F1F1F6]">
            <tr>
              <th className="w-[30%] px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#121212]">
                Recipient
              </th>
              <th className="w-[26%] px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#121212]">
                Order ID
              </th>
              <th className="w-[24%] px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#121212]">
                Triggering Event
              </th>
              <th className="w-[20%] px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#121212]">
                Status / Date
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const statusDateTime = formatLogMvpDateTimeStack(log.timestamp);
              return (
              <tr key={log.id} {...rowNavProps(log)}>
                <td className="w-[30%] px-6 py-3.5 align-top">
                  <div className="min-w-0 text-xs font-bold text-[#121212]">{log.recipientName}</div>
                  <div
                    className="min-w-0 truncate text-xs text-[#525866]"
                    title={
                      log.recipientEmail.length >= RECIPIENT_EMAIL_TOOLTIP_MIN_LENGTH
                        ? log.recipientEmail
                        : undefined
                    }
                  >
                    {log.recipientEmail}
                  </div>
                </td>

                <td className="w-[26%] whitespace-nowrap px-6 py-3.5 align-top">
                  <div className="flex items-center gap-2">
                    <span
                      title={`Order ID: ${log.orderId} — Click row to view full details`}
                      className="cursor-pointer text-xs font-mono font-normal text-[#121212]"
                    >
                      {log.orderId}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopyOrderId(e, log.orderId)}
                      className="rounded p-1 text-[#525866] transition-colors hover:text-[#0063A3] focus:outline-none focus:ring-2 focus:ring-[#0063A3]"
                      title={
                        copiedId === log.orderId ? 'Copied!' : 'Copy Order ID to clipboard'
                      }
                      aria-label={`Copy order ID ${log.orderId}`}
                    >
                      {copiedId === log.orderId ? (
                        <Check className="h-3.5 w-3.5 text-[#056A36]" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </td>

                <td
                  className="w-[24%] px-6 py-3.5 align-top"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <TriggeringEventTooltipLabel
                    logId={log.id}
                    triggeringEvent={log.triggeringEvent}
                  />
                </td>

                <td className="w-[20%] px-6 py-3.5 align-top text-left">
                  <div className="flex flex-col items-start gap-1">
                    <span
                      title={log.smtpDiagnostic}
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${getStatusBadgeStyle(log.status)}`}
                    >
                      {log.status}
                    </span>
                    <time
                      dateTime={statusDateTime.datetime}
                      title={statusDateTime.title}
                      className="block min-w-0 text-[11px] font-normal text-[#525866]"
                    >
                      <span className="block">{statusDateTime.dateLine}</span>
                      {statusDateTime.timeLine ? (
                        <span className="mt-0.5 block">{statusDateTime.timeLine}</span>
                      ) : null}
                    </time>
                  </div>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogsTable;