import type { AuditActionBadge } from '../types/communicationAudit';

export const SENDGRID_TEMPLATE_ID_COPIED_MESSAGE =
  'SendGrid Template ID copied to clipboard.';

export function formatCommunicationSuccessToastMessage(
  actionBadge: AuditActionBadge,
  destinationEmail: string,
): string {
  const address = destinationEmail.trim();
  switch (actionBadge) {
    case 'REPLY':
      return `Reply sent successfully to ${address}.`;
    case 'FORWARD':
      return `Thread forwarded successfully to ${address}.`;
    case 'RESEND':
    default:
      return `Original email re-sent successfully to ${address}.`;
  }
}
