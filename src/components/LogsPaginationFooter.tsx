import { ChevronDown, ChevronRight, ChevronsRight } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { formatCount } from '../utils/formatCount';

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;
const MAX_PAGE_BUTTONS = 5;

type LogsPaginationFooterProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

function buildPageWindow(current: number, totalPages: number): number[] {
  if (totalPages <= MAX_PAGE_BUTTONS) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  let start = Math.max(1, current - 2);
  const end = Math.min(totalPages, start + MAX_PAGE_BUTTONS - 1);
  start = Math.max(1, end - MAX_PAGE_BUTTONS + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function LogsPaginationFooter({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: LogsPaginationFooterProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = totalCount === 0 ? 0 : Math.min(safePage * pageSize, totalCount);
  const pageWindow = useMemo(
    () => buildPageWindow(safePage, totalPages),
    [safePage, totalPages],
  );

  const [pageDraft, setPageDraft] = useState(String(safePage));

  useEffect(() => {
    setPageDraft(String(safePage));
  }, [safePage]);

  const submitPageJump = (e: FormEvent) => {
    e.preventDefault();
    const parsed = Number.parseInt(pageDraft, 10);
    if (!Number.isFinite(parsed)) return;
    onPageChange(Math.min(totalPages, Math.max(1, parsed)));
  };

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-[#CBCDD6] px-4 py-3 text-xs text-[#525866]">
      <div className="flex items-center gap-2">
        <span className="text-[#121212]">Results:</span>
        <div className="relative">
          <select
            value={pageSize}
            aria-label="Results per page"
            className="h-8 cursor-pointer appearance-none rounded border border-[#CBCDD6] bg-white pl-2 pr-7 text-xs text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#0063A3]"
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#525866]"
            aria-hidden
          />
        </div>
      </div>

      <p className="tabular-nums" aria-live="polite">
        Showing {formatCount(rangeStart)}-{formatCount(rangeEnd)} / {formatCount(totalCount)}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-0.5">
          {pageWindow.map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              aria-label={`Page ${pageNum}`}
              aria-current={pageNum === safePage ? 'page' : undefined}
              className={[
                'inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded border px-1.5 text-xs font-semibold tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]',
                pageNum === safePage
                  ? 'border-[#0063A3] bg-[#0063A3] text-white'
                  : 'border-[#CBCDD6] bg-white text-[#121212] hover:bg-[#F1F1F6]',
              ].join(' ')}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          ))}
          <button
            type="button"
            aria-label="Next page"
            disabled={safePage >= totalPages}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#CBCDD6] bg-white text-[#121212] disabled:opacity-40 enabled:hover:bg-[#F1F1F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]"
            onClick={() => onPageChange(safePage + 1)}
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Last page"
            disabled={safePage >= totalPages}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#CBCDD6] bg-white text-[#121212] disabled:opacity-40 enabled:hover:bg-[#F1F1F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]"
            onClick={() => onPageChange(totalPages)}
          >
            <ChevronsRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <form className="flex items-center gap-1 text-[#121212]" onSubmit={submitPageJump}>
          <span>Page</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={pageDraft}
            aria-label="Jump to page"
            className="h-7 w-10 rounded border border-[#CBCDD6] bg-white px-1 text-center text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0063A3]"
            onChange={(e) => setPageDraft(e.target.value)}
            onBlur={() => setPageDraft(String(safePage))}
          />
          <span className="tabular-nums">/ {totalPages}</span>
        </form>
      </div>
    </div>
  );
}
