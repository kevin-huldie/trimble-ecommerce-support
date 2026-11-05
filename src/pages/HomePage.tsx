import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
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

type HomeTile = {
  id: string;
  title: string;
  icon: LucideIcon;
  actionLabel?: string;
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

/** Visually active tiles with no route in the baseline prototype. */
const TOOLTIP_ONLY_TILE_IDS = new Set<string>([
  'order-details',
  'returns',
  'releasing-holds',
  'tax-exempt-holds',
  'reprocess-failed',
  'cancel-orders',
  'refund-orders',
  'reports',
]);

function homeTileTooltipMessage(title: string): string {
  return `Navigates to ${title} flow`;
}

function isTooltipOnlyTile(tileId: string): boolean {
  return TOOLTIP_ONLY_TILE_IDS.has(tileId);
}

export function HomePage() {
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const gridRef = useRef<HTMLUListElement>(null);

  const handleToggleTooltip = useCallback((event: MouseEvent, cardId: string) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveTooltipId((prev) => (prev === cardId ? null : cardId));
  }, []);

  useEffect(() => {
    if (!activeTooltipId) return undefined;
    const timer = window.setTimeout(() => setActiveTooltipId(null), 4000);
    return () => window.clearTimeout(timer);
  }, [activeTooltipId]);

  useEffect(() => {
    if (!activeTooltipId) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveTooltipId(null);
    };

    const onPointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (gridRef.current?.contains(target)) return;
      setActiveTooltipId(null);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [activeTooltipId]);

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
          className="mx-auto w-full max-w-7xl overflow-visible"
        >
          <h2 id="home-categories-heading" className="sr-only">
            Support categories
          </h2>

          <ul
            ref={gridRef}
            role="grid"
            aria-rowcount={2}
            aria-colcount={5}
            aria-label="Support category tiles"
            aria-describedby="home-page-intro"
            className="home-category-grid list-none overflow-visible p-0"
          >
            {TILES.map((tile, index) => {
              const Icon = tile.icon;
              const rowIndex = Math.floor(index / 5) + 1;
              const colIndex = (index % 5) + 1;
              const tooltipOnly = isTooltipOnlyTile(tile.id);
              const tooltipId = `tooltip-${tile.id}`;
              const actionLabel = tile.actionLabel ?? 'Get started';

              return (
                <li key={tile.id} role="presentation" className="relative min-w-0 overflow-visible">
                  <article
                    role="gridcell"
                    aria-rowindex={rowIndex}
                    aria-colindex={colIndex}
                    aria-labelledby={`${tile.id}-title`}
                    className="flex h-full min-h-[200px] flex-col items-center justify-between overflow-visible rounded border border-[#E0E0E0] bg-white p-6 text-center shadow-[0_2px_4px_rgba(0,0,0,0.06)] transition-shadow transition-opacity hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
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

                    <div className="mt-6 w-full overflow-visible">
                      {tooltipOnly ? (
                        <div className="relative inline-block w-full">
                          {activeTooltipId === tile.id ? (
                            <div
                              id={tooltipId}
                              role="status"
                              aria-live="polite"
                              className="pointer-events-auto absolute bottom-full left-1/2 z-40 mb-2.5 -translate-x-1/2 whitespace-nowrap rounded border border-[#3B424C] bg-[#1E2227] px-3 py-1.5 text-xs font-medium text-white shadow-xl"
                            >
                              {homeTileTooltipMessage(tile.title)}
                              <div
                                aria-hidden
                                className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-[#1E2227]"
                              />
                              <div
                                aria-hidden
                                className="absolute left-1/2 top-full -z-10 h-0 w-0 -translate-x-1/2 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#3B424C]"
                              />
                            </div>
                          ) : null}
                          <button
                            type="button"
                            aria-describedby={
                              activeTooltipId === tile.id ? tooltipId : undefined
                            }
                            className="w-full rounded bg-[#0063A3] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#004f82] focus:outline-none focus:ring-2 focus:ring-[#0063A3] focus:ring-offset-1"
                            onClick={(event) => handleToggleTooltip(event, tile.id)}
                          >
                            {actionLabel}
                          </button>
                        </div>
                      ) : (
                        <Link
                          to="/logs"
                          className="block w-full rounded bg-[#0063A3] px-3 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-[#004B7A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3] focus-visible:ring-offset-2"
                        >
                          {actionLabel}
                        </Link>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </PortalShell>
  );
}
