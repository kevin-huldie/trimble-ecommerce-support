import type { AuditLog } from '../../types/communicationAudit';

type AuditTableProps = {
  historyLogs: AuditLog[];
};

/** Fixed 1068px, 5-column audit history table (Modus 1.0 / MXP chrome tokens). */
export function AuditTable({ historyLogs }: AuditTableProps) {
  const hasHistoryLogs = historyLogs.length > 0;

  return (
    <div className="mb-6 w-[1068px] max-w-full rounded-lg border border-[#CBCDD6] bg-white p-6">
      <h2 className="mb-3 text-sm font-bold text-[#121212]">Audit and Communication History</h2>

      {hasHistoryLogs ? (
        <div className="overflow-hidden rounded-lg border border-[#CBCDD6] bg-white">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#CBCDD6] bg-[#F1F1F6]">
                <th className="w-[18%] whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#525866]">
                  Date/Time
                </th>
                <th className="w-[18%] whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#525866]">
                  Rep TID
                </th>
                <th className="w-[14%] whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#525866]">
                  Action Type
                </th>
                <th className="w-[20%] whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#525866]">
                  Recipient
                </th>
                <th className="w-[30%] whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#525866]">
                  Audit Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBCDD6] text-xs text-[#121212]">
              {historyLogs.map((row, index) => (
                <tr key={index} className="transition-colors hover:bg-[#F8F9FA]">
                  <td className="px-3 py-2.5 align-top">
                    <div className="text-xs font-bold text-[#121212]">{row.date}</div>
                    <div className="mt-0.5 text-[10px] text-[#525866]">{row.time}</div>
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <div className="text-xs font-bold text-[#121212]">{row.repId}</div>
                    <div className="mt-0.5 text-[10px] text-[#525866]">{row.repName}</div>
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <span
                      className={`inline-block rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${
                        row.actionType === 'Resend'
                          ? 'bg-[#0063A3]'
                          : row.actionType === 'Reply'
                            ? 'bg-[#1E5631]'
                            : 'bg-[#121212]'
                      }`}
                    >
                      {row.actionType}
                    </span>
                  </td>
                  <td
                    className="max-w-[160px] truncate px-3 py-2.5 align-top text-xs text-[#525866]"
                    title={row.recipient}
                  >
                    {row.recipient}
                  </td>
                  <td className="px-3 py-2.5 align-top text-xs text-[#121212]">
                    <div className="font-semibold text-[#121212]">{row.justification || '—'}</div>
                    {row.notes && row.notes !== '—' && (
                      <div className="mt-0.5 break-words text-[11px] italic text-[#525866]">
                        Note: {row.notes}
                      </div>
                    )}
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
