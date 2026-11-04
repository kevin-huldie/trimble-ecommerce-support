import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { AdvancedFilterFields } from '../data/mockLogs';
import {
  validateAdvancedFiltersDraft,
} from '../utils/advancedFilterValidation';
import { validateSearchQuery } from '../utils/searchValidation';
import { InlineFieldError } from './InlineFieldError';
import { ValidationLiveRegion } from './ValidationLiveRegion';
import {
  AdvancedFilters,
  advancedFieldsFromFilters,
  DEFAULT_ADVANCED_FILTER_FIELDS,
} from './AdvancedFilters';

export type SearchToolbarProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  advancedFilters: AdvancedFilterFields;
  onApplyAdvancedFilters: (values: AdvancedFilterFields) => void;
  filtersOpen: boolean;
  onFiltersOpenChange: (open: boolean) => void;
  activeFilterBarVisible?: boolean;
};

const ADVANCED_FILTERS_DRAWER_ID = 'advanced-filters-drawer';

export function SearchToolbar({
  searchQuery,
  onSearchQueryChange,
  advancedFilters,
  onApplyAdvancedFilters,
  filtersOpen,
  onFiltersOpenChange,
  activeFilterBarVisible = false,
}: SearchToolbarProps) {
  const searchInputId = 'activity-logs-search';
  const searchErrorId = `${searchInputId}-error`;
  const showClear = searchQuery.length > 0;
  const isFilterButtonActive = filtersOpen || activeFilterBarVisible;

  const [draft, setDraft] = useState<AdvancedFilterFields>(() =>
    advancedFieldsFromFilters(advancedFilters),
  );

  const searchError = useMemo(() => validateSearchQuery(searchQuery), [searchQuery]);

  const advancedErrors = useMemo(() => validateAdvancedFiltersDraft(draft), [draft]);

  const [liveMessage, setLiveMessage] = useState('');

  useEffect(() => {
    if (filtersOpen) {
      setDraft(advancedFieldsFromFilters(advancedFilters));
    }
  }, [filtersOpen, advancedFilters]);

  useEffect(() => {
    const next =
      searchError
      ?? advancedErrors.recipientEmailError
      ?? advancedErrors.dateRangeError
      ?? '';
    if (next) setLiveMessage(next);
  }, [searchError, advancedErrors.recipientEmailError, advancedErrors.dateRangeError]);

  const handleApply = () => {
    const errors = validateAdvancedFiltersDraft(draft);
    if (errors.recipientEmailError || errors.dateRangeError) {
      if (errors.recipientEmailError) setLiveMessage(errors.recipientEmailError);
      if (errors.dateRangeError) setLiveMessage(errors.dateRangeError);
      return;
    }
    onApplyAdvancedFilters(draft);
    onFiltersOpenChange(false);
  };

  const handleClear = () => {
    const cleared = { ...DEFAULT_ADVANCED_FILTER_FIELDS };
    setDraft(cleared);
    onApplyAdvancedFilters(cleared);
    onFiltersOpenChange(false);
  };

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filtersOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onFiltersOpenChange(false);
    };

    const onPointerDown = (event: MouseEvent) => {
      if (searchContainerRef.current?.contains(event.target as Node)) return;
      onFiltersOpenChange(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [filtersOpen, onFiltersOpenChange]);

  const handleSearchChange = (value: string) => {
    onSearchQueryChange(value);
    const err = validateSearchQuery(value);
    if (err) setLiveMessage(err);
  };

  return (
    <div ref={searchContainerRef} className="relative mb-6 w-full bg-white">
      <ValidationLiveRegion message={liveMessage} />
      <label htmlFor={searchInputId} className="mb-1.5 block text-xs text-[#121212]">
        Search activity logs <span className="text-[#DA212C]">*</span>
      </label>
      <div className="flex w-full items-start gap-3">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#525866]"
            aria-hidden
          />
          <input
            id={searchInputId}
            type="search"
            value={searchQuery}
            aria-invalid={searchError ? true : undefined}
            aria-describedby={searchError ? searchErrorId : undefined}
            placeholder="Search by Order #, Account ID, Trimble ID, or SendGrid ID..."
            className={[
              'h-10 w-full rounded border bg-white pl-10 pr-8 text-xs text-[#121212] placeholder:text-[#525866] focus:outline-none focus:ring-2',
              searchError
                ? 'border-[#DA212C] focus:ring-[#DA212C]'
                : 'border-[#CBCDD6] focus:ring-[#0063A3]',
            ].join(' ')}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {showClear ? (
            <button
              type="button"
              className="absolute right-3 top-2.5 text-[#525866] hover:text-[#121212] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]"
              aria-label="Clear search"
              onClick={() => onSearchQueryChange('')}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
          {searchError ? <InlineFieldError id={searchErrorId} message={searchError} /> : null}
        </div>
        <button
          type="button"
          aria-expanded={filtersOpen}
          aria-controls={ADVANCED_FILTERS_DRAWER_ID}
          aria-label={filtersOpen ? 'Close advanced filters' : 'Open advanced filters'}
          className={[
            'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded border text-xs focus:outline-none focus:ring-2 focus:ring-[#0063A3]',
            isFilterButtonActive
              ? 'border-[#0063A3] bg-[#E5F1F8] font-bold text-[#0063A3]'
              : 'border-[#CBCDD6] bg-white font-semibold text-[#121212] hover:bg-[#F1F1F6]',
          ].join(' ')}
          onClick={() => onFiltersOpenChange(!filtersOpen)}
        >
          <SlidersHorizontal
            className={[
              'h-4 w-4 shrink-0',
              isFilterButtonActive ? 'text-[#0063A3]' : 'text-[#525866]',
            ].join(' ')}
            strokeWidth={2}
            aria-hidden
          />
        </button>
      </div>

      {filtersOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 w-full rounded-lg border border-[#CBCDD6] bg-white p-6 shadow-2xl">
          <AdvancedFilters
            id={ADVANCED_FILTERS_DRAWER_ID}
            values={draft}
            onChange={setDraft}
            onApply={handleApply}
            onClear={handleClear}
            recipientEmailError={advancedErrors.recipientEmailError}
            dateRangeError={advancedErrors.dateRangeError}
            onRecipientEmailBlur={() => undefined}
          />
        </div>
      ) : null}
    </div>
  );
}
