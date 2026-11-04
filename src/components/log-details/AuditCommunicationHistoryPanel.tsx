import type { AuditTimelineEntry } from '../../types/communicationAudit';
import { AuditCommunicationHistoryTable } from './AuditCommunicationHistoryTable';

type AuditCommunicationHistoryPanelProps = {
  auditLogs: AuditTimelineEntry[];
};

/** @deprecated Prefer AuditCommunicationHistoryTable */
export function AuditCommunicationHistoryPanel({ auditLogs }: AuditCommunicationHistoryPanelProps) {
  return <AuditCommunicationHistoryTable entries={auditLogs} />;
}
