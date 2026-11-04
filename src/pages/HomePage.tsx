import type { LucideIcon } from 'lucide-react';
import {
  Edit,
  File,
  FileCheck,
  Forward,
  FileMinus,
  FileText,
  Mail,
  Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PortalShell } from '../components/PortalShell';

const OUT_OF_SCOPE_TOOLTIP = 'This is not part of the email repository ticket';

type HomeTile = {
  id: string;
  title: string;
  icon: LucideIcon;
};

const TILES: HomeTile[] = [
  { id: 'order-details', title: 'Order Details', icon: Search },
  { id: 'returns', title: 'Returns', icon: Edit },
  { id: 'releasing-holds', title: 'Releasing Holds', icon: FileCheck },
  {
    id: 'tax-exempt-holds',
    title: 'Releasing Tax Exempted Holds',
    icon: FileCheck,
  },
  {
    id: 'reprocess-failed',
    title: 'Reprocessing Failed Orders',
    icon: Forward,
  },
  { id: 'cancel-orders', title: 'Cancel Orders', icon: FileText },
  { id: 'refund-orders', title: 'Refund Orders', icon: FileMinus },
  { id: 'reports', title: 'Reports', icon: File },
  { id: 'email-activity-logs', title: 'Email Activity Logs', icon: Mail },
];

const OUT_OF_SCOPE_DESC_ID = 'home-out-of-scope-description';

function tileHref(tileId: string): string | null {
  if (tileId === 'email-activity-logs') return '/logs';
  return null;
}

export function HomePage() {
  return (
    <PortalShell hideSidebar contentClassName="bg-[#F4F5F7] text-[#252525]">
      <main id="main-content" role="main" className="min-h-screen px-4 py-12 sm:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h1 id="home-page-title" className="mb-3 text-3xl font-bold text-[#252525]">
            eCommerce Support Portal
          </h1>
          <p id="home-page-intro" className="text-sm text-[#525866]">
            Welcome to our support portal! To get started, just pick a category below that best fits
            what you need.
          </p>
        </div>

        <section
          role="region"
          aria-labelledby="home-categories-heading"
          className="mx-auto w-full max-w-7xl"
        >
          <h2 id="home-categories-heading" className="sr-only">
            Support categories
          </h2>
          <p id={OUT_OF_SCOPE_DESC_ID} className="sr-only">
            {OUT_OF_SCOPE_TOOLTIP}
          </p>

          <ul
            role="grid"
            aria-rowcount={2}
            aria-colcount={5}
            aria-label="Support category tiles"
            aria-describedby="home-page-intro"
            className="home-category-grid list-none p-0"
          >
            {TILES.map((tile, index) => {
              const isActive = tile.id === 'email-activity-logs';
              const href = tileHref(tile.id);
              const Icon = tile.icon;
              const rowIndex = Math.floor(index / 5) + 1;
              const colIndex = (index % 5) + 1;

              return (
                <li key={tile.id} role="presentation" className="min-w-0">
                  <article
                    role="gridcell"
                    aria-rowindex={rowIndex}
                    aria-colindex={colIndex}
                    aria-labelledby={`${tile.id}-title`}
                    aria-disabled={!isActive}
                    className={[
                      'flex h-full min-h-[200px] flex-col items-center justify-between rounded border border-[#E0E0E0] bg-white p-6 text-center shadow-[0_2px_4px_rgba(0,0,0,0.06)] transition-shadow transition-opacity',
                      isActive
                        ? 'hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                        : 'opacity-70',
                    ].join(' ')}
                  >
                    <div className="mt-2 flex flex-col items-center">
                      <Icon
                        className="mb-4 h-8 w-8 text-[#252525]"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      <h3
                        id={`${tile.id}-title`}
                        className="max-w-[11rem] text-sm font-bold leading-tight text-[#252525]"
                      >
                        {tile.title}
                      </h3>
                    </div>

                    <div className="mt-6 w-full">
                      {isActive && href ? (
                        <Link
                          to={href}
                          className="block w-full rounded bg-[#0063A3] px-3 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-[#004B7A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3] focus-visible:ring-offset-2"
                        >
                          Get started
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          aria-disabled="true"
                          aria-describedby={OUT_OF_SCOPE_DESC_ID}
                          title={OUT_OF_SCOPE_TOOLTIP}
                          tabIndex={-1}
                          className="pointer-events-none block w-full cursor-not-allowed rounded bg-[#0063A3] px-3 py-2 text-center text-xs font-semibold text-white opacity-60"
                        >
                          Get started
                        </button>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>

        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only" />
      </main>
    </PortalShell>
  );
}
