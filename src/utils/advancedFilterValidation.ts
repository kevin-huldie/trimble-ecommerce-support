import type { AdvancedFilterFields } from '../data/mockLogs';

const SIMPLE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ADVANCED_RECIPIENT_EMAIL_ERROR =
  'Enter a valid email address (e.g., name@domain.com)';

export const ADVANCED_DATE_RANGE_ERROR = 'Start date must be on or before end date.';

export function validateAdvancedRecipientEmailField(recipientEmail: string): string | null {
  const trimmed = recipientEmail.trim();
  if (!trimmed) return null;
  if (!SIMPLE_EMAIL.test(trimmed)) return ADVANCED_RECIPIENT_EMAIL_ERROR;
  return null;
}

export function validateAdvancedDateRange(dateFrom: string, dateTo: string): string | null {
  const from = dateFrom.trim();
  const to = dateTo.trim();
  if (!from || !to) return null;
  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T00:00:00`);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) return null;
  if (fromDate > toDate) return ADVANCED_DATE_RANGE_ERROR;
  return null;
}

export function validateAdvancedFiltersDraft(values: AdvancedFilterFields): {
  recipientEmailError: string | null;
  dateRangeError: string | null;
} {
  return {
    recipientEmailError: validateAdvancedRecipientEmailField(values.recipientEmail),
    dateRangeError: validateAdvancedDateRange(values.dateFrom, values.dateTo),
  };
}
