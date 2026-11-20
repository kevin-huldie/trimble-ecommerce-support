import type { LogDeliveryStatus } from '../../data/mockLogs';
import { getStatusBadgeStyle } from '../../utils/getStatusBadgeStyle';

type CompactDeliveryStatusBadgeProps = {
  status: LogDeliveryStatus;
  diagnostic?: string;
};

/** Stage 2: Enhanced — matches North Star `LogsTable` status pill styling. */
export function CompactDeliveryStatusBadge({
  status,
  diagnostic,
}: CompactDeliveryStatusBadgeProps) {
  return (
    <span
      title={diagnostic?.trim() ? diagnostic : undefined}
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${getStatusBadgeStyle(status)}`}
    >
      {status}
    </span>
  );
}
