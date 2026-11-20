import type { AuditLog } from '../../types/communicationAudit';
import type { LogDeliveryStatus } from '../../data/mockLogs';
import {
  auditLogMatchesSandboxDelivery,
  logMatchesSandboxTemplate,
  telemetryStreamWarning,
  useSandbox,
} from '../../context/SandboxContext';
import { getActivityLogById } from '../../data/mockLogs';

type AuditTableProps = {
  historyLogs: AuditLog[];
  /** Source log for template filtering when audit rows lack template metadata. */
  sourceLogId?: string;
  stage1Mvp?: boolean;
};

/** Fixed 1068px, 5-column audit history table (Modus 1.0 / MXP chrome tokens). */
export function AuditTable({ historyLogs, sourceLogId, stage1Mvp = false }: AuditTableProps) {
  const { telemetryStream, deliveryStatus, templateType, featureScope } = useSandbox();
  const telemetryNotice =
    featureScope === 'DXPBK-1900' ? telemetryStreamWarning(telemetryStream) : null;

  const sourceLog = sourceLogId ? getActivityLogById(sourceLogId) : undefined;
  const templateGateOk =
    featureScope !== 'DXPBK-1900'
    || !sourceLog
    || logMatchesSandboxTemplate(sourceLog, templateType);

  const filteredHistory = historyLogs.filter((row) => {
    if (featureScope !== 'DXPBK-1900') {
      return true;
    }
    const rowDelivery = inferRowDeliveryStatus(row);
    return (
      auditLogMatchesSandboxDelivery(rowDelivery, deliveryStatus)
      && templateGateOk
    );
  });

  const hasHistoryLogs = filteredHistory.length > 0;

  return (
    <div className="mb-6 w-[1068px] max-w-full rounded-lg border border-[#CBCDD6] bg-white p-6">
      <h2 className="mb-3 text-sm font-bold text-[#121212]">Audit and Communication History</h2>
      {telemetryNotice ? (
        <p
          className="mb-3 rounded border border-[#E36C09] bg-[#FFF4E5] px-2 py-1.5 text-[11px] font-semibold text-[#7A4100]"
          role="alert"
        >
          {telemetryNotice}
        </p>
      ) : null}
      {featureScope === 'DXPBK-1900' && deliveryStatus !== 'all-dispatches' ? (
        <p className="mb-3 text-[11px] text-[#525866]" role="status">
          Sandbox delivery filter active — showing audit rows matching the simulated dispatch state.
        </p>
      ) : null}

      {hasHistoryLogs ? (
        <div className="overflow-hidden rounded-lg border border-[#CBCDD6] bg-white">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#CBCDD6] bg-[#F1F1F6]">
                {stage1Mvp ? (
                  <>
                    <th className="w-[22%] whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#525866]">
                      Rep Name
                    </th>
                    <th className="w-[18%] whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#525866]">
                      Date/Time
                    </th>
                    <th className="w-[14%] whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#525866]">
                      Action Type
                    </th>
                    <th className="w-[20%] whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#525866]">
                      Recipient
                    </th>
                    <th className="w-[26%] whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#525866]">
                      Audit Details
                    </th>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBCDD6] text-xs text-[#121212]">
              {filteredHistory.map((row, index) => (
                <tr key={index} className="transition-colors hover:bg-[#F8F9FA]">
                  {stage1Mvp ? (
                    <>
                      <td className="px-3 py-2.5 align-top">
                        <div className="text-xs font-bold text-[#121212]">{row.repName}</div>
                        <div className="mt-0.5 text-xs text-gray-500">{row.repEmail}</div>
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        <div className="text-xs font-bold text-[#121212]">{row.date}</div>
                        <div className="mt-0.5 text-[10px] text-[#525866]">{row.time}</div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2.5 align-top">
                        <div className="text-xs font-bold text-[#121212]">{row.date}</div>
                        <div className="mt-0.5 text-[10px] text-[#525866]">{row.time}</div>
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        <div className="text-xs font-bold text-[#121212]">{row.repId}</div>
                        <div className="mt-0.5 text-[10px] text-[#525866]">{row.repName}</div>
                      </td>
                    </>
                  )}
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
                  {stage1Mvp ? (
                    <MvpAuditDetailsCell internalAuditNote={row.notes} />
                  ) : (
                    <td className="px-3 py-2.5 align-top text-xs text-[#121212]">
                      <div className="font-semibold text-[#121212]">{row.justification || '—'}</div>
                      {row.notes && row.notes !== '—' ? (
                        <div className="mt-0.5 break-words text-[11px] italic text-[#525866]">
                          Note: {row.notes}
                        </div>
                      ) : null}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-[#525866]">
          {historyLogs.length > 0 && featureScope === 'DXPBK-1900'
            ? 'No audit rows match the current sandbox delivery or template simulation.'
            : 'No representative-initiated communication actions are recorded yet.'}
        </p>
      )}
    </div>
  );
}

function MvpAuditDetailsCell({ internalAuditNote }: { internalAuditNote: string }) {
  const note = internalAuditNote.trim();
  if (note) {
    return (
      <td className="px-4 py-3 align-top text-xs text-gray-800">
        <span className="block break-words">{note}</span>
      </td>
    );
  }
  return (
    <td className="px-4 py-3 align-top text-xs text-gray-400">
      <span aria-hidden="true">—</span>
      <span className="sr-only">No internal audit note recorded</span>
    </td>
  );
}

/** Audit table rows do not carry delivery status; assume rep actions succeed as Delivered unless notes imply failure. */
function inferRowDeliveryStatus(row: AuditLog): LogDeliveryStatus {
  const notes = `${row.notes} ${row.justification}`.toLowerCase();
  if (notes.includes('bounce') || notes.includes('550')) {
    return 'Bounced';
  }
  if (notes.includes('pending') || notes.includes('hold')) {
    return 'Pending';
  }
  return 'Delivered';
}
