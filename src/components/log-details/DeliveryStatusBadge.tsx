import type { LogDeliveryStatus } from '../../data/mockLogs';
import { sandboxDeliveryDisplay, useSandbox } from '../../context/SandboxContext';
import { getStatusBadgeStyle } from '../../utils/getStatusBadgeStyle';

export function DeliveryStatusBadge({ status }: { status: LogDeliveryStatus }) {
  const { deliveryStatus: simulation, featureScope } = useSandbox();
  const sandboxOverride =
    featureScope === 'DXPBK-1900' ? sandboxDeliveryDisplay(simulation) : null;

  const displayStatus = sandboxOverride?.status ?? status;
  const displayLabel = sandboxOverride?.label ?? status;

  return (
    <span
      className={`inline-block rounded px-2.5 py-1 text-xs font-bold ${getStatusBadgeStyle(displayStatus)}`}
      role="status"
    >
      {displayLabel}
    </span>
  );
}
