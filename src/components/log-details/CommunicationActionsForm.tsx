import { useCallback, useId, useState, type FormEvent, type KeyboardEvent } from 'react';
import type { ActivityLogRecord } from '../../data/mockLogs';
import { formatCommunicationSuccessToastMessage } from '../../utils/successToastMessages';
import { createRepCommunicationEntry, type AuditTimelineEntry } from '../../types/communicationAudit';
import { InlineFieldError } from '../InlineFieldError';
import { ValidationLiveRegion } from '../ValidationLiveRegion';

type CommActionTab = 'resend' | 'reply' | 'forward';

const TAB_LABELS: Record<CommActionTab, string> = {
  resend: 'Resend',
  reply: 'Reply',
  forward: 'Forward',
};

const COMM_FIELD_BASE =
  'h-10 w-full rounded-md border px-3 py-2 text-xs text-[#121212] focus:outline-none focus:ring-2';
const COMM_FIELD_LOCKED =
  'cursor-not-allowed border-[#CBCDD6] bg-[#F1F1F6] focus:ring-[#0063A3]';
const COMM_FIELD_EDITABLE = 'border-[#CBCDD6] bg-white focus:ring-[#0063A3]';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function defaultSubjectForTab(tab: CommActionTab, originalSubject: string): string {
  switch (tab) {
    case 'reply':
      return `RE: ${originalSubject}`;
    case 'forward':
      return `FWD: ${originalSubject}`;
    default:
      return `RESEND: ${originalSubject}`;
  }
}

type CommunicationActionsFormProps = {
  log: ActivityLogRecord;
  onCommunicationLogged: (entry: AuditTimelineEntry) => void;
  onSuccessToast: (message: string) => void;
};

export function CommunicationActionsForm({
  log,
  onCommunicationLogged,
  onSuccessToast,
}: CommunicationActionsFormProps) {
  const tablistId = useId();
  const [activeTab, setActiveTab] = useState<CommActionTab>('resend');
  const [recipientEmail, setRecipientEmail] = useState(log.recipientEmail);
  const [isEditingRecipient, setIsEditingRecipient] = useState(false);
  const [subjectLine, setSubjectLine] = useState(() => defaultSubjectForTab('resend', log.subject));
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');

  const isSubjectLocked = activeTab === 'resend';
  const recipientReadOnly =
    activeTab === 'forward' ? false : (activeTab === 'resend' || activeTab === 'reply') && !isEditingRecipient;

  const recipientInvalid =
    !recipientReadOnly && recipientEmail.trim() !== '' && !EMAIL_PATTERN.test(recipientEmail.trim());
  const recipientEmpty = recipientEmail.trim() === '';
  const showRecipientError =
    submitAttempted && (recipientEmpty || recipientInvalid) && activeTab === 'forward'
      ? recipientEmpty || recipientInvalid
      : submitAttempted && isEditingRecipient && (recipientEmpty || recipientInvalid);

  const subjectEmpty = !isSubjectLocked && subjectLine.trim() === '';
  const showSubjectError = submitAttempted && subjectEmpty;

  const selectTab = useCallback(
    (tab: CommActionTab) => {
      setActiveTab(tab);
      setRecipientEmail(log.recipientEmail);
      setIsEditingRecipient(false);
      setSubjectLine(defaultSubjectForTab(tab, log.subject));
      setSubmitAttempted(false);
      setIsConsentChecked(false);
    },
    [log.recipientEmail, log.subject],
  );

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, tab: CommActionTab) => {
    const order: CommActionTab[] = ['resend', 'reply', 'forward'];
    const index = order.indexOf(tab);
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectTab(order[(index + 1) % order.length]!);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectTab(order[(index - 1 + order.length) % order.length]!);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);

    const recipientOk =
      !recipientEmpty
      && !recipientInvalid
      && (activeTab === 'forward' || !isEditingRecipient || EMAIL_PATTERN.test(recipientEmail.trim()));

    if (!isConsentChecked || !recipientOk || subjectEmpty) {
      if (!isConsentChecked) {
        setLiveMessage('Accept the privacy and support protocols confirmation before sending.');
      } else if (showRecipientError || recipientEmpty || recipientInvalid) {
        setLiveMessage('Enter a valid recipient email address.');
      } else if (subjectEmpty) {
        setLiveMessage('Subject line is required.');
      }
      return;
    }

    const entry = createRepCommunicationEntry({
      tab: activeTab,
      destinationEmail: recipientEmail.trim(),
    });

    onCommunicationLogged(entry);
    onSuccessToast(
      formatCommunicationSuccessToastMessage(entry.actionBadge, entry.destinationEmail),
    );
    setSubmitAttempted(false);
    setIsConsentChecked(false);
    setIsEditingRecipient(false);
    setLiveMessage('');
  };

  const submitDisabled = !isConsentChecked;

  return (
    <section
      aria-labelledby="communication-actions-heading"
      className="flex w-full flex-col rounded-md border border-[#CBCDD6] bg-white p-6"
    >
      <ValidationLiveRegion message={liveMessage} />
      <h2 id="communication-actions-heading" className="mb-3 text-sm font-bold text-[#121212]">
        Communication actions
      </h2>

      <div
        id={tablistId}
        role="tablist"
        aria-label="Communication action mode"
        className="mb-4 inline-flex rounded-md shadow-sm"
      >
        {(['resend', 'reply', 'forward'] as const).map((tab, index, arr) => {
          const active = activeTab === tab;
          const radius =
            index === 0
              ? 'rounded-l-md rounded-r-none'
              : index === arr.length - 1
                ? 'rounded-r-md rounded-l-none'
                : 'rounded-none';
          const border =
            index === 0
              ? 'border border-[#0063A3]'
              : 'border-t border-b border-r border-[#0063A3] -ml-px';

          return (
            <button
              key={tab}
              type="button"
              role="tab"
              id={`comm-tab-${tab}`}
              aria-selected={active}
              aria-controls={`comm-tabpanel-${tab}`}
              tabIndex={active ? 0 : -1}
              className={[
                'inline-flex h-9 items-center px-4 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3] focus-visible:ring-offset-1',
                radius,
                border,
                active
                  ? 'relative z-10 bg-[#0063A3] font-bold text-white'
                  : 'bg-white font-semibold text-[#0063A3] hover:bg-[#E5F1F8]',
              ].join(' ')}
              onClick={() => selectTab(tab)}
              onKeyDown={(e) => handleTabKeyDown(e, tab)}
            >
              {TAB_LABELS[tab]}
            </button>
          );
        })}
      </div>

      <form className="flex w-full flex-col gap-3" onSubmit={handleSubmit} noValidate>
        <div
          role="tabpanel"
          id={`comm-tabpanel-${activeTab}`}
          aria-labelledby={`comm-tab-${activeTab}`}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="comm-to-recipient" className="text-xs font-semibold text-[#121212]">
                To (recipient email) <span className="text-[#DA212C]">*</span>
              </label>
              {(activeTab === 'resend' || activeTab === 'reply') && (
                <button
                  type="button"
                  className="text-xs font-semibold text-[#0063A3] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]"
                  onClick={() => setIsEditingRecipient((open) => !open)}
                  aria-pressed={isEditingRecipient}
                >
                  {isEditingRecipient ? 'Lock recipient' : 'Edit recipient'}
                </button>
              )}
            </div>
            <input
              id="comm-to-recipient"
              type="email"
              readOnly={recipientReadOnly}
              aria-readonly={recipientReadOnly ? true : undefined}
              value={recipientEmail}
              aria-invalid={showRecipientError ? true : undefined}
              aria-describedby={showRecipientError ? 'comm-to-error' : undefined}
              className={[
                COMM_FIELD_BASE,
                recipientReadOnly ? COMM_FIELD_LOCKED : COMM_FIELD_EDITABLE,
                showRecipientError ? 'border-[#DA212C] bg-[#FDF2F2] focus:ring-[#DA212C]' : '',
              ].join(' ')}
              onChange={(e) => {
                if (!recipientReadOnly) setRecipientEmail(e.target.value);
              }}
            />
            {showRecipientError ? (
              <InlineFieldError id="comm-to-error" message="Enter a valid recipient email address." />
            ) : null}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="comm-subject" className="text-xs font-semibold text-[#121212]">
              Subject line
            </label>
            <input
              id="comm-subject"
              type="text"
              readOnly={isSubjectLocked}
              aria-readonly={isSubjectLocked ? true : undefined}
              value={subjectLine}
              aria-invalid={showSubjectError ? true : undefined}
              aria-describedby={showSubjectError ? 'comm-subject-error' : undefined}
              className={[
                COMM_FIELD_BASE,
                isSubjectLocked ? COMM_FIELD_LOCKED : COMM_FIELD_EDITABLE,
                showSubjectError ? 'border-[#DA212C] focus:ring-[#DA212C]' : '',
              ].join(' ')}
              onChange={(e) => {
                if (!isSubjectLocked) setSubjectLine(e.target.value);
              }}
            />
            {showSubjectError ? (
              <InlineFieldError id="comm-subject-error" message="Subject line is required." />
            ) : null}
          </div>

          <div className="mt-1 flex items-start gap-2">
            <input
              id="rep-consent"
              type="checkbox"
              checked={isConsentChecked}
              aria-describedby="rep-consent-label"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#CBCDD6] text-[#0063A3] focus:ring-2 focus:ring-[#0063A3]"
              onChange={(e) => setIsConsentChecked(e.target.checked)}
            />
            <label id="rep-consent-label" htmlFor="rep-consent" className="text-xs text-[#121212]">
              I confirm this communication complies with Trimble Privacy Policy and Authorized
              Customer Support protocols. <span className="text-[#DA212C]">*</span>
            </label>
          </div>

          {submitAttempted && !isConsentChecked ? (
            <p className="text-[11px] font-semibold text-[#DA212C]" role="alert">
              Accept the confirmation checkbox before sending communication.
            </p>
          ) : null}

          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-md border border-[#CBCDD6] bg-white px-4 text-xs font-semibold text-[#121212] hover:bg-[#F1F1F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]"
              onClick={() => {
                setRecipientEmail(log.recipientEmail);
                setIsEditingRecipient(false);
                setIsConsentChecked(false);
                setSubmitAttempted(false);
                selectTab(activeTab);
              }}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={submitDisabled}
              className={[
                'inline-flex h-9 items-center justify-center rounded-md px-4 text-xs font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3] focus-visible:ring-offset-1',
                submitDisabled
                  ? 'cursor-not-allowed bg-[#0063A3] opacity-50'
                  : 'bg-[#0063A3] hover:bg-[#004f87]',
              ].join(' ')}
            >
              Send Communication
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
