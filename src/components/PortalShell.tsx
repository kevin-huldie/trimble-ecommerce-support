import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type PortalShellProps = {
  children: ReactNode;
  sidebar?: ReactNode;
  /** When true, omits the left navigation rail (e.g. log details page). */
  hideSidebar?: boolean;
  /** Main content column classes (defaults to white workspace). */
  contentClassName?: string;
  /** Light (default) or Modus 1.0 dark navy header bar. */
  headerVariant?: 'light' | 'dark';
};

export function PortalShell({
  children,
  sidebar,
  hideSidebar = false,
  contentClassName = 'bg-white',
  headerVariant = 'light',
}: PortalShellProps) {
  const isDarkHeader = headerVariant === 'dark';

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header
        className={[
          'flex h-14 shrink-0 items-center justify-between px-6',
          isDarkHeader
            ? 'border-b border-[#001a33] bg-[#00274C] text-white'
            : 'border-b border-[#CBCDD6] bg-white',
        ].join(' ')}
      >
        <Link
          to="/"
          className={[
            'flex items-baseline gap-2 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            isDarkHeader
              ? 'focus-visible:ring-white focus-visible:ring-offset-[#00274C]'
              : 'focus-visible:ring-[#0063A3] focus-visible:ring-offset-2',
          ].join(' ')}
        >
          <span
            className={[
              'text-xl font-bold tracking-tight',
              isDarkHeader ? 'text-white' : 'text-[#0063A3]',
            ].join(' ')}
          >
            Trimble
          </span>
          <span
            className={[
              'text-sm font-normal',
              isDarkHeader ? 'text-white/90' : 'text-[#525866]',
            ].join(' ')}
          >
            Support Portal
          </span>
        </Link>
        <div
          className={[
            'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white',
            isDarkHeader ? 'bg-[#0063A3]' : 'bg-[#0063A3]',
          ].join(' ')}
          aria-label="Signed in as Jane Doe"
          role="img"
        >
          JD
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {!hideSidebar && sidebar ? (
          <aside className="w-[220px] shrink-0 border-r border-[#CBCDD6] bg-white px-4 py-6">
            {sidebar}
          </aside>
        ) : null}
        <div className={`min-w-0 flex-1 ${contentClassName}`}>{children}</div>
      </div>
    </div>
  );
}
