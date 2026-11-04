import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { formatCount } from '../utils/formatCount';

type TableSummaryToolbarProps = {
  totalCount: number;
  rangeStart: number;
  rangeEnd: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onRefresh: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
};

export function TableSummaryToolbar({
  totalCount,
  rangeStart,
  rangeEnd,
  canGoPrev,
  canGoNext,
  onRefresh,
  onPrevPage,
  onNextPage,
}: TableSummaryToolbarProps) {
  const rangeLabel =
    totalCount === 0
      ? '0 of 0'
      : `${rangeStart}-${rangeEnd} of ${totalCount.toLocaleString()}`;

  return (
    <div className="mt-0 flex w-full items-center justify-between border-b border-[#CBCDD6] px-4 py-3">
      <p className="text-sm font-bold text-[#121212]">
        Activity Logs ({formatCount(totalCount)})
      </p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Refresh activity logs"
          className="flex h-8 w-8 items-center justify-center rounded border border-[#525866] bg-white text-[#121212] transition-colors hover:bg-[#F1F1F6] focus:outline-none focus:ring-2 focus:ring-[#0063A3]"
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
        </button>

        <span className="text-xs font-normal tabular-nums text-[#121212]">{rangeLabel}</span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canGoPrev}
            aria-label="Previous page"
            className="flex h-8 w-8 items-center justify-center rounded border border-[#CBCDD6] bg-white text-[#CBCDD6] transition-colors hover:enabled:border-[#525866] hover:enabled:bg-[#F1F1F6] hover:enabled:text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#0063A3] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onPrevPage}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>

          <button
            type="button"
            disabled={!canGoNext}
            aria-label="Next page"
            className="flex h-8 w-8 items-center justify-center rounded border border-[#525866] bg-white text-[#121212] transition-colors hover:enabled:bg-[#F1F1F6] focus:outline-none focus:ring-2 focus:ring-[#0063A3] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onNextPage}
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
