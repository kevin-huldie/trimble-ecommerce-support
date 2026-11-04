import { Link } from 'react-router-dom';
import type { ActivityLogRecord } from '../../data/mockLogs';
import { formatLogDetailsTimestamp } from '../../utils/formatLogDetailsDate';

export function LogDetailsHeaderSection({ log }: { log: ActivityLogRecord }) {
  const { display } = formatLogDetailsTimestamp(log.sentAt);

  return (
    <header aria-labelledby="log-details-title" className="mb-6">
      <Link
        to="/logs"
        className="mb-2 inline-flex items-center gap-1 text-xs text-[#0063A3] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]"
      >
        ‹ Back to email activity logs
      </Link>
      <h1 id="log-details-title" className="text-2xl font-bold text-[#121212]">
        {log.subject}
      </h1>
      <p className="mt-1 text-xs text-[#525866]">{display}</p>
    </header>
  );
}
