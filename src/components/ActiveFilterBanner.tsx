import { X } from 'lucide-react';
import type { ActivityLogFilters } from '../data/mockLogs';
import { DELIVERY_STATUS_OPTIONS } from '../data/mockLogs';

type ActiveFilterBannerProps = {
  filters: ActivityLogFilters;
  onClearAll: () => void;
  onClearSearch: () => void;
  onRemoveRecipientEmail: () => void;
  onRemoveCustomerName: () => void;
  onRemoveOrderId: () => void;
  onRemoveTriggeringEvent: () => void;
  onRemoveDeliveryStatus: () => void;
  onRemoveEventCategory: () => void;
  onRemoveDateRange: () => void;
  onRemoveResendHistory: () => void;
};

function deliveryChipLabel(value: ActivityLogFilters['deliveryStatus']): string {
  return DELIVERY_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function ActiveFilterBanner({
  filters,
  onClearAll,
  onClearSearch,
  onRemoveRecipientEmail,
  onRemoveCustomerName,
  onRemoveOrderId,
  onRemoveTriggeringEvent,
  onRemoveDeliveryStatus,
  onRemoveEventCategory,
  onRemoveDateRange,
  onRemoveResendHistory,
}: ActiveFilterBannerProps) {
  const trimmedSearch = filters.searchQuery.trim();
  const hasSearch = trimmedSearch.length > 0;
  const hasRecipientEmail = filters.recipientEmail.trim().length > 0;
  const hasCustomerName = filters.customerName.trim().length > 0;
  const hasOrderId = filters.orderId.trim().length > 0;
  const hasTriggeringEvent = filters.triggeringEvent !== '';
  const hasStatus = filters.deliveryStatus !== '';
  const hasCategory = filters.eventCategory !== '';
  const hasDates = filters.dateFrom.trim() !== '' || filters.dateTo.trim() !== '';
  const hasResend = filters.resendHistoryOnly;

  if (
    !hasSearch
    && !hasRecipientEmail
    && !hasCustomerName
    && !hasOrderId
    && !hasTriggeringEvent
    && !hasStatus
    && !hasCategory
    && !hasDates
    && !hasResend
  ) {
    return null;
  }

  const dateLabel =
    filters.dateFrom && filters.dateTo
      ? `${filters.dateFrom} – ${filters.dateTo}`
      : filters.dateFrom
        ? `From ${filters.dateFrom}`
        : `Through ${filters.dateTo}`;

  return (
    <div className="mb-0 flex w-full items-center justify-between border-b border-trimble-border bg-[#F1F1F6] px-4 py-2">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#121212]">
          Active filters:
        </span>
        {hasSearch ? (
          <FilterChip label={`Search: ${trimmedSearch}`} onRemove={onClearSearch} />
        ) : null}
        {hasRecipientEmail ? (
          <FilterChip
            label={`Recipient: ${filters.recipientEmail.trim()}`}
            onRemove={onRemoveRecipientEmail}
          />
        ) : null}
        {hasCustomerName ? (
          <FilterChip
            label={`Customer: ${filters.customerName.trim()}`}
            onRemove={onRemoveCustomerName}
          />
        ) : null}
        {hasOrderId ? (
          <FilterChip label={`Order ID: ${filters.orderId.trim()}`} onRemove={onRemoveOrderId} />
        ) : null}
        {hasTriggeringEvent ? (
          <FilterChip label={filters.triggeringEvent} onRemove={onRemoveTriggeringEvent} />
        ) : null}
        {hasStatus ? (
          <FilterChip
            label={`Status: ${deliveryChipLabel(filters.deliveryStatus)}`}
            onRemove={onRemoveDeliveryStatus}
          />
        ) : null}
        {hasCategory ? (
          <FilterChip label={filters.eventCategory} onRemove={onRemoveEventCategory} />
        ) : null}
        {hasDates ? <FilterChip label={dateLabel} onRemove={onRemoveDateRange} /> : null}
        {hasResend ? (
          <FilterChip label="Resend history" onRemove={onRemoveResendHistory} />
        ) : null}
      </div>
      <button
        type="button"
        onClick={onClearAll}
        className="shrink-0 cursor-pointer text-xs font-semibold text-[#0063A3] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]"
      >
        Clear all
      </button>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#CBCDD6] bg-white px-3 py-1 text-xs text-[#121212]">
      <span className="truncate">{label}</span>
      <button
        type="button"
        aria-label={`Remove filter ${label}`}
        className="rounded-full text-[#525866] hover:text-[#121212] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]"
        onClick={onRemove}
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </span>
  );
}
