import type { LogDeliveryStatus } from '../../data/mockLogs';
import { getStatusBadgeStyle } from '../../utils/getStatusBadgeStyle';

export function DeliveryStatusBadge({ status }: { status: LogDeliveryStatus }) {
  return (
    <span
      className={`inline-block rounded px-2.5 py-1 text-xs font-bold ${getStatusBadgeStyle(status)}`}
      role="status"
    >
      {status}
    </span>
  );
}
