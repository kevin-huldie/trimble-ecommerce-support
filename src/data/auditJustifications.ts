export const AUDIT_JUSTIFICATION_OPTIONS = [
  { label: 'Select audit justification', value: '' },
  { label: 'Customer requested resend', value: 'customer-request' },
  { label: 'Delivery failure follow-up', value: 'delivery-failure' },
  { label: 'Compliance reviewer directive', value: 'compliance' },
  { label: 'Internal QA verification', value: 'qa' },
] as const;

export function auditJustificationLabel(value: string): string {
  return AUDIT_JUSTIFICATION_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
