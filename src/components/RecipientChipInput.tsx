import { useCallback, useId, useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { isValidEmailAddress, parseEmailListInput } from '../utils/emailValidation';

export type RecipientChipModel = {
  address: string;
  valid: boolean;
};

export const RECIPIENT_CHIP_INLINE_ERROR_MESSAGE =
  'Invalid email address. Ensure domain includes a valid extension (e.g., name@company.com).';

type RecipientChipInputProps = {
  label: string;
  chips: RecipientChipModel[];
  onChipsChange: (chips: RecipientChipModel[]) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  inputId?: string;
  /** Defaults to `{inputId}-error-msg`. */
  errorMessageId?: string;
  invalidListMessage?: string;
  externalInvalid?: boolean;
  externalErrorMessage?: string;
};

export function RecipientChipInput({
  label,
  chips,
  onChipsChange,
  placeholder = 'Add emails separated by commas',
  disabled = false,
  required = false,
  inputId: inputIdProp,
  errorMessageId: errorMessageIdProp,
  invalidListMessage = RECIPIENT_CHIP_INLINE_ERROR_MESSAGE,
  externalInvalid = false,
  externalErrorMessage,
}: RecipientChipInputProps) {
  const generatedId = useId();
  const fieldId = inputIdProp ?? generatedId;
  const errorMessageId = errorMessageIdProp ?? `${fieldId}-error-msg`;
  const [draft, setDraft] = useState('');

  const hasInvalidChips = useMemo(() => chips.some((c) => !c.valid), [chips]);
  const containerInvalid = hasInvalidChips || externalInvalid;

  const commitDraft = useCallback(
    (raw: string) => {
      const candidates = parseEmailListInput(raw);
      if (candidates.length === 0) {
        setDraft('');
        return;
      }

      const next = [...chips];
      for (const candidate of candidates) {
        const address = candidate.trim();
        const valid = isValidEmailAddress(address);
        const exists = next.some((c) => c.address.toLowerCase() === address.toLowerCase());
        if (!exists) {
          next.push({ address, valid });
        }
      }
      onChipsChange(next);
      setDraft('');
    },
    [chips, onChipsChange],
  );

  const removeChip = (address: string) => {
    onChipsChange(chips.filter((c) => c.address !== address));
  };

  const containerErrorMessage = hasInvalidChips
    ? invalidListMessage
    : externalErrorMessage;

  return (
    <div className="flex w-full min-w-0 flex-col gap-1">
      <label htmlFor={fieldId} className="text-xs font-semibold text-[#121212]">
        {label}
        {required ? <span className="text-[#DA212C]"> *</span> : null}
      </label>
      <div
        className={[
          'flex min-h-10 w-full min-w-0 flex-wrap items-center gap-1.5 rounded bg-white px-2 py-1.5',
          containerInvalid
            ? 'border border-[#A81E1E] focus-within:border-[#A81E1E] focus-within:ring-1 focus-within:ring-[#A81E1E]'
            : 'border border-[#CBCDD6] focus-within:border-[#0063A3] focus-within:ring-1 focus-within:ring-[#0063A3]',
          disabled ? 'cursor-not-allowed bg-[#F1F1F6] text-[#121212]' : '',
        ].join(' ')}
      >
        {chips.map((chip) => (
          <span
            key={chip.address}
            className={
              chip.valid
                ? 'inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#CED4DA] bg-[#E9ECEF] px-2.5 py-1 text-xs text-[#212529]'
                : 'inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#A81E1E] bg-[#FDE7E7] px-2.5 py-1 text-xs font-medium text-[#A81E1E]'
            }
          >
            {!chip.valid ? (
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
            ) : null}
            <span className="truncate">{chip.address}</span>
            {!disabled ? (
              <button
                type="button"
                aria-label={`Remove ${chip.address}`}
                className={
                  chip.valid
                    ? 'cursor-pointer rounded p-0.5 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]'
                    : 'cursor-pointer rounded p-0.5 text-[#A81E1E] hover:text-red-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]'
                }
                onClick={() => removeChip(chip.address)}
              >
                <span aria-hidden="true">✕</span>
              </button>
            ) : null}
          </span>
        ))}
        {!disabled ? (
          <input
            id={fieldId}
            type="text"
            value={draft}
            placeholder={chips.length === 0 ? placeholder : ''}
            aria-invalid={containerInvalid || undefined}
            aria-describedby={containerErrorMessage ? errorMessageId : undefined}
            className="min-w-[8rem] flex-1 border-0 bg-transparent py-0.5 text-xs text-[#121212] placeholder:text-[#525866] focus:outline-none focus:ring-0"
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => commitDraft(draft)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                commitDraft(draft);
              }
              if (e.key === 'Backspace' && draft === '' && chips.length > 0) {
                const last = chips[chips.length - 1];
                if (last) removeChip(last.address);
              }
            }}
          />
        ) : null}
      </div>
      {containerErrorMessage ? (
        <p
          id={errorMessageId}
          role="alert"
          className="mt-1 flex items-center gap-1 text-xs text-[#A81E1E]"
        >
          <span aria-hidden="true">⚠</span>
          {containerErrorMessage}
        </p>
      ) : (
        <p className="min-h-[1rem]" aria-hidden />
      )}
    </div>
  );
}
