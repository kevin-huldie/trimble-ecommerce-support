import { AlertCircle } from 'lucide-react';

type InlineFieldErrorProps = {
  id: string;
  message: string;
};

export function InlineFieldError({ id, message }: InlineFieldErrorProps) {
  return (
    <p
      id={id}
      className="mt-1 flex items-center gap-1 text-[11px] text-[#DA212C]"
      role="alert"
    >
      <AlertCircle className="h-3 w-3 shrink-0" aria-hidden />
      <span>{message}</span>
    </p>
  );
}
