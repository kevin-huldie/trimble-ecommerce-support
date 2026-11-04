import { useEffect, useId, useRef, type FormEvent } from 'react';
import { X } from 'lucide-react';

type ResetFrequencyCapModalProps = {
  open: boolean;
  productLabel: string;
  onClose: () => void;
  onConfirm: (justification: string) => void;
};

export function ResetFrequencyCapModal({
  open,
  productLabel,
  onClose,
  onConfirm,
}: ResetFrequencyCapModalProps) {
  const titleId = useId();
  const descId = useId();
  const textareaId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      queueMicrotask(() => textareaRef.current?.focus());
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const justification = (form.elements.namedItem('justification') as HTMLTextAreaElement).value.trim();
    if (!justification) return;
    onConfirm(justification);
    form.reset();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="w-full max-w-lg rounded border border-[#E0E0E0] bg-white p-0 shadow-[0_2px_8px_rgba(0,0,0,0.12)] backdrop:bg-black/40"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex items-start justify-between border-b border-[#E0E0E0] px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-[#252525]">
              Reset frequency cap
            </h2>
            <p id={descId} className="mt-1 text-sm text-[#525866]">
              Authorize a one-time reset for{' '}
              <span className="font-semibold text-[#252525]">{productLabel}</span>. This action is
              logged for audit.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#525866] hover:bg-[#F4F5F7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="px-5 py-4">
          <label htmlFor={textareaId} className="mb-1 block text-sm font-semibold text-[#252525]">
            Business justification <span className="text-[#DA212C]">*</span>
          </label>
          <textarea
            ref={textareaRef}
            id={textareaId}
            name="justification"
            required
            rows={4}
            placeholder="Describe why this customer is authorized for a frequency cap reset…"
            className="w-full rounded border border-[#E0E0E0] px-3 py-2 text-sm text-[#252525] placeholder:text-[#525866] focus:border-[#0063A3] focus:outline-none focus:ring-1 focus:ring-[#0063A3]"
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-[#E0E0E0] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-[#0063A3] bg-white px-4 py-2 text-sm font-semibold text-[#0063A3] hover:bg-[#F4F5F7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3] focus-visible:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded bg-[#0063A3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004B7A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3] focus-visible:ring-offset-2"
          >
            Confirm reset
          </button>
        </div>
      </form>
    </dialog>
  );
}
