import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ActionSuccessToast } from '../components/log-details/ActionSuccessToast';
import { AuditTable } from '../components/log-details/AuditTable';
import { ArchivedMessageSnapshotPanel } from '../components/log-details/ArchivedMessageSnapshotPanel';
import { CommunicationActionsPanel } from '../components/log-details/CommunicationActionsPanel';
import { LogDetailsHeaderSection } from '../components/log-details/LogDetailsHeaderSection';
import { MessageMetadataSection } from '../components/log-details/MessageMetadataSection';
import { PortalShell } from '../components/PortalShell';
import { getActivityLogById, mockLogs } from '../data/mockLogs';
import { formatCommunicationSuccessToastMessage } from '../utils/successToastMessages';
import {
  mapAuditTimelineEntryToAuditLog,
  type AuditLog,
  type AuditTimelineEntry,
} from '../types/communicationAudit';

const TOAST_DURATION_MS = 4000;

export function LogDetailsPage() {
  const { logId } = useParams<{ logId: string }>();
  const log = logId ? getActivityLogById(logId) || mockLogs[0] : mockLogs[0];

  const [historyLogs, setHistoryLogs] = useState<AuditLog[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setHistoryLogs([]);
  }, [log.id]);

  const dismissToast = useCallback(() => setToastMessage(null), []);

  const handleCommunicationLogged = useCallback((entry: AuditTimelineEntry) => {
    setHistoryLogs((prev) => [mapAuditTimelineEntryToAuditLog(entry), ...prev]);
    setToastMessage(
      formatCommunicationSuccessToastMessage(entry.actionBadge, entry.destinationEmail),
    );
  }, []);

  useEffect(() => {
    if (!log) return;
    document.title = `Order Details: ${log.orderId} | Trimble Support Portal`;
  }, [log]);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = window.setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  return (
    <PortalShell hideSidebar>
      <div className="mx-auto min-h-screen max-w-6xl space-y-6 bg-white px-8 py-6 text-[#121212]">
        <LogDetailsHeaderSection log={log} />
        <MessageMetadataSection log={log} onSuccessToast={setToastMessage} />
        <ArchivedMessageSnapshotPanel log={log} />

        <AuditTable historyLogs={historyLogs} />

        <CommunicationActionsPanel log={log} onCommunicationLogged={handleCommunicationLogged} />
      </div>
      {toastMessage ? (
        <ActionSuccessToast message={toastMessage} onClose={dismissToast} />
      ) : null}
    </PortalShell>
  );
}
