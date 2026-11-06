import type { ActivityLogFilters } from '../data/mockLogs';

export const EMAIL_ACTIVITY_LOGS_PATH = '/email-activity-logs';

/** Default log used for Email Details & Actions sandbox deep links. */
export const SANDBOX_DEMO_LOG_ID = 'log-00001';

export const EMAIL_DETAILS_ACTIONS_PATH = `/logs/${SANDBOX_DEMO_LOG_ID}`;

export const SANDBOX_ACTIVITY_LOG_ERRORS = [
  'search-inline',
  'search-zero',
  'filter-inline',
  'filter-zero',
] as const;

export const SANDBOX_DETAILS_ERRORS = [
  'recipient-inline',
  'justification-missing',
  'subject-missing',
] as const;

/** Locked To address on Resend / Reply when `simError=recipient-inline`. */
export const RECIPIENT_INLINE_READONLY_TO_EMAIL = 'john.doe@mail.com';

/** Sample To / CC / BCC chips for `simError=recipient-inline`. */
export const RECIPIENT_INLINE_SAMPLE_CHIPS = [
  { address: 'john.doe@mail.com', valid: true },
  { address: 'jdoe@mail', valid: false },
] as const;

export const SANDBOX_ERROR_QUERY_VALUES = [
  ...SANDBOX_ACTIVITY_LOG_ERRORS,
  ...SANDBOX_DETAILS_ERRORS,
] as const;

export type SandboxActivityLogError = (typeof SANDBOX_ACTIVITY_LOG_ERRORS)[number];
export type SandboxDetailsError = (typeof SANDBOX_DETAILS_ERRORS)[number];
export type SandboxErrorQueryValue = (typeof SANDBOX_ERROR_QUERY_VALUES)[number];

export type SandboxErrorState = SandboxErrorQueryValue | 'none';

export const SANDBOX_SIM_ERROR_PARAM = 'simError';

/** @deprecated Legacy query key; prefer {@link SANDBOX_SIM_ERROR_PARAM}. */
export const SANDBOX_LEGACY_ERROR_PARAM = 'error';

export const FILTER_INLINE_SIM_RECIPIENT_EMAIL = 'invalid-email-format';
export const FILTER_INLINE_SIM_ORDER_ID = 'ORD#99201-INVALID';
export const FILTER_INLINE_SIM_DATE_FROM = '2026-11-04';
export const FILTER_INLINE_SIM_DATE_TO = '2026-10-15';

export function parseSandboxErrorState(param: string | null): SandboxErrorState {
  if (param && (SANDBOX_ERROR_QUERY_VALUES as readonly string[]).includes(param)) {
    return param as SandboxErrorQueryValue;
  }
  return 'none';
}

export function readSandboxSimError(searchParams: URLSearchParams): SandboxErrorState {
  const param =
    searchParams.get(SANDBOX_SIM_ERROR_PARAM)
    ?? searchParams.get(SANDBOX_LEGACY_ERROR_PARAM);
  return parseSandboxErrorState(param);
}

export function isSandboxActivityLogError(
  value: string,
): value is SandboxActivityLogError {
  return (SANDBOX_ACTIVITY_LOG_ERRORS as readonly string[]).includes(value);
}

export function isSandboxDetailsError(value: string): value is SandboxDetailsError {
  return (SANDBOX_DETAILS_ERRORS as readonly string[]).includes(value);
}

/** Target URL when choosing an option in the sandbox Error State dropdown. */
export function sandboxErrorNavigationPath(value: string): string {
  if (value === 'none') {
    return EMAIL_ACTIVITY_LOGS_PATH;
  }
  if (isSandboxDetailsError(value)) {
    return `${EMAIL_DETAILS_ACTIONS_PATH}?${SANDBOX_SIM_ERROR_PARAM}=${encodeURIComponent(value)}`;
  }
  if (isSandboxActivityLogError(value)) {
    return `${EMAIL_ACTIVITY_LOGS_PATH}?${SANDBOX_SIM_ERROR_PARAM}=${encodeURIComponent(value)}`;
  }
  return EMAIL_ACTIVITY_LOGS_PATH;
}

export type ActivityLogsSandboxErrorPreset = {
  filtersPatch: Partial<ActivityLogFilters>;
  filtersOpen: boolean;
};

/** Pre-configured filters / UI for activity logs error simulations. */
export type CommunicationActionsSandboxPreset = {
  activeAction: 'resend' | 'reply' | 'forward';
  showCcBcc: boolean;
  forwardTo: string;
  ccRecipients: string;
  bccRecipients: string;
  auditJustification: string;
  subjectLine: string;
  submitAttempted: boolean;
  subjectTouched: boolean;
};

function defaultSubjectForSandboxAction(
  action: CommunicationActionsSandboxPreset['activeAction'],
  originalSubject: string,
): string {
  switch (action) {
    case 'reply':
      return `Re: ${originalSubject}`;
    case 'forward':
      return `Fwd: ${originalSubject}`;
    default:
      return `Resend: ${originalSubject}`;
  }
}

/** Pre-configured Communication Actions UI for Email Details sandbox error simulations. */
export function communicationActionsSandboxPreset(
  error: SandboxDetailsError,
  originalSubject: string,
): CommunicationActionsSandboxPreset {
  switch (error) {
    case 'recipient-inline': {
      const sampleText = RECIPIENT_INLINE_SAMPLE_CHIPS.map((c) => c.address).join(', ');
      return {
        activeAction: 'resend',
        showCcBcc: true,
        forwardTo: sampleText,
        ccRecipients: sampleText,
        bccRecipients: sampleText,
        auditJustification: '',
        subjectLine: defaultSubjectForSandboxAction('resend', originalSubject),
        submitAttempted: true,
        subjectTouched: false,
      };
    }
    case 'justification-missing':
      return {
        activeAction: 'resend',
        showCcBcc: true,
        forwardTo: '',
        ccRecipients: '',
        bccRecipients: '',
        auditJustification: '',
        subjectLine: defaultSubjectForSandboxAction('resend', originalSubject),
        submitAttempted: true,
        subjectTouched: false,
      };
    case 'subject-missing':
      return {
        activeAction: 'reply',
        showCcBcc: true,
        forwardTo: '',
        ccRecipients: '',
        bccRecipients: '',
        auditJustification: '',
        subjectLine: '',
        submitAttempted: true,
        subjectTouched: true,
      };
    default: {
      const exhaustive: never = error;
      return exhaustive;
    }
  }
}

export function activityLogsSandboxErrorPreset(
  error: SandboxActivityLogError,
): ActivityLogsSandboxErrorPreset {
  switch (error) {
    case 'search-inline':
      return {
        filtersPatch: { searchQuery: '00000000000-9999' },
        filtersOpen: false,
      };
    case 'search-zero':
      return {
        filtersPatch: { searchQuery: '00000000000-9999' },
        filtersOpen: false,
      };
    case 'filter-inline':
      return {
        filtersPatch: {
          recipientEmail: FILTER_INLINE_SIM_RECIPIENT_EMAIL,
          orderId: FILTER_INLINE_SIM_ORDER_ID,
          dateFrom: FILTER_INLINE_SIM_DATE_FROM,
          dateTo: FILTER_INLINE_SIM_DATE_TO,
        },
        filtersOpen: true,
      };
    case 'filter-zero':
      return {
        filtersPatch: { recipientEmail: 'zero.results.sandbox@example.com' },
        filtersOpen: false,
      };
    default:
      return { filtersPatch: {}, filtersOpen: false };
  }
}
