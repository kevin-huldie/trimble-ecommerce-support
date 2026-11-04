import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  auditJustificationLabel,
  COMMUNICATION_ACTIONS_AUDIT_OPTIONS,
} from '../../data/auditJustifications';
import type { ActivityLogRecord } from '../../data/mockLogs';
import {
  createRepCommunicationEntry,
  type AuditTimelineEntry,
} from '../../types/communicationAudit';
import { isValidEmailAddress, parseEmailListInput } from '../../utils/emailValidation';
import { InlineFieldError } from '../InlineFieldError';
import { ValidationLiveRegion } from '../ValidationLiveRegion';
import {
  RECIPIENT_INLINE_SAMPLE_CHIPS,
  SANDBOX_SIM_ERROR_PARAM,
} from '../../utils/sandboxErrorDeepLink';
import { ActionButtonTooltip } from './ActionButtonTooltip';

type CommAction = 'resend' | 'reply' | 'forward';

const ACTION_TYPE_TOOLTIPS: Record<CommAction, string> = {
  resend: 'Re-send original email to customer',
  reply: 'Send custom response to customer',
  forward: 'Forward thread to internal team',
};

const ACTION_BUTTON_ARIA_LABELS: Record<CommAction, string> = {
  resend: 'Resend Email: Re-send original email to customer',
  reply: 'Reply: Send custom response to customer',
  forward: 'Forward Email: Forward thread to internal team',
};

const FORWARD_TO_ERROR = 'One or more recipient email addresses are invalid.';
const SUBJECT_REQUIRED_ERROR = 'Subject line is required.';
const CC_BCC_INVALID_ERROR = 'One or more email addresses in CC or BCC are invalid.';

const LABEL_CLASS = 'mb-1 block text-xs font-medium text-gray-900';
const INPUT_EDITABLE =
  'w-full rounded border border-[#C4C9D0] bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0063A3] focus:outline-none focus:ring-1 focus:ring-[#0063A3]';
const READONLY_VALUE =
  'w-full cursor-default select-text rounded border border-[#C4C9D0] bg-[#DFE3E8] px-3 py-2 text-xs text-gray-800';
const TEXTAREA_CLASS =
  'w-full resize-y rounded border border-[#C4C9D0] bg-white px-3 py-2 text-xs text-gray-900 placeholder:text-gray-500 focus:border-[#0063A3] focus:outline-none focus:ring-1 focus:ring-[#0063A3]';

type CommunicationActionsPanelProps = {
  log: ActivityLogRecord;
  onCommunicationLogged: (entry: AuditTimelineEntry) => void;
  readOnly?: boolean;
};

function defaultSubjectForAction(action: CommAction, originalSubject: string): string {
  switch (action) {
    case 'reply':
      return `Re: ${originalSubject}`;
    case 'forward':
      return `Fwd: ${originalSubject}`;
    default:
      return `Resend: ${originalSubject}`;
  }
}

function resolveInitialAction(searchParams: URLSearchParams): CommAction {
  if (searchParams.get('action') === 'forward') {
    return 'forward';
  }
  const simError =
    searchParams.get(SANDBOX_SIM_ERROR_PARAM) ?? searchParams.get('error');
  if (simError === 'recipient-inline') {
    return 'forward';
  }
  return 'resend';
}

function listFieldInvalid(raw: string, required: boolean): boolean {
  const parts = parseEmailListInput(raw);
  if (required && parts.length === 0) return true;
  if (parts.length === 0) return false;
  return parts.some((email) => !isValidEmailAddress(email));
}

function RequiredMark() {
  return <span className="text-red-600">*</span>;
}

export function CommunicationActionsPanel({
  log,
  onCommunicationLogged,
  readOnly = false,
}: CommunicationActionsPanelProps) {
  const [searchParams] = useSearchParams();
  const [activeAction, setActiveAction] = useState<CommAction>(() =>
    resolveInitialAction(searchParams),
  );

  const [showCcBcc, setShowCcBcc] = useState(true);
  const [forwardTo, setForwardTo] = useState('');
  const [ccRecipients, setCcRecipients] = useState('');
  const [bccRecipients, setBccRecipients] = useState('');
  const [auditJustification, setAuditJustification] = useState('');
  const [subjectLine, setSubjectLine] = useState(() =>
    defaultSubjectForAction('resend', log.subject),
  );
  const [internalNote, setInternalNote] = useState('');

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [subjectTouched, setSubjectTouched] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');

  const isToReadOnly = activeAction === 'resend' || activeAction === 'reply';
  const isSubjectReadOnly = activeAction === 'resend';

  const forwardToInvalid =
    activeAction === 'forward' && listFieldInvalid(forwardTo, true);
  const ccInvalid = listFieldInvalid(ccRecipients, false);
  const bccInvalid = listFieldInvalid(bccRecipients, false);
  const auditMissing = auditJustification === '';
  const subjectEmpty = !isSubjectReadOnly && subjectLine.trim() === '';
  const showSubjectError = subjectEmpty && (subjectTouched || submitAttempted);
  const auditInvalid = submitAttempted && auditMissing;
  const showForwardToError = forwardToInvalid && submitAttempted;
  const showCcBccError = (ccInvalid || bccInvalid) && submitAttempted;

  const primaryLabel =
    activeAction === 'resend'
      ? 'Resend email'
      : activeAction === 'reply'
        ? 'Send reply'
        : 'Forward email';

  const validationAnnouncement = useMemo(() => {
    if (showForwardToError) return FORWARD_TO_ERROR;
    if (showCcBccError) return CC_BCC_INVALID_ERROR;
    if (showSubjectError) return SUBJECT_REQUIRED_ERROR;
    if (auditInvalid) return 'Select an audit justification before sending.';
    return '';
  }, [showForwardToError, showCcBccError, showSubjectError, auditInvalid]);

  useEffect(() => {
    if (validationAnnouncement) setLiveMessage(validationAnnouncement);
  }, [validationAnnouncement]);

  useEffect(() => {
    const simError =
      searchParams.get(SANDBOX_SIM_ERROR_PARAM) ?? searchParams.get('error');
    if (simError !== 'recipient-inline' || readOnly) {
      return;
    }
    const sampleText = RECIPIENT_INLINE_SAMPLE_CHIPS.map((c) => c.address).join(', ');
    setActiveAction('forward');
    setShowCcBcc(true);
    setForwardTo(sampleText);
    setCcRecipients(sampleText);
    setBccRecipients(sampleText);
    setSubjectLine(defaultSubjectForAction('forward', log.subject));
    setSubmitAttempted(false);
  }, [readOnly, searchParams, log.id, log.subject]);

  const selectAction = useCallback(
    (action: CommAction) => {
      setActiveAction(action);
      setSubjectLine(defaultSubjectForAction(action, log.subject));
      setSubmitAttempted(false);
      setSubjectTouched(false);
    },
    [log.subject],
  );

  const handleCancel = useCallback(() => {
    setForwardTo('');
    setCcRecipients('');
    setBccRecipients('');
    setAuditJustification('');
    setInternalNote('');
    setSubmitAttempted(false);
    setSubjectTouched(false);
    setSubjectLine(defaultSubjectForAction(activeAction, log.subject));
  }, [activeAction, log.subject]);

  const formHasErrors =
    auditMissing
    || ccInvalid
    || bccInvalid
    || forwardToInvalid
    || subjectEmpty;

  const submitDisabled = readOnly || formHasErrors;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (readOnly) return;
    setSubmitAttempted(true);
    setSubjectTouched(true);
    if (formHasErrors) return;

    const destination = isToReadOnly
      ? log.recipientEmail
      : parseEmailListInput(forwardTo).join(', ');

    const entry = createRepCommunicationEntry({
      tab: activeAction,
      destinationEmail: destination,
      justification: auditJustificationLabel(auditJustification),
      notes: internalNote.trim() || undefined,
    });

    onCommunicationLogged(entry);
    handleCancel();
  };

  return (
    <section
      aria-labelledby="communication-actions-heading"
      className="w-full space-y-6 rounded-lg border border-[#CBCDD6] bg-white p-6"
    >
      <ValidationLiveRegion message={liveMessage} />
      <h2 id="communication-actions-heading" className="text-sm font-bold text-[#121212]">
        Communication Actions
      </h2>

      <div
        className="inline-flex rounded-md shadow-sm"
        role="tablist"
        aria-label="Communication action types"
      >
        <ActionSegmentTab
          tabId="resend"
          position="first"
          active={activeAction === 'resend'}
          label="Resend Email"
          tooltip={ACTION_TYPE_TOOLTIPS.resend}
          ariaLabel={ACTION_BUTTON_ARIA_LABELS.resend}
          icon={<IconEnvelope active={activeAction === 'resend'} />}
          onClick={() => selectAction('resend')}
        />
        <ActionSegmentTab
          tabId="reply"
          position="middle"
          active={activeAction === 'reply'}
          label="Reply"
          tooltip={ACTION_TYPE_TOOLTIPS.reply}
          ariaLabel={ACTION_BUTTON_ARIA_LABELS.reply}
          icon={<IconReply active={activeAction === 'reply'} />}
          onClick={() => selectAction('reply')}
        />
        <ActionSegmentTab
          tabId="forward"
          position="last"
          active={activeAction === 'forward'}
          label="Forward Email"
          tooltip={ACTION_TYPE_TOOLTIPS.forward}
          ariaLabel={ACTION_BUTTON_ARIA_LABELS.forward}
          icon={<IconForward active={activeAction === 'forward'} />}
          onClick={() => selectAction('forward')}
        />
      </div>

      <fieldset disabled={readOnly} className="min-w-0 border-0 p-0">
        <form
          className="flex w-full flex-col gap-6"
          onSubmit={handleSubmit}
          noValidate
        >
          {isToReadOnly ? (
            <div>
              <label className={LABEL_CLASS}>
                To <RequiredMark />
              </label>
              <div className={READONLY_VALUE}>{log.recipientEmail}</div>
            </div>
          ) : (
            <div>
              <label htmlFor="comm-to-forward" className={LABEL_CLASS}>
                To <RequiredMark />
              </label>
              <input
                id="comm-to-forward"
                type="text"
                value={forwardTo}
                placeholder="Add emails separated by commas"
                aria-invalid={showForwardToError || undefined}
                aria-describedby={showForwardToError ? 'comm-to-forward-error' : undefined}
                className={[
                  INPUT_EDITABLE,
                  showForwardToError ? 'border-red-600 focus:border-red-600 focus:ring-red-600' : '',
                ].join(' ')}
                onChange={(e) => setForwardTo(e.target.value)}
              />
              {showForwardToError ? (
                <InlineFieldError id="comm-to-forward-error" message={FORWARD_TO_ERROR} />
              ) : null}
            </div>
          )}

          <button
            type="button"
            className="flex w-fit cursor-pointer items-center gap-1 text-xs font-bold text-gray-900 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#0063A3]"
            aria-expanded={showCcBcc}
            onClick={() => setShowCcBcc((open) => !open)}
          >
            {showCcBcc ? (
              <>
                - Hide CC / BCC
                <ChevronUp className="h-3.5 w-3.5" aria-hidden />
              </>
            ) : (
              <>
                + Show CC / BCC
                <ChevronDown className="h-3.5 w-3.5" aria-hidden />
              </>
            )}
          </button>

          {showCcBcc ? (
            <>
              <div>
                <label htmlFor="comm-cc" className={LABEL_CLASS}>
                  CC
                </label>
                <input
                  id="comm-cc"
                  type="text"
                  value={ccRecipients}
                  placeholder="Add CC emails separated by commas"
                  aria-invalid={ccInvalid && submitAttempted ? true : undefined}
                  className={[
                    INPUT_EDITABLE,
                    ccInvalid && submitAttempted
                      ? 'border-red-600 focus:border-red-600 focus:ring-red-600'
                      : '',
                  ].join(' ')}
                  onChange={(e) => setCcRecipients(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="comm-bcc" className={LABEL_CLASS}>
                  BCC
                </label>
                <input
                  id="comm-bcc"
                  type="text"
                  value={bccRecipients}
                  placeholder="Add BCC emails separated by commas"
                  aria-invalid={bccInvalid && submitAttempted ? true : undefined}
                  className={[
                    INPUT_EDITABLE,
                    bccInvalid && submitAttempted
                      ? 'border-red-600 focus:border-red-600 focus:ring-red-600'
                      : '',
                  ].join(' ')}
                  onChange={(e) => setBccRecipients(e.target.value)}
                />
              </div>
              {showCcBccError ? (
                <InlineFieldError message={CC_BCC_INVALID_ERROR} />
              ) : null}
            </>
          ) : null}

          <div>
            <label htmlFor="audit-justification" className={LABEL_CLASS}>
              Audit justification <RequiredMark />
            </label>
            <select
              id="audit-justification"
              value={auditJustification}
              aria-invalid={auditInvalid || undefined}
              aria-describedby={auditInvalid ? 'audit-justification-error' : undefined}
              className={[
                INPUT_EDITABLE,
                'cursor-pointer',
                auditInvalid ? 'border-red-600 focus:border-red-600 focus:ring-red-600' : '',
              ].join(' ')}
              onChange={(e) => setAuditJustification(e.target.value)}
            >
              {COMMUNICATION_ACTIONS_AUDIT_OPTIONS.map((opt) => (
                <option key={opt.value || 'placeholder'} value={opt.value} disabled={!opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {auditInvalid ? (
              <InlineFieldError
                id="audit-justification-error"
                message="Select an audit justification before sending."
              />
            ) : null}
          </div>

          <div>
            <label htmlFor="comm-subject" className={LABEL_CLASS}>
              {activeAction === 'forward' ? 'Subject line' : 'Subject Line'}
            </label>
            {isSubjectReadOnly ? (
              <div id="comm-subject" className={READONLY_VALUE}>
                {subjectLine}
              </div>
            ) : (
              <>
                <input
                  id="comm-subject"
                  type="text"
                  value={subjectLine}
                  aria-invalid={showSubjectError || undefined}
                  aria-describedby={showSubjectError ? 'comm-subject-error' : undefined}
                  className={[
                    INPUT_EDITABLE,
                    showSubjectError
                      ? 'border-red-600 focus:border-red-600 focus:ring-red-600'
                      : '',
                  ].join(' ')}
                  onChange={(e) => setSubjectLine(e.target.value)}
                  onBlur={() => setSubjectTouched(true)}
                />
                {showSubjectError ? (
                  <InlineFieldError id="comm-subject-error" message={SUBJECT_REQUIRED_ERROR} />
                ) : null}
              </>
            )}
          </div>

          <div>
            <label htmlFor="internal-audit-note" className={LABEL_CLASS}>
              Internal audit note{' '}
              <span className="font-normal text-gray-500">(Optional)</span>
            </label>
            <textarea
              id="internal-audit-note"
              rows={3}
              value={internalNote}
              placeholder="Add context for secondary recipients or compliance reviewers."
              className={TEXTAREA_CLASS}
              onChange={(e) => setInternalNote(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded border border-[#0063A3] bg-white px-4 py-2 text-xs font-bold text-[#0063A3] hover:bg-[#F0F7FC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitDisabled}
              aria-disabled={submitDisabled}
              className={[
                'inline-flex items-center justify-center rounded bg-[#0063A3] px-4 py-2 text-xs font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3] focus-visible:ring-offset-1',
                submitDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-[#004B7A]',
              ].join(' ')}
            >
              {primaryLabel}
            </button>
          </div>
        </form>
      </fieldset>
    </section>
  );
}

function ActionSegmentTab({
  tabId,
  position,
  active,
  label,
  tooltip,
  ariaLabel,
  icon,
  onClick,
}: {
  tabId: CommAction;
  position: 'first' | 'middle' | 'last';
  active: boolean;
  label: string;
  tooltip: string;
  ariaLabel: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  const radius =
    position === 'first'
      ? 'rounded-l-md rounded-r-none'
      : position === 'last'
        ? 'rounded-r-md rounded-l-none'
        : 'rounded-none';

  const border =
    position === 'first'
      ? 'border border-[#0063A3]'
      : 'border border-l-0 border-[#0063A3]';

  const tooltipDomId = `comm-action-tooltip-${tabId}`;

  return (
    <ActionButtonTooltip tooltipId={tooltipDomId} content={tooltip}>
      <button
        type="button"
        role="tab"
        aria-selected={active}
        aria-label={ariaLabel}
        className={[
          'relative flex items-center gap-2 px-4 py-2 text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3] focus-visible:ring-offset-1',
          radius,
          border,
          active
            ? 'z-10 bg-[#0063A3] text-white'
            : 'bg-white text-[#0063A3] hover:bg-[#F0F7FC]',
        ].join(' ')}
        onClick={onClick}
      >
        {icon}
        {label}
      </button>
    </ActionButtonTooltip>
  );
}

function IconEnvelope({ active }: { active: boolean }) {
  const stroke = active ? '#FFFFFF' : '#0063A3';
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2.5 4.5h11v7a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-7Z"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 5.5 8 9l5.5-3.5"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconReply({ active }: { active: boolean }) {
  const stroke = active ? '#FFFFFF' : '#0063A3';
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M9.5 4.5 5 9l4.5 4.5"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 9h6.5a3 3 0 0 1 0 6H10"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconForward({ active }: { active: boolean }) {
  const stroke = active ? '#FFFFFF' : '#0063A3';
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="4" cy="8" r="1.75" stroke={stroke} strokeWidth="1.2" />
      <path
        d="M5.75 8h3.5M9.25 6.25 11.5 8l-2.25 1.75M9.25 8h1.25a2.5 2.5 0 0 1 0 5H10"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
