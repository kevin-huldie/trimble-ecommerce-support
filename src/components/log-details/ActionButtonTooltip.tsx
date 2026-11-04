import type { ReactNode } from 'react';

type ActionButtonTooltipProps = {
  tooltipId: string;
  content: string;
  children: ReactNode;
};

const TOOLTIP_BOX_CLASS = [
  'pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 flex-col whitespace-nowrap rounded bg-[#525866] px-3 py-1.5 text-[11px] font-normal leading-tight text-white shadow-md transition-opacity duration-150',
  "after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-[#525866] after:content-['']",
  'group-hover:flex group-focus-within:flex',
].join(' ');

export function ActionButtonTooltip({ tooltipId, content, children }: ActionButtonTooltipProps) {
  return (
    <span className="group relative inline-block">
      {children}
      <span id={tooltipId} role="tooltip" className={TOOLTIP_BOX_CLASS}>
        {content}
      </span>
    </span>
  );
}
