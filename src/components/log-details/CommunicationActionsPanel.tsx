import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  AUDIT_JUSTIFICATION_OPTIONS,
  auditJustificationLabel,
} from '../../data/auditJustifications';
import type { ActivityLogRecord } from '../../data/mockLogs';
import {
  createRepCommunicationEntry,
  type AuditTimelineEntry,
} from '../../types/communicationAudit';
import { InlineFieldError } from '../InlineFieldError';
import {
  RecipientChipInput,
  type RecipientChipModel,
} from '../RecipientChipInput';
import { ValidationLiveRegion } from '../ValidationLiveRegion';
import { ActionButtonTooltip } from './ActionButtonTooltip';

type CommActionTab = 'resend' | 'reply' | 'forward';

const ACTION_TYPE_TOOLTIPS: Record<CommActionTab, string> = {
  resend: 'Re-send original email to customer',
  reply: 'Send custom response to customer',
  forward: 'Forward thread to internal team',
};

const ACTION_BUTTON_ARIA_LABELS: Record<CommActionTab, string> = {
  resend: 'Resend Email: Re-send original email to customer',
  reply: 'Reply: Send custom response to customer',
  forward: 'Forward Email: Forward thread to internal team',
};

const COMM_FIELD_BASE =
  'h-10 w-full rounded border border-[#CBCDD6] px-3 py-2 text-xs text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#0063A3]';
const COMM_FIELD_LOCKED =
  'cursor-not-allowed bg-[#E2E8F0] text-[#525866] border border-[#CBCDD6]';
const COMM_FIELD_EDITABLE = 'bg-white text-[#121212] border border-[#CBCDD6]';

const FORWARD_TO_ERROR = 'One or more recipient email addresses are invalid.';
const SUBJECT_REQUIRED_ERROR = 'Subject line is required.';

type CommunicationActionsPanelProps = {
  log: ActivityLogRecord;
  onCommunicationLogged: (entry: AuditTimelineEntry) => void;
  /** When true, form controls are non-interactive (horizon / scope preview). */
  readOnly?: boolean;
};

function defaultSubjectForTab(tab: CommActionTab, originalSubject: string): string {
  switch (tab) {
    case 'reply':
      return `Re: ${originalSubject}`;
    case 'forward':
      return `Fwd: ${originalSubject}`;
    default:
      return `Resend: ${originalSubject}`;
  }
}

export function CommunicationActionsPanel({
  log,
  onCommunicationLogged,
  readOnly = false,
}: CommunicationActionsPanelProps) {
  const [activeTab, setActiveTab] = useState<CommActionTab>('resend');
  const [showCcBcc, setShowCcBcc] = useState(true);
  const [lockedRecipientEmail] = useState(log.recipientEmail);
  const [forwardToChips, setForwardToChips] = useState<RecipientChipModel[]>([]);
  const [ccChips, setCcChips] = useState<RecipientChipModel[]>([]);
  const [bccChips, setBccChips] = useState<RecipientChipModel[]>([]);
  const [auditJustification, setAuditJustification] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [subjectLine, setSubjectLine] = useState(() =>
    defaultSubjectForTab('resend', log.subject),
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [subjectTouched, setSubjectTouched] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');

  const activeAction = activeTab;
  const isToReadOnly = activeAction === 'resend' || activeAction === 'reply';
  const isSubjectReadOnly = activeAction === 'resend';

  const primaryLabel =
    activeTab === 'resend' ? 'Resend email' : activeTab === 'reply' ? 'Send reply' : 'Forward email';

  const forwardToInvalid =
    activeAction === 'forward'
    && (forwardToChips.length === 0 || forwardToChips.some((c) => !c.valid));

  const ccInvalid = ccChips.some((c) => !c.valid);
  const bccInvalid = bccChips.some((c) => !c.valid);
  const auditMissing = auditJustification === '';
  const subjectEmpty = !isSubjectReadOnly && subjectLine.trim() === '';
  const showSubjectError = subjectEmpty && (subjectTouched || submitAttempted);
  const auditInvalid = submitAttempted && auditMissing;

  const formHasErrors =
    auditMissing || ccInvalid || bccInvalid || forwardToInvalid || subjectEmpty;

  const validationAnnouncement = useMemo(() => {
    if (forwardToInvalid) return FORWARD_TO_ERROR;
    if (ccInvalid || bccInvalid) return 'Invalid email address in CC/BCC list.';
    if (showSubjectError) return SUBJECT_REQUIRED_ERROR;
    if (auditInvalid) return 'Select an audit justification before sending.';
    return '';
  }, [forwardToInvalid, ccInvalid, bccInvalid, showSubjectError, auditInvalid]);

  useEffect(() => {
    if (validationAnnouncement) setLiveMessage(validationAnnouncement);
  }, [validationAnnouncement]);

  const selectTab = useCallback(
    (tab: CommActionTab) => {
      setActiveTab(tab);
      setForwardToChips([]);
      setSubjectLine(defaultSubjectForTab(tab, log.subject));
      setSubmitAttempted(false);
      setSubjectTouched(false);
    },
    [log.subject],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (readOnly) return;
    setSubmitAttempted(true);
    setSubjectTouched(true);
    if (formHasErrors) return;

    const recipient = isToReadOnly
      ? lockedRecipientEmail
      : forwardToChips.map((c) => c.address).join(', ');

    const justification = auditJustificationLabel(auditJustification);

    const entry = createRepCommunicationEntry({
      tab: activeTab,
      destinationEmail: recipient,
      justification,
      notes: internalNote.trim() || undefined,
    });

    onCommunicationLogged(entry);
    setSubmitAttempted(false);
    setSubjectTouched(false);
    setAuditJustification('');
    setInternalNote('');
    setForwardToChips([]);
  };

  return (
    <section
      aria-labelledby="communication-actions-heading"
      className="w-full space-y-4 rounded-lg border border-[#CBCDD6] bg-white p-6"
    >
      <ValidationLiveRegion message={liveMessage} />
      <h2 id="communication-actions-heading" className="text-sm font-bold text-[#121212]">
        Communication Actions
      </h2>

      {readOnly ? (
        <p className="rounded border border-[#CBCDD6] bg-[#F8F9FA] px-3 py-2 text-[11px] text-[#525866]">
          Communication actions are read-only for the current product horizon preview.
        </p>
      ) : null}

      <fieldset disabled={readOnly} className="min-w-0 border-0 p-0">
      <div
        className="inline-flex rounded-md shadow-sm"
        role="group"
        aria-label="Communication Action Types"
      >
        <SegmentTab
          tabId="resend"
          position="first"
          active={activeTab === 'resend'}
          label="Resend Email"
          tooltip={ACTION_TYPE_TOOLTIPS.resend}
          ariaLabel={ACTION_BUTTON_ARIA_LABELS.resend}
          onClick={() => selectTab('resend')}
        />
        <SegmentTab
          tabId="reply"
          position="middle"
          active={activeTab === 'reply'}
          label="Reply"
          tooltip={ACTION_TYPE_TOOLTIPS.reply}
          ariaLabel={ACTION_BUTTON_ARIA_LABELS.reply}
          onClick={() => selectTab('reply')}
        />
        <SegmentTab
          tabId="forward"
          position="last"
          active={activeTab === 'forward'}
          label="Forward Email"
          tooltip={ACTION_TYPE_TOOLTIPS.forward}
          ariaLabel={ACTION_BUTTON_ARIA_LABELS.forward}
          onClick={() => selectTab('forward')}
        />
      </div>

      <form className="flex w-full flex-col gap-3 pt-2" onSubmit={handleSubmit} noValidate>
        {isToReadOnly ? (
          <div className="flex flex-col gap-1">
            <label htmlFor="comm-to-recipient" className="text-xs font-bold text-[#121212]">
              To <span className="text-[#DA212C]">*</span>
            </label>
            <input
              id="comm-to-recipient"
              type="text"
              readOnly
              disabled
              aria-readonly
              value={lockedRecipientEmail}
              className={[COMM_FIELD_BASE, COMM_FIELD_LOCKED].join(' ')}
            />
          </div>
        ) : (
          <RecipientChipInput
            label="To"
            required
            inputId="comm-to-forward"
            chips={forwardToChips}
            onChipsChange={setForwardToChips}
            placeholder="Add recipient emails separated by commas"
            invalidListMessage={FORWARD_TO_ERROR}
            externalInvalid={
              forwardToInvalid && (submitAttempted || forwardToChips.length > 0)
            }
            externalErrorMessage={
              forwardToInvalid && (submitAttempted || forwardToChips.length > 0)
                ? FORWARD_TO_ERROR
                : undefined
            }
          />
        )}

        <button
          type="button"
          className="w-fit text-xs font-bold text-[#121212] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]"
          aria-expanded={showCcBcc}
          onClick={() => setShowCcBcc((open) => !open)}
        >
          {showCcBcc ? '- Hide CC / BCC' : '+ Show CC / BCC'}
        </button>

        {showCcBcc ? (
          <>
            <RecipientChipInput
              label="CC"
              inputId="comm-cc-recipients"
              chips={ccChips}
              onChipsChange={setCcChips}
              placeholder="Add CC emails separated by commas"
            />
            <RecipientChipInput
              label="BCC"
              inputId="comm-bcc-recipients"
              chips={bccChips}
              onChipsChange={setBccChips}
              placeholder="Add BCC emails separated by commas"
            />
          </>
        ) : null}

        <div className="flex flex-col gap-1">
          <label htmlFor="audit-justification" className="text-xs font-bold text-[#121212]">
            Audit justification <span className="text-[#DA212C]">*</span>
          </label>
          <div className="relative">
            <select
              id="audit-justification"
              value={auditJustification}
              aria-invalid={auditInvalid || undefined}
              aria-describedby={auditInvalid ? 'audit-justification-error' : undefined}
              className={[
                'h-10 w-full cursor-pointer appearance-none rounded border bg-white pl-3 pr-9 text-xs text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#0063A3]',
                auditInvalid ? 'border-[#DA212C] focus:ring-[#DA212C]' : 'border-[#CBCDD6]',
              ].join(' ')}
              onChange={(e) => setAuditJustification(e.target.value)}
            >
              {AUDIT_JUSTIFICATION_OPTIONS.map((opt) => (
                <option key={opt.value || 'placeholder'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#525866]"
              aria-hidden
            />
          </div>
          {auditInvalid ? (
            <InlineFieldError
              id="audit-justification-error"
              message="Select an audit justification before sending."
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="comm-subject" className="text-xs font-bold text-[#121212]">
            Subject Line
          </label>
          <input
            id="comm-subject"
            type="text"
            readOnly={isSubjectReadOnly}
            disabled={isSubjectReadOnly}
            aria-readonly={isSubjectReadOnly ? true : undefined}
            aria-invalid={showSubjectError ? true : undefined}
            aria-describedby={showSubjectError ? 'comm-subject-error' : undefined}
            value={subjectLine}
            className={[
              COMM_FIELD_BASE,
              isSubjectReadOnly ? COMM_FIELD_LOCKED : COMM_FIELD_EDITABLE,
              showSubjectError ? 'border-[#DA212C] focus:ring-[#DA212C]' : '',
            ].join(' ')}
            onChange={(e) => {
              if (!isSubjectReadOnly) setSubjectLine(e.target.value);
            }}
            onBlur={() => setSubjectTouched(true)}
          />
          {showSubjectError ? (
            <InlineFieldError id="comm-subject-error" message={SUBJECT_REQUIRED_ERROR} />
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="internal-audit-note" className="text-xs font-bold text-[#121212]">
            Internal audit note <span className="font-normal text-[#525866]">(Optional)</span>
          </label>
          <textarea
            id="internal-audit-note"
            rows={3}
            value={internalNote}
            placeholder="Add context for secondary recipients or compliance reviewers."
            className="w-full resize-y rounded border border-[#CBCDD6] bg-white px-3 py-2 text-xs text-[#121212] placeholder:text-[#525866] focus:outline-none focus:ring-2 focus:ring-[#0063A3]"
            onChange={(e) => setInternalNote(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded border border-[#0063A3] bg-white px-4 text-xs font-semibold text-[#0063A3] hover:bg-[#F0F7FC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={readOnly || formHasErrors}
            className={[
              'inline-flex h-9 items-center justify-center rounded px-4 text-xs font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3] focus-visible:ring-offset-1',
              formHasErrors
                ? 'cursor-not-allowed bg-[#0063A3] opacity-50'
                : 'bg-[#0063A3] hover:bg-[#004B7A]',
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

function SegmentTab({
  tabId,
  position,
  active,
  label,
  tooltip,
  ariaLabel,
  onClick,
}: {
  tabId: CommActionTab;
  position: 'first' | 'middle' | 'last';
  active: boolean;
  label: string;
  tooltip: string;
  ariaLabel: string;
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
      : 'border-t border-b border-r border-[#0063A3] -ml-px';

  const tooltipDomId = `comm-action-tooltip-${tabId}`;

  return (
    <ActionButtonTooltip tooltipId={tooltipDomId} content={tooltip}>
      <button
        type="button"
        aria-pressed={active}
        aria-label={ariaLabel}
        className={[
          'inline-flex h-9 items-center gap-1.5 px-4 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3] focus-visible:ring-offset-1',
          radius,
          border,
          active
            ? 'relative z-10 bg-[#0063A3] font-semibold text-white'
            : 'bg-white font-semibold text-[#0063A3] hover:bg-[#F0F7FC]',
        ].join(' ')}
        onClick={onClick}
      >
        {label}
      </button>
    </ActionButtonTooltip>
  );
}
