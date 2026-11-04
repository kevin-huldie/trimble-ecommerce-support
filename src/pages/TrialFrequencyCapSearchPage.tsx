import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PortalShell } from '../components/PortalShell';
import { ResetFrequencyCapModal } from '../components/trial-frequency-cap/ResetFrequencyCapModal';
import {
  buildDemoTrialAccount,
  DEMO_ACCOUNT_ID,
  matchesTrialAccountSearch,
  type TrialAccountSummary,
  type TrialProductRow,
} from '../data/mockTrialFrequencyCap';

function StatusBadge({ status }: { status: TrialProductRow['status'] }) {
  if (status === 'Capped') {
    return (
      <span className="inline-block rounded px-2 py-0.5 text-xs font-semibold text-white bg-[#D97706]">
        Capped
      </span>
    );
  }
  return (
    <span className="inline-block rounded px-2 py-0.5 text-xs font-semibold text-white bg-[#16A34A]">
      Eligible
    </span>
  );
}

function countCapped(products: TrialProductRow[]): number {
  return products.filter((p) => p.status === 'Capped').length;
}

export function TrialFrequencyCapSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [account, setAccount] = useState<TrialAccountSummary | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [resetTarget, setResetTarget] = useState<TrialProductRow | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Trial Frequency Cap Management | Trimble Support Portal';
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const loadResults = useCallback((query: string) => {
    setSearchAttempted(true);
    if (matchesTrialAccountSearch(query)) {
      setAccount(buildDemoTrialAccount());
    } else {
      setAccount(null);
    }
  }, []);

  const handleSearch = () => {
    loadResults(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery('');
    setAccount(null);
    setSearchAttempted(false);
  };

  const handleDemoLoad = () => {
    setSearchQuery(DEMO_ACCOUNT_ID);
    loadResults(DEMO_ACCOUNT_ID);
  };

  const handleResetConfirm = (justification: string) => {
    if (!account || !resetTarget) return;
    setAccount((prev) => {
      if (!prev) return prev;
      const products = prev.products.map((row) =>
        row.id === resetTarget.id
          ? {
              ...row,
              status: 'Eligible' as const,
              timeRemaining: '364-day window clear (reset applied)',
            }
          : row,
      );
      const capped = countCapped(products);
      return { ...prev, products, cappedProductCount: capped };
    });
    setResetTarget(null);
    setToastMessage(`Frequency cap reset recorded. Justification: ${justification.slice(0, 80)}${justification.length > 80 ? '…' : ''}`);
  };

  const overallStatusLabel = useMemo(() => {
    if (!account) return '';
    const capped = countCapped(account.products);
    if (capped === 0) return 'All products eligible';
    if (capped === 1) return '1 Capped Product';
    return `${capped} Capped Products`;
  }, [account]);

  const showNoResults = searchAttempted && !account;

  return (
    <PortalShell hideSidebar headerVariant="dark" contentClassName="bg-[#F4F5F7] text-[#252525]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-[#525866]">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link
                to="/"
                className="font-semibold text-[#0063A3] hover:text-[#004B7A] focus:outline-none focus-visible:underline"
              >
                Home
              </Link>
            </li>
            <li className="flex items-center gap-1" aria-hidden>
              <ChevronRight className="h-4 w-4 text-[#525866]" />
            </li>
            <li className="font-semibold text-[#252525]" aria-current="page">
              Trial Frequency Cap
            </li>
          </ol>
        </nav>

        <header className="mb-6">
          <h1 className="text-2xl font-bold text-[#252525]">Trial Frequency Cap Management</h1>
          <p className="mt-2 max-w-3xl text-sm text-[#525866]">
            Check customer account trial eligibility, review 364-day enrollment history, and execute
            authorized frequency cap resets.
          </p>
        </header>

        <section
          aria-labelledby="trial-search-heading"
          className="mb-6 rounded border border-[#E0E0E0] bg-white p-6 shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
        >
          <h2 id="trial-search-heading" className="sr-only">
            Search accounts
          </h2>
          <label htmlFor="trial-account-search" className="mb-2 block text-sm font-semibold text-[#252525]">
            Account lookup
          </label>
          <div className="relative mb-4">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#525866]"
              aria-hidden
            />
            <input
              id="trial-account-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              placeholder="Search by Trimble Account ID (e.g., ACC-88492) or Trimble ID Email (e.g., user@company.com)..."
              className="w-full rounded border border-[#E0E0E0] py-2.5 pl-10 pr-3 text-sm text-[#252525] placeholder:text-[#525866] focus:border-[#0063A3] focus:outline-none focus:ring-1 focus:ring-[#0063A3]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSearch}
              className="rounded bg-[#0063A3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004B7A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3] focus-visible:ring-offset-2"
            >
              Search Account
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="rounded border border-[#0063A3] bg-white px-4 py-2 text-sm font-semibold text-[#0063A3] hover:bg-[#F4F5F7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3] focus-visible:ring-offset-2"
            >
              Clear
            </button>
          </div>
          <button
            type="button"
            onClick={handleDemoLoad}
            className="mt-4 text-left text-xs font-semibold text-[#0063A3] underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]"
          >
            [Demo: Load Capped Account (ACC-88492)]
          </button>
        </section>

        {showNoResults ? (
          <div
            role="status"
            className="rounded border border-[#E0E0E0] bg-white px-6 py-8 text-center shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
          >
            <p className="text-sm font-semibold text-[#252525]">No matching account found</p>
            <p className="mt-1 text-sm text-[#525866]">
              Try the demo account ID <span className="font-mono">{DEMO_ACCOUNT_ID}</span> or use the
              demo link above.
            </p>
          </div>
        ) : null}

        {account ? (
          <div className="flex flex-col gap-6">
            <section
              aria-labelledby="account-summary-heading"
              className="rounded border border-[#E0E0E0] bg-white p-6 shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
            >
              <h2 id="account-summary-heading" className="sr-only">
                Account summary
              </h2>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-lg font-bold text-[#252525]">{account.customerName}</p>
                  <p className="mt-1 text-sm text-[#525866]">
                    TID: {account.tid} | Account ID: {account.accountId}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {account.accountTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-block rounded border border-[#E0E0E0] bg-[#F4F5F7] px-2 py-0.5 text-xs font-semibold text-[#525866]"
                    >
                      {type}
                    </span>
                  ))}
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-semibold text-white ${
                      countCapped(account.products) > 0 ? 'bg-[#D97706]' : 'bg-[#16A34A]'
                    }`}
                  >
                    {overallStatusLabel}
                  </span>
                </div>
              </div>
            </section>

            <section
              aria-labelledby="trial-products-heading"
              className="overflow-hidden rounded border border-[#E0E0E0] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
            >
              <h2 id="trial-products-heading" className="border-b border-[#E0E0E0] px-6 py-4 text-base font-bold text-[#252525]">
                Product trial eligibility
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-[#F4F5F7] text-xs font-bold uppercase tracking-wide text-[#252525]">
                      <th scope="col" className="border-b border-[#E0E0E0] px-4 py-3">
                        Product SKU &amp; Name
                      </th>
                      <th scope="col" className="border-b border-[#E0E0E0] px-4 py-3">
                        First Enrolled Date
                      </th>
                      <th scope="col" className="border-b border-[#E0E0E0] px-4 py-3">
                        Last Enrolled Date
                      </th>
                      <th scope="col" className="border-b border-[#E0E0E0] px-4 py-3">
                        Eligibility Status
                      </th>
                      <th scope="col" className="border-b border-[#E0E0E0] px-4 py-3">
                        Time Remaining
                      </th>
                      <th scope="col" className="border-b border-[#E0E0E0] px-4 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {account.products.map((row) => (
                      <tr key={row.id} className="border-b border-[#E0E0E0] last:border-b-0">
                        <td className="px-4 py-3 align-top">
                          <span className="block font-mono text-xs text-[#525866]">{row.sku}</span>
                          <span className="font-semibold text-[#252525]">{row.productName}</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[#252525]">{row.firstEnrolled}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-[#252525]">{row.lastEnrolled}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="px-4 py-3 text-[#525866]">{row.timeRemaining}</td>
                        <td className="px-4 py-3">
                          {row.status === 'Capped' ? (
                            <button
                              type="button"
                              onClick={() => setResetTarget(row)}
                              className="whitespace-nowrap rounded bg-[#0063A3] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#004B7A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3] focus-visible:ring-offset-2"
                            >
                              Reset frequency cap
                            </button>
                          ) : (
                            <span className="text-xs text-[#525866]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : null}
      </div>

      <ResetFrequencyCapModal
        open={resetTarget !== null}
        productLabel={resetTarget ? `${resetTarget.sku} — ${resetTarget.productName}` : ''}
        onClose={() => setResetTarget(null)}
        onConfirm={handleResetConfirm}
      />

      {toastMessage ? (
        <div
          role="status"
          className="fixed bottom-6 right-6 max-w-sm rounded border border-[#16A34A] bg-white px-4 py-3 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
        >
          <p className="font-semibold text-[#16A34A]">Reset successful</p>
          <p className="mt-1 text-[#252525]">{toastMessage}</p>
        </div>
      ) : null}
    </PortalShell>
  );
}
