import type { LogDeliveryStatus } from '../data/mockLogs';

export function getStatusBadgeStyle(status: LogDeliveryStatus | string): string {
  switch (status) {
    case 'Delivered':
      return 'bg-[#056A36] text-white'; // Success (Green)
    case 'Bounced':
      return 'bg-[#DA212C] text-white'; // Danger (Red)
    case 'Deferred':
      return 'bg-[#E36C09] text-white'; // Warning (Yellow/Amber)
    case 'Pending':
      return 'bg-[#0063A3] text-white'; // Default (Modus Blue)
    case 'Held':
      return 'bg-[#333742] text-white'; // Secondary (Dark Gray)
    default:
      return 'bg-[#525866] text-white';
  }
}
