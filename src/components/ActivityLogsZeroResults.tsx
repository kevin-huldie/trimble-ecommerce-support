import { Search } from 'lucide-react';

/** State 1: search term zero results. State 2: advanced filters zero results. */
export type ActivityLogsZeroResultVariant = 'search' | 'filters';

type ActivityLogsZeroResultsCardProps = {
  variant: ActivityLogsZeroResultVariant;
  searchQuery: string;
  onClearSearchAndFilters: () => void;
};

const TROUBLESHOOTING_TIPS = [
  'Check for spelling errors or typos in customer names, emails, or IDs.',
  'Verify if the purchase was made under an alternate Organization Owner.',
  'Clear active search terms, date range, or category filters.',
] as const;

const CARD_CLASS =
  'mt-4 flex w-full flex-col items-center justify-center rounded-md border border-[#CBCDD6] bg-white px-8 py-12 text-center';

function ZeroResultsIcon() {
  return (
    <div
      className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F1F6] p-3 text-[#121212]"
      aria-hidden
    >
      <Search className="h-6 w-6" strokeWidth={2} />
    </div>
  );
}

function ZeroResultsTroubleshootingList() {
  return (
    <ul className="mx-auto mb-6 inline-block max-w-md space-y-1 text-left text-xs text-[#525866]">
      {TROUBLESHOOTING_TIPS.map((tip) => (
        <li key={tip}>• {tip}</li>
      ))}
    </ul>
  );
}

function ZeroResultsClearButton({ onClearSearchAndFilters }: { onClearSearchAndFilters: () => void }) {
  return (
    <button
      type="button"
      onClick={onClearSearchAndFilters}
      className="rounded bg-[#0063A3] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#004B7A] focus:outline-none focus:ring-2 focus:ring-[#0063A3] focus:ring-offset-2"
    >
      Clear search &amp; filters
    </button>
  );
}

/** State 1 — primary search bar returned 0 rows. */
export function SearchTermZeroResultsCard({
  searchQuery,
  onClearSearchAndFilters,
}: Omit<ActivityLogsZeroResultsCardProps, 'variant'>) {
  const displayQuery = searchQuery.trim();

  return (
    <div role="status" aria-live="polite" className={CARD_CLASS}>
      <ZeroResultsIcon />
      <h2 className="mb-2 text-base font-bold text-[#121212]">No matching email records found</h2>
      <p className="mb-4 text-xs text-[#525866]">
        No activity logs matched your query &quot;{displayQuery}&quot;.
      </p>
      <ZeroResultsTroubleshootingList />
      <ZeroResultsClearButton onClearSearchAndFilters={onClearSearchAndFilters} />
    </div>
  );
}

/** State 2 — active advanced / tier-1 filters returned 0 rows. */
export function AdvancedFiltersZeroResultsCard({
  onClearSearchAndFilters,
}: Pick<ActivityLogsZeroResultsCardProps, 'onClearSearchAndFilters'>) {
  return (
    <div role="status" aria-live="polite" className={CARD_CLASS}>
      <ZeroResultsIcon />
      <h2 className="mb-2 text-base font-bold text-[#121212]">No matching email records found</h2>
      <p className="mb-4 text-xs text-[#525866]">
        No activity logs matched your active filter parameters.
      </p>
      <ZeroResultsTroubleshootingList />
      <ZeroResultsClearButton onClearSearchAndFilters={onClearSearchAndFilters} />
    </div>
  );
}

export function ActivityLogsZeroResultsCard({
  variant,
  searchQuery,
  onClearSearchAndFilters,
}: ActivityLogsZeroResultsCardProps) {
  if (variant === 'search') {
    return (
      <SearchTermZeroResultsCard
        searchQuery={searchQuery}
        onClearSearchAndFilters={onClearSearchAndFilters}
      />
    );
  }
  return <AdvancedFiltersZeroResultsCard onClearSearchAndFilters={onClearSearchAndFilters} />;
}
