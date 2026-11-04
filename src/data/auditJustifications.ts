export const AUDIT_JUSTIFICATION_OPTIONS = [
  { label: 'Select audit justification', value: '' },
  { label: 'Customer requested resend', value: 'customer-request' },
  { label: 'Delivery failure follow-up', value: 'delivery-failure' },
  { label: 'Compliance reviewer directive', value: 'compliance' },
  { label: 'Internal QA verification', value: 'qa' },
] as const;

/** Communication Actions panel (Figma) — shared across Resend / Reply / Forward tabs. */
export const COMMUNICATION_ACTIONS_AUDIT_OPTIONS = [
  { label: 'Select audit justification', value: '' },
  { label: 'Customer Request / Direct Inquiry', value: 'customer_request' },
  { label: 'Billing Dispute / Invoice Reconciliation', value: 'billing_dispute' },
  { label: 'Tax Exemption / Audit Verification', value: 'tax_audit' },
  { label: 'Trade Compliance / Legal Review', value: 'compliance' },
  { label: 'Notification Delivery Failure / Bounced Log', value: 'undelivered' },
] as const;

export function auditJustificationLabel(value: string): string {
  const comm = COMMUNICATION_ACTIONS_AUDIT_OPTIONS.find((o) => o.value === value);
  if (comm) return comm.label;
  return AUDIT_JUSTIFICATION_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
