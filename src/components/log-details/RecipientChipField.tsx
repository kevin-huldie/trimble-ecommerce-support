import type { ReactNode } from 'react';
import { isValidEmailAddress, parseEmailListInput } from '../../utils/emailValidation';

export const RECIPIENT_CHIP_FORMAT_ERROR =
  'Invalid email address format. Ensure domain includes a valid extension (e.g., name@company.com).';

const CHIP_CONTAINER_BASE =
  'flex w-full min-h-[42px] items-center justify-between rounded border bg-white px-3 py-1.5';
const CHIP_CONTAINER_DEFAULT = 'border-[#C4C9D0]';
const CHIP_CONTAINER_DANGER = 'border-[#A81E1E]';

type RecipientChipFieldProps = {
  id: string;
  errorId: string;
  label: ReactNode;
  value: string;
  onChange: (next: string) => void;
  showError: boolean;
  useChipLayout: boolean;
  disabled?: boolean;
  placeholder?: string;
  inlineErrorMessage?: string;
};

function removeAddress(raw: string, address: string): string {
  return parseEmailListInput(raw)
    .filter((part) => part !== address)
    .join(', ');
}

function ValidRecipientChip({
  address,
  onRemove,
  disabled,
}: {
  address: string;
  onRemove: () => void;
  disabled?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#CED4DA] bg-[#DFE3E8] px-2.5 py-1 text-xs text-gray-900">
      <span>{address}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={onRemove}
        className="text-gray-600 hover:text-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Remove ${address}`}
      >
        ✕
      </button>
    </span>
  );
}

function InvalidRecipientChip({
  address,
  onRemove,
  disabled,
}: {
  address: string;
  onRemove: () => void;
  disabled?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A81E1E] bg-[#FDE7E7] px-2.5 py-1 text-xs font-medium text-[#A81E1E]">
      <span aria-hidden className="text-[11px] font-bold">
        !
      </span>
      <span>{address}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={onRemove}
        className="font-bold text-[#A81E1E] hover:text-red-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Remove invalid recipient ${address}`}
      >
        ✕
      </button>
    </span>
  );
}

function RecipientChipInlineError({ id, message }: { id: string; message: string }) {
  return (
    <p
      id={id}
      role="alert"
      className="mt-1 flex items-center gap-1.5 text-xs font-normal text-[#A81E1E]"
    >
      <span
        aria-hidden
        className="inline-block h-3.5 w-3.5 rounded-full border border-[#A81E1E] text-center text-[10px] font-bold leading-3"
      >
        !
      </span>
      {message}
    </p>
  );
}

export function shouldUseRecipientChipLayout(
  raw: string,
  recipientInlineSimulation: boolean,
): boolean {
  if (recipientInlineSimulation) {
    return true;
  }
  const parts = parseEmailListInput(raw);
  if (parts.length === 0) {
    return false;
  }
  return parts.some((part) => !isValidEmailAddress(part));
}

export function RecipientChipField({
  id,
  errorId,
  label,
  value,
  onChange,
  showError,
  useChipLayout,
  disabled = false,
  placeholder = 'Add emails separated by commas',
  inlineErrorMessage = RECIPIENT_CHIP_FORMAT_ERROR,
}: RecipientChipFieldProps) {
  const tokens = parseEmailListInput(value);

  if (!useChipLayout) {
    return (
      <div>
        <label htmlFor={id} className="mb-1 block text-xs font-medium text-gray-900">
          {label}
        </label>
        <input
          id={id}
          type="text"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={showError || undefined}
          aria-describedby={showError ? errorId : undefined}
          className={[
            'w-full rounded border border-[#C4C9D0] bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0063A3] focus:outline-none focus:ring-1 focus:ring-[#0063A3]',
            showError ? 'border-[#DA212C] focus:border-[#DA212C] focus:ring-[#DA212C]' : '',
          ].join(' ')}
          onChange={(e) => onChange(e.target.value)}
        />
        {showError ? (
          <RecipientChipInlineError id={errorId} message={inlineErrorMessage} />
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <label id={`${id}-label`} htmlFor={id} className="mb-1 block text-xs font-medium text-gray-900">
        {label}
      </label>
      <div
        id={id}
        role="group"
        aria-labelledby={`${id}-label`}
        aria-invalid={showError || undefined}
        aria-describedby={showError ? errorId : undefined}
        className={[
          CHIP_CONTAINER_BASE,
          showError ? CHIP_CONTAINER_DANGER : CHIP_CONTAINER_DEFAULT,
          disabled ? 'cursor-not-allowed opacity-60' : '',
        ].join(' ')}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {tokens.map((address) => {
            const valid = isValidEmailAddress(address);
            const remove = () => onChange(removeAddress(value, address));
            return valid ? (
              <ValidRecipientChip
                key={address}
                address={address}
                disabled={disabled}
                onRemove={remove}
              />
            ) : (
              <InvalidRecipientChip
                key={address}
                address={address}
                disabled={disabled}
                onRemove={remove}
              />
            );
          })}
          {tokens.length === 0 ? (
            <span className="text-xs text-gray-500">{placeholder}</span>
          ) : null}
        </div>
        <span
          className="pointer-events-none shrink-0 select-none pl-2 text-xs text-gray-500"
          aria-hidden
        >
          ▼
        </span>
      </div>
      {showError ? (
        <RecipientChipInlineError id={errorId} message={inlineErrorMessage} />
      ) : null}
    </div>
  );
}
