import { useCallback, useId, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { isValidEmailAddress, parseEmailListInput } from '../utils/emailValidation';
import { InlineFieldError } from './InlineFieldError';

export type RecipientChipModel = {
  address: string;
  valid: boolean;
};

type RecipientChipInputProps = {
  label: string;
  chips: RecipientChipModel[];
  onChipsChange: (chips: RecipientChipModel[]) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  inputId?: string;
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
  invalidListMessage = 'Invalid email address in CC/BCC list.',
  externalInvalid = false,
  externalErrorMessage,
}: RecipientChipInputProps) {
  const generatedId = useId();
  const fieldId = inputIdProp ?? generatedId;
  const errorId = `${fieldId}-error`;
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

  const containerErrorMessage = externalErrorMessage
    ?? (hasInvalidChips ? invalidListMessage : undefined);

  return (
    <div className="flex w-full min-w-0 flex-col gap-1">
      <label htmlFor={fieldId} className="text-xs font-semibold text-[#121212]">
        {label}
        {required ? <span className="text-[#DA212C]"> *</span> : null}
      </label>
      <div
        className={[
          'flex min-h-10 w-full min-w-0 flex-wrap items-center gap-1.5 rounded border bg-white px-2 py-1.5',
          containerInvalid ? 'border-[#DA212C]' : 'border-[#CBCDD6]',
          disabled ? 'cursor-not-allowed bg-[#F1F1F6] text-[#121212]' : '',
        ].join(' ')}
      >
        {chips.map((chip) => (
          <span
            key={chip.address}
            className={[
              'inline-flex max-w-full items-center gap-1 rounded px-2 py-0.5 text-xs',
              chip.valid
                ? 'border border-[#0063A3] bg-[#E5F1F8] text-[#121212]'
                : 'border border-[#DA212C] bg-[#FDF2F2] text-[#DA212C]',
            ].join(' ')}
          >
            <span className="truncate">{chip.address}</span>
            {!disabled ? (
              <button
                type="button"
                aria-label={`Remove ${chip.address}`}
                className={[
                  'rounded p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]',
                  chip.valid ? 'text-[#525866] hover:text-[#121212]' : 'text-[#DA212C]',
                ].join(' ')}
                onClick={() => removeChip(chip.address)}
              >
                <X className="h-3.5 w-3.5" aria-hidden />
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
            aria-describedby={containerErrorMessage ? errorId : undefined}
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
        <InlineFieldError id={errorId} message={containerErrorMessage} />
      ) : (
        <p className="min-h-[1rem]" aria-hidden />
      )}
    </div>
  );
}
