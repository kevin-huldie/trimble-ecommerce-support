import type { AdvancedFilterFields } from '../data/mockLogs';

const SIMPLE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ADVANCED_RECIPIENT_EMAIL_ERROR =
  'Invalid email address. Use format: name@domain.com';

/** @deprecated Use {@link ADVANCED_END_DATE_ERROR} for inline end-date messaging. */
export const ADVANCED_DATE_RANGE_ERROR = 'Start date must be on or before end date.';

export const ADVANCED_ORDER_ID_ERROR =
  'Invalid Order ID format. Enter an 8-to-10 digit numeric string.';

export const ADVANCED_START_DATE_ERROR = 'Start date must be a valid calendar date.';

export const ADVANCED_END_DATE_ERROR = 'End date cannot be earlier than start date.';

const ORDER_ID_NUMERIC = /^\d{8,10}$/;

export function isValidIsoCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y!, m! - 1, d);
  if (Number.isNaN(date.getTime())) return false;
  return date.getFullYear() === y && date.getMonth() === m! - 1 && date.getDate() === d;
}

export function validateAdvancedRecipientEmailField(recipientEmail: string): string | null {
  const trimmed = recipientEmail.trim();
  if (!trimmed) return null;
  if (!SIMPLE_EMAIL.test(trimmed)) return ADVANCED_RECIPIENT_EMAIL_ERROR;
  return null;
}

export function validateAdvancedOrderIdField(orderId: string): string | null {
  const trimmed = orderId.trim();
  if (!trimmed) return null;
  if (!ORDER_ID_NUMERIC.test(trimmed)) return ADVANCED_ORDER_ID_ERROR;
  return null;
}

export function isValidAdvancedOrderId(orderId: string): boolean {
  const trimmed = orderId.trim();
  if (!trimmed) return true;
  return ORDER_ID_NUMERIC.test(trimmed);
}

export function validateAdvancedStartDateField(
  dateFrom: string,
  dateTo: string,
): string | null {
  const from = dateFrom.trim();
  if (!from) return null;
  if (!isValidIsoCalendarDate(from)) return ADVANCED_START_DATE_ERROR;

  const to = dateTo.trim();
  if (to && isValidIsoCalendarDate(to)) {
    const fromDate = new Date(`${from}T00:00:00`);
    const toDate = new Date(`${to}T00:00:00`);
    if (fromDate > toDate) return ADVANCED_START_DATE_ERROR;
  }

  return null;
}

export function validateAdvancedEndDateField(
  dateFrom: string,
  dateTo: string,
): string | null {
  const to = dateTo.trim();
  if (!to) return null;
  if (!isValidIsoCalendarDate(to)) return ADVANCED_END_DATE_ERROR;

  const from = dateFrom.trim();
  if (from && isValidIsoCalendarDate(from)) {
    const fromDate = new Date(`${from}T00:00:00`);
    const toDate = new Date(`${to}T00:00:00`);
    if (fromDate > toDate) return ADVANCED_END_DATE_ERROR;
  }

  return null;
}

/** @deprecated Prefer {@link validateAdvancedStartDateField} / {@link validateAdvancedEndDateField}. */
export function validateAdvancedDateRange(dateFrom: string, dateTo: string): string | null {
  const endError = validateAdvancedEndDateField(dateFrom, dateTo);
  if (endError) return ADVANCED_DATE_RANGE_ERROR;
  return null;
}

export function validateAdvancedFiltersDraft(values: AdvancedFilterFields): {
  recipientEmailError: string | null;
  startDateError: string | null;
  endDateError: string | null;
  orderIdError: string | null;
} {
  return {
    recipientEmailError: validateAdvancedRecipientEmailField(values.recipientEmail),
    startDateError: validateAdvancedStartDateField(values.dateFrom, values.dateTo),
    endDateError: validateAdvancedEndDateField(values.dateFrom, values.dateTo),
    orderIdError: validateAdvancedOrderIdField(values.orderId),
  };
}

export function advancedFiltersDraftHasErrors(
  errors: ReturnType<typeof validateAdvancedFiltersDraft>,
): boolean {
  return Boolean(
    errors.recipientEmailError
    || errors.orderIdError
    || errors.startDateError
    || errors.endDateError,
  );
}
