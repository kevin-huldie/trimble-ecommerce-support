export const AUDIT_JUSTIFICATION_OPTIONS = [
  { label: 'Select audit justification', value: '' },
  { label: 'Customer requested resend', value: 'customer-request' },
  { label: 'Delivery failure follow-up', value: 'delivery-failure' },
  { label: 'Compliance reviewer directive', value: 'compliance' },
  { label: 'Internal QA verification', value: 'qa' },
] as const;

/** Communication Actions panel — shared across Resend / Reply / Forward tabs. */
export const COMMUNICATION_ACTIONS_AUDIT_OPTIONS = [
  { label: 'Select audit justification', value: '' },
  { label: 'Customer requested resend', value: 'customer_requested_resend' },
  { label: 'Delivery failure follow-up', value: 'delivery_failure_followup' },
  { label: 'Compliance reviewer directive', value: 'compliance_reviewer_directive' },
  { label: 'Internal QA verification', value: 'internal_qa_verification' },
] as const;

export function auditJustificationLabel(value: string): string {
  const comm = COMMUNICATION_ACTIONS_AUDIT_OPTIONS.find((o) => o.value === value);
  if (comm) return comm.label;
  return AUDIT_JUSTIFICATION_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
