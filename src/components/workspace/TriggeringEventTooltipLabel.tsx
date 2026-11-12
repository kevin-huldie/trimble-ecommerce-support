import {
  useCallback,
  useEffect,
  useState,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

type TriggeringEventTooltipLabelProps = {
  logId: string;
  triggeringEvent: string;
};

export function TriggeringEventTooltipLabel({
  logId,
  triggeringEvent,
}: TriggeringEventTooltipLabelProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = `tooltip-trigger-${logId}`;
  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;
    const onDocumentKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onDocumentKeyDown);
    return () => document.removeEventListener('keydown', onDocumentKeyDown);
  }, [open]);

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setOpen(false);
    }
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
    }
  };

  return (
    <div
      className="relative inline-block max-w-full"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={handleBlur}
    >
      {open ? (
        <div
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 box-border w-full min-w-0 rounded bg-[#1E2227] px-2.5 py-1 text-left text-xs text-white shadow-lg"
        >
          <span className="block font-medium leading-snug">{triggeringEvent}</span>
          <div
            aria-hidden
            className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-[#1E2227]"
          />
        </div>
      ) : null}

      <span
        tabIndex={0}
        aria-describedby={open ? tooltipId : undefined}
        className="line-clamp-2 inline-block cursor-default border-b border-dotted border-gray-400 text-xs font-medium leading-snug text-gray-900 focus:rounded-sm focus:outline-none focus:ring-1 focus:ring-[#0063A3]"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleTriggerKeyDown}
      >
        {triggeringEvent}
      </span>
    </div>
  );
}
