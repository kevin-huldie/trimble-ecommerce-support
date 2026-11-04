import { useMemo } from 'react';
import {
  auditActionTypeLabel,
  formatAuditTableDateTime,
  resolveAuditRowJustificationAndNotes,
  resolveAuditRowRepFields,
  sortAuditTimelineNewestFirst,
  type AuditTimelineEntry,
} from '../../types/communicationAudit';

type AuditCommunicationHistoryTableProps = {
  entries: AuditTimelineEntry[];
};

type HistoryLogRow = {
  id: string;
  date: string;
  time: string;
  datetime: string;
  utcTitle: string;
  repId: string;
  repName: string;
  actionType: string;
  justification: string;
  recipient: string;
  notes: string;
};

function actionTypePillClass(actionType: string): string {
  if (actionType === 'Reply') return 'bg-[#1E5631]';
  if (actionType === 'Forward') return 'bg-[#121212]';
  return 'bg-[#0063A3]';
}

function mapEntriesToHistoryLogs(entries: AuditTimelineEntry[]): HistoryLogRow[] {
  return sortAuditTimelineNewestFirst(entries).map((entry) => {
    const { date, time, datetime, utcTitle } = formatAuditTableDateTime(entry.occurredAt);
    const { repId, repName } = resolveAuditRowRepFields(entry);
    const { justification, notes } = resolveAuditRowJustificationAndNotes(entry);
    return {
      id: entry.id,
      date,
      time,
      datetime,
      utcTitle,
      repId,
      repName,
      actionType: auditActionTypeLabel(entry.actionBadge),
      justification,
      recipient: entry.destinationEmail,
      notes,
    };
  });
}

export function AuditCommunicationHistoryTable({ entries }: AuditCommunicationHistoryTableProps) {
  const historyLogs = useMemo(() => mapEntriesToHistoryLogs(entries), [entries]);

  const hasHistory = historyLogs.length > 0;

  return (
    <div
      role="region"
      aria-labelledby="audit-history-heading"
      className="mb-6 rounded-lg border border-[#CBCDD6] bg-white p-6"
    >
      <h2 id="audit-history-heading" className="mb-3 text-sm font-bold text-[#121212]">
        Audit and Communication History
      </h2>

      {hasHistory ? (
        <div className="overflow-hidden rounded-lg border border-[#CBCDD6] bg-white">
          <table className="w-full table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-[#CBCDD6] bg-[#F1F1F6] text-[11px] font-bold text-[#525866]">
                <th scope="col" className="w-[15%] px-4 py-3">
                  Date/Time
                </th>
                <th scope="col" className="w-[15%] px-4 py-3">
                  Rep TID
                </th>
                <th scope="col" className="w-[12%] px-4 py-3">
                  Action Type
                </th>
                <th scope="col" className="w-[18%] px-4 py-3">
                  Justification
                </th>
                <th scope="col" className="w-[18%] px-4 py-3">
                  Recipient
                </th>
                <th scope="col" className="w-[22%] px-4 py-3">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBCDD6] text-xs text-[#121212]">
              {historyLogs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-[#F8F9FA]">
                  <td className="px-4 py-3 align-top">
                    <time dateTime={log.datetime} title={log.utcTitle} className="block">
                      <div className="font-bold">{log.date}</div>
                      <div className="mt-0.5 text-[10px] text-[#525866]">{log.time}</div>
                    </time>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-bold">{log.repId}</div>
                    <div className="mt-0.5 text-[10px] text-[#525866]">{log.repName}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-block rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${actionTypePillClass(log.actionType)}`}
                    >
                      {log.actionType}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-[#121212]">{log.justification}</td>
                  <td
                    className="max-w-[140px] truncate px-4 py-3 align-top text-[#525866]"
                    title={log.recipient}
                  >
                    {log.recipient}
                  </td>
                  <td className="whitespace-pre-wrap break-words px-4 py-3 align-top text-[#121212]">
                    {log.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-[#525866]">
          No representative-initiated communication actions are recorded yet.
        </p>
      )}
    </div>
  );
}
