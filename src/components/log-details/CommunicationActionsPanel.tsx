import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { Forward, Mail, Reply } from 'lucide-react';
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
  AUDIT_JUSTIFICATION_SANDBOX_ERROR,
  CommunicationActionsFieldAlert,
} from './CommunicationActionsFieldAlert';
import {
  RECIPIENT_CHIP_FORMAT_ERROR,
  RecipientChipField,
  shouldUseRecipientChipLayout,
} from './RecipientChipField';
import {
  communicationActionsSandboxPreset,
  isSandboxDetailsError,
  readSandboxSimError,
  RECIPIENT_INLINE_READONLY_TO_EMAIL,
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

const ACTION_TAB_ICON_CLASS = 'h-4 w-4 shrink-0';

const SUBJECT_REQUIRED_ERROR = 'Subject line is required.';

const LABEL_CLASS = 'mb-1 block text-xs font-medium text-gray-900';
const INPUT_EDITABLE =
  'w-full rounded border border-[#C4C9D0] bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0063A3] focus:outline-none focus:ring-1 focus:ring-[#0063A3]';
const INPUT_INVALID =
  'border-[#DA212C] focus:border-[#DA212C] focus:ring-[#DA212C]';
const AUDIT_SELECT_SANDBOX_INVALID =
  'border-[#A81E1E] focus:border-[#A81E1E] focus:ring-1 focus:ring-[#A81E1E]';
const READONLY_VALUE =
  'w-full cursor-default select-text rounded border border-[#C4C9D0] bg-[#DFE3E8] px-3 py-2 text-xs text-gray-800';
const TEXTAREA_CLASS =
  'w-full resize-y rounded border border-[#C4C9D0] bg-white px-3 py-2 text-xs text-gray-900 placeholder:text-gray-500 focus:border-[#0063A3] focus:outline-none focus:ring-1 focus:ring-[#0063A3]';

type CommunicationActionsPanelProps = {
  log: ActivityLogRecord;
  onCommunicationLogged: (entry: AuditTimelineEntry) => void;
  readOnly?: boolean;
  /** Stage 2+ — when false (MVP), hide audit justification and submit without it. */
  showAuditJustification?: boolean;
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
  const simError = readSandboxSimError(searchParams);
  if (simError === 'recipient-inline') {
    return 'resend';
  }
  if (simError === 'subject-missing') {
    return 'reply';
  }
  if (simError === 'justification-missing') {
    return 'resend';
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
  showAuditJustification = true,
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
  const sandboxDetailsError = useMemo(() => {
    const simError = readSandboxSimError(searchParams);
    return isSandboxDetailsError(simError) ? simError : null;
  }, [searchParams]);
  const auditValidationActive =
    showAuditJustification
    && (sandboxDetailsError === 'justification-missing' || sandboxDetailsError === null);
  const recipientValidationActive =
    sandboxDetailsError === 'recipient-inline' || sandboxDetailsError === null;
  const subjectValidationActive =
    sandboxDetailsError === 'subject-missing' || sandboxDetailsError === null;
  const showAuditInlineError = auditInvalid && auditValidationActive;
  const showSubjectInlineError = showSubjectError && subjectValidationActive;
  const recipientInlineSimulation = sandboxDetailsError === 'recipient-inline';
  const showForwardToError =
    activeAction === 'forward'
    && recipientValidationActive
    && forwardToInvalid
    && submitAttempted;
  const showCcError = recipientValidationActive && ccInvalid && submitAttempted;
  const showBccError = recipientValidationActive && bccInvalid && submitAttempted;
  const useForwardToChips =
    activeAction === 'forward'
    && shouldUseRecipientChipLayout(forwardTo, recipientInlineSimulation);
  const useCcChips = shouldUseRecipientChipLayout(ccRecipients, recipientInlineSimulation);
  const useBccChips = shouldUseRecipientChipLayout(bccRecipients, recipientInlineSimulation);
  const chipInlineErrorMessage = recipientInlineSimulation
    ? RECIPIENT_CHIP_FORMAT_ERROR
    : undefined;
  const toReadOnlyDisplay =
    recipientInlineSimulation && isToReadOnly
      ? RECIPIENT_INLINE_READONLY_TO_EMAIL
      : log.recipientEmail;

  const primaryLabel =
    activeAction === 'resend'
      ? 'Resend email'
      : activeAction === 'reply'
        ? 'Send reply'
        : 'Forward email';

  const validationAnnouncement = useMemo(() => {
    if (showForwardToError || showCcError || showBccError) {
      return RECIPIENT_CHIP_FORMAT_ERROR;
    }
    if (showSubjectInlineError) return SUBJECT_REQUIRED_ERROR;
    if (showAuditInlineError) return AUDIT_JUSTIFICATION_SANDBOX_ERROR;
    return '';
  }, [
    showForwardToError,
    showCcError,
    showBccError,
    showSubjectInlineError,
    showAuditInlineError,
    recipientInlineSimulation,
  ]);

  useEffect(() => {
    if (validationAnnouncement) setLiveMessage(validationAnnouncement);
  }, [validationAnnouncement]);

  useEffect(() => {
    const simError = readSandboxSimError(searchParams);
    if (readOnly || !isSandboxDetailsError(simError)) {
      return;
    }
    const preset = communicationActionsSandboxPreset(simError, log.subject);
    setActiveAction(preset.activeAction);
    setShowCcBcc(preset.showCcBcc);
    setForwardTo(preset.forwardTo);
    setCcRecipients(preset.ccRecipients);
    setBccRecipients(preset.bccRecipients);
    setAuditJustification(preset.auditJustification);
    setSubjectLine(preset.subjectLine);
    setSubmitAttempted(preset.submitAttempted);
    setSubjectTouched(preset.subjectTouched);
  }, [readOnly, searchParams, log.id, log.subject]);

  useEffect(() => {
    if (
      sandboxDetailsError === 'recipient-inline'
      || sandboxDetailsError === 'justification-missing'
      || sandboxDetailsError === 'subject-missing'
    ) {
      setShowCcBcc(true);
    }
  }, [sandboxDetailsError, activeAction]);

  const selectAction = useCallback(
    (action: CommAction) => {
      setActiveAction(action);
      if (sandboxDetailsError === 'subject-missing') {
        setSubjectLine(
          action === 'resend' ? defaultSubjectForAction('resend', log.subject) : '',
        );
      } else {
        setSubjectLine(defaultSubjectForAction(action, log.subject));
      }
      if (!sandboxDetailsError) {
        setSubmitAttempted(false);
        setSubjectTouched(false);
      }
    },
    [log.subject, sandboxDetailsError],
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
    (auditValidationActive && auditMissing)
    || (recipientValidationActive && (ccInvalid || bccInvalid || forwardToInvalid))
    || (subjectValidationActive && subjectEmpty);

  const isSubmitDisabled = readOnly || formHasErrors;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (readOnly) return;
    setSubmitAttempted(true);
    setSubjectTouched(true);
    if (formHasErrors) return;

    const destination = isToReadOnly
      ? log.recipientEmail
      : parseEmailListInput(forwardTo).join(', ');

    const trimmedInternalNote = internalNote.trim();
    const entry = createRepCommunicationEntry({
      tab: activeAction,
      destinationEmail: destination,
      justification: showAuditJustification
        ? auditJustificationLabel(auditJustification)
        : undefined,
      notes: trimmedInternalNote || undefined,
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
          icon={<Mail className={ACTION_TAB_ICON_CLASS} aria-hidden strokeWidth={1.75} />}
          onClick={() => selectAction('resend')}
        />
        <ActionSegmentTab
          tabId="reply"
          position="middle"
          active={activeAction === 'reply'}
          label="Reply"
          tooltip={ACTION_TYPE_TOOLTIPS.reply}
          ariaLabel={ACTION_BUTTON_ARIA_LABELS.reply}
          icon={<Reply className={ACTION_TAB_ICON_CLASS} aria-hidden strokeWidth={1.75} />}
          onClick={() => selectAction('reply')}
        />
        <ActionSegmentTab
          tabId="forward"
          position="last"
          active={activeAction === 'forward'}
          label="Forward Email"
          tooltip={ACTION_TYPE_TOOLTIPS.forward}
          ariaLabel={ACTION_BUTTON_ARIA_LABELS.forward}
          icon={<Forward className={ACTION_TAB_ICON_CLASS} aria-hidden strokeWidth={1.75} />}
          onClick={() => selectAction('forward')}
        />
      </div>

      <fieldset className="min-w-0 border-0 p-0">
        <form
          className="flex w-full flex-col gap-6"
          onSubmit={handleSubmit}
          noValidate
          aria-readonly={readOnly || undefined}
        >
          {isToReadOnly ? (
            <div>
              <label className={LABEL_CLASS}>
                To <RequiredMark />
              </label>
              <div className={READONLY_VALUE}>{toReadOnlyDisplay}</div>
            </div>
          ) : (
            <RecipientChipField
              id="comm-to-forward"
              errorId="comm-to-forward-error"
              label={
                <>
                  To <RequiredMark />
                </>
              }
              value={forwardTo}
              disabled={readOnly}
              showError={showForwardToError}
              useChipLayout={useForwardToChips}
              placeholder="Add emails separated by commas"
              inlineErrorMessage={chipInlineErrorMessage}
              onChange={setForwardTo}
            />
          )}

          <div className="my-2">
            <button
              type="button"
              disabled={readOnly}
              onClick={() => setShowCcBcc((prev) => !prev)}
              aria-expanded={showCcBcc}
              aria-controls="cc-bcc-wrapper"
              className={[
                'flex cursor-pointer items-center gap-1 border-0 bg-transparent py-0.5 text-xs !font-bold shadow-none outline-none',
                showCcBcc ? 'text-[#0063A3]' : 'text-gray-900 hover:text-[#0063A3]',
                'focus:outline-none focus-visible:underline',
                'disabled:cursor-not-allowed disabled:!font-bold disabled:opacity-50',
              ].join(' ')}
            >
              <span className="!font-bold">
                {showCcBcc ? '- Hide CC / BCC' : '+ Show CC / BCC'}
              </span>
              <span className="text-[10px]" aria-hidden>
                {showCcBcc ? '▲' : '▼'}
              </span>
            </button>
          </div>

          {showCcBcc ? (
            <div id="cc-bcc-wrapper" className="mb-3 space-y-3">
              <RecipientChipField
                id="cc-input"
                errorId="cc-input-error"
                label="CC"
                value={ccRecipients}
                disabled={readOnly}
                showError={showCcError}
                useChipLayout={useCcChips}
                placeholder="Add CC emails separated by commas"
                inlineErrorMessage={chipInlineErrorMessage}
                onChange={setCcRecipients}
              />
              <RecipientChipField
                id="bcc-input"
                errorId="bcc-input-error"
                label="BCC"
                value={bccRecipients}
                disabled={readOnly}
                showError={showBccError}
                useChipLayout={useBccChips}
                placeholder="Add BCC emails separated by commas"
                inlineErrorMessage={chipInlineErrorMessage}
                onChange={setBccRecipients}
              />
            </div>
          ) : null}

          {showAuditJustification ? (
            <div className="mb-3">
              <label htmlFor="audit-justification" className={LABEL_CLASS}>
                Audit justification <RequiredMark />
              </label>
              <select
                id="audit-justification"
                name="audit-justification"
                value={auditJustification}
                disabled={readOnly}
                aria-invalid={showAuditInlineError || undefined}
                aria-describedby={showAuditInlineError ? 'audit-justification-error' : undefined}
                className={[
                  sandboxDetailsError === 'justification-missing' && showAuditInlineError
                    ? 'w-full cursor-pointer rounded border bg-white px-3 py-2 text-xs text-gray-900 outline-none'
                    : INPUT_EDITABLE,
                  'cursor-pointer outline-none',
                  showAuditInlineError
                    ? sandboxDetailsError === 'justification-missing'
                      ? AUDIT_SELECT_SANDBOX_INVALID
                      : INPUT_INVALID
                    : '',
                ].join(' ')}
                onChange={(e) => setAuditJustification(e.target.value)}
              >
                {COMMUNICATION_ACTIONS_AUDIT_OPTIONS.map((opt) => (
                  <option key={opt.value || 'placeholder'} value={opt.value} disabled={!opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {showAuditInlineError ? (
                <CommunicationActionsFieldAlert
                  id="audit-justification-error"
                  message={AUDIT_JUSTIFICATION_SANDBOX_ERROR}
                />
              ) : null}
            </div>
          ) : null}

          <div>
            <label htmlFor="comm-subject" className={LABEL_CLASS}>
              Subject line
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
                  disabled={readOnly}
                  aria-invalid={showSubjectInlineError || undefined}
                  aria-describedby={showSubjectInlineError ? 'comm-subject-error' : undefined}
                  className={[
                    INPUT_EDITABLE,
                    showSubjectInlineError ? INPUT_INVALID : '',
                  ].join(' ')}
                  onChange={(e) => setSubjectLine(e.target.value)}
                  onBlur={() => setSubjectTouched(true)}
                />
                {showSubjectInlineError ? (
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
              disabled={readOnly}
              placeholder="Add context for secondary recipients or compliance reviewers."
              className={TEXTAREA_CLASS}
              onChange={(e) => setInternalNote(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled={readOnly}
              className="inline-flex items-center justify-center rounded border border-[#0063A3] bg-white px-4 py-2 text-xs !font-bold text-[#0063A3] hover:bg-[#F0F7FC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3] disabled:cursor-not-allowed disabled:!font-bold disabled:opacity-50"
              onClick={handleCancel}
            >
              <span className="!font-bold">Cancel</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              aria-disabled={isSubmitDisabled}
              className={[
                'rounded px-4 py-2 text-xs !font-bold text-white shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3] focus-visible:ring-offset-1 disabled:!font-bold',
                isSubmitDisabled
                  ? 'cursor-not-allowed bg-[#0063A3] opacity-50'
                  : 'cursor-pointer bg-[#0063A3] hover:bg-[#004f82]',
              ].join(' ')}
            >
              <span className="!font-bold">{primaryLabel}</span>
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
          'relative flex items-center gap-2 px-4 py-2 text-xs !font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3] focus-visible:ring-offset-1 disabled:!font-bold',
          radius,
          border,
          active
            ? 'z-10 bg-[#0063A3] text-white'
            : 'bg-white text-[#0063A3] hover:bg-[#F0F7FC]',
        ].join(' ')}
        onClick={onClick}
      >
        {icon}
        <span className="!font-bold">{label}</span>
      </button>
    </ActionButtonTooltip>
  );
}

