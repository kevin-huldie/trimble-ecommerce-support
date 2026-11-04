import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityLogsSidebar,
  sidebarNavToFilters,
  type SidebarNavId,
} from '../components/ActivityLogsSidebar';
import { ActiveFilterBanner } from '../components/ActiveFilterBanner';
import { LogsPaginationFooter } from '../components/LogsPaginationFooter';
import { LogsTable } from '../components/LogsTable';
import { PortalShell } from '../components/PortalShell';
import { SearchToolbar } from '../components/SearchToolbar';
import { TableSummaryToolbar } from '../components/TableSummaryToolbar';
import {
  ActivityLogsZeroResultsCard,
  type ActivityLogsZeroResultVariant,
} from '../components/ActivityLogsZeroResults';
import {
  countLogsByDeliveryStatus,
  DEFAULT_ACTIVITY_LOG_FILTERS,
  filterActivityLogs,
  hasActiveActivityLogFilters,
  MOCK_ACTIVITY_LOGS,
  activityLogToEmailLog,
  type ActivityLogFilters,
  type AdvancedFilterFields,
  type LogDeliveryStatus,
} from '../data/mockLogs';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

const SEARCH_DEBOUNCE_MS = 250;
const DEFAULT_PAGE_SIZE = 20;

export function ActivityLogsPage() {
  const [filters, setFilters] = useState<ActivityLogFilters>(DEFAULT_ACTIVITY_LOG_FILTERS);
  const [activeNav, setActiveNav] = useState<SidebarNavId>('all-logs');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [refreshKey, setRefreshKey] = useState(0);

  const debouncedSearch = useDebouncedValue(filters.searchQuery, SEARCH_DEBOUNCE_MS);

  const effectiveFilters = useMemo(
    () => ({ ...filters, searchQuery: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const filteredLogs = useMemo(
    () => filterActivityLogs(MOCK_ACTIVITY_LOGS, effectiveFilters),
    [effectiveFilters, refreshKey],
  );

  const bouncedCount = useMemo(
    () => countLogsByDeliveryStatus(MOCK_ACTIVITY_LOGS, 'Bounced'),
    [],
  );
  const deferredCount = useMemo(
    () => countLogsByDeliveryStatus(MOCK_ACTIVITY_LOGS, 'Deferred'),
    [],
  );

  const totalCount = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  useEffect(() => {
    setPage(1);
  }, [effectiveFilters, pageSize]);

  const paginatedLogs = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, safePage, pageSize]);

  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = totalCount === 0 ? 0 : Math.min(safePage * pageSize, totalCount);

  const clearAllFilters = () => {
    setFilters(DEFAULT_ACTIVITY_LOG_FILTERS);
    setActiveNav('all-logs');
  };

  const handleSidebarNav = (nav: SidebarNavId) => {
    setActiveNav(nav);
    const partial = sidebarNavToFilters(nav);
    setFilters((prev) => ({
      ...prev,
      eventCategory: partial.eventCategory ?? '',
      deliveryStatus: (partial.deliveryStatus ?? '') as LogDeliveryStatus | '',
      resendHistoryOnly: nav === 'resend-history',
    }));
    setPage(1);
  };

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const showActiveFilterBanner = hasActiveActivityLogFilters(effectiveFilters);
  const trimmedSearchQuery = effectiveFilters.searchQuery.trim();
  const zeroResultVariant = useMemo((): ActivityLogsZeroResultVariant | null => {
    if (totalCount > 0) return null;
    if (trimmedSearchQuery.length > 0) return 'search';
    if (showActiveFilterBanner) return 'filters';
    return null;
  }, [totalCount, trimmedSearchQuery, showActiveFilterBanner]);

  const activeFilterBanner = showActiveFilterBanner ? (
    <ActiveFilterBanner
      filters={effectiveFilters}
      onClearAll={clearAllFilters}
      onClearSearch={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
      onRemoveRecipientEmail={() => setFilters((prev) => ({ ...prev, recipientEmail: '' }))}
      onRemoveCustomerName={() => setFilters((prev) => ({ ...prev, customerName: '' }))}
      onRemoveOrderId={() => setFilters((prev) => ({ ...prev, orderId: '' }))}
      onRemoveTriggeringEvent={() => setFilters((prev) => ({ ...prev, triggeringEvent: '' }))}
      onRemoveDeliveryStatus={() =>
        setFilters((prev) => ({
          ...prev,
          deliveryStatus: '' as LogDeliveryStatus | '',
        }))
      }
      onRemoveEventCategory={() => setFilters((prev) => ({ ...prev, eventCategory: '' }))}
      onRemoveDateRange={() => setFilters((prev) => ({ ...prev, dateFrom: '', dateTo: '' }))}
      onRemoveResendHistory={() => {
        setFilters((prev) => ({ ...prev, resendHistoryOnly: false }));
        setActiveNav('all-logs');
      }}
    />
  ) : null;

  return (
    <PortalShell hideSidebar>
      <main className="mx-auto w-full max-w-[1116px] bg-white px-6 py-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-[#121212]">Email Activity Logs</h1>
          <p className="text-xs text-[#525866]">
            Search and filter transactional emails across Trimble eCommerce storefronts.
          </p>
        </header>

        <div className="mt-6 grid grid-cols-12 gap-8">
          <aside className="col-span-3 min-w-0">
            <ActivityLogsSidebar
              activeNav={activeNav}
              onNavChange={handleSidebarNav}
              bouncedCount={bouncedCount}
              deferredCount={deferredCount}
            />
          </aside>

          <div className="col-span-9 flex w-full min-w-0 flex-col overflow-visible">
            <SearchToolbar
              searchQuery={filters.searchQuery}
              onSearchQueryChange={(searchQuery) =>
                setFilters((prev) => ({ ...prev, searchQuery }))
              }
              advancedFilters={{
                recipientEmail: filters.recipientEmail,
                customerName: filters.customerName,
                orderId: filters.orderId,
                triggeringEvent: filters.triggeringEvent,
                deliveryStatus: filters.deliveryStatus,
                dateFrom: filters.dateFrom,
                dateTo: filters.dateTo,
              }}
              onApplyAdvancedFilters={(applied: AdvancedFilterFields) =>
                setFilters((prev) => ({ ...prev, ...applied }))
              }
              filtersOpen={filtersOpen}
              onFiltersOpenChange={setFiltersOpen}
              activeFilterBarVisible={showActiveFilterBanner}
            />

            <section aria-label="Email activity results" className="flex min-w-0 flex-col gap-0">
              {totalCount > 0 ? (
                <div className="flex flex-col gap-0 overflow-visible rounded border border-[#CBCDD6] bg-white shadow-sm">
                  {activeFilterBanner}
                  <TableSummaryToolbar
                    totalCount={totalCount}
                    rangeStart={rangeStart}
                    rangeEnd={rangeEnd}
                    canGoPrev={safePage > 1}
                    canGoNext={safePage < totalPages}
                    onRefresh={handleRefresh}
                    onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
                    onNextPage={() => setPage((p) => Math.min(totalPages, p + 1))}
                  />
                  <LogsTable logs={paginatedLogs.map(activityLogToEmailLog)} />
                  <LogsPaginationFooter
                    page={safePage}
                    pageSize={pageSize}
                    totalCount={totalCount}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                  />
                </div>
              ) : zeroResultVariant != null ? (
                <ActivityLogsZeroResultsCard
                  variant={zeroResultVariant}
                  searchQuery={effectiveFilters.searchQuery}
                  onClearSearchAndFilters={clearAllFilters}
                />
              ) : null}
            </section>
          </div>
        </div>
      </main>
    </PortalShell>
  );
}
