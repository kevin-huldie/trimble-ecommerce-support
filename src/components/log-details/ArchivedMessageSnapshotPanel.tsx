import type { ActivityLogRecord } from '../../data/mockLogs';
import { ArchivedEmailPreview } from './ArchivedEmailPreview';

export function ArchivedMessageSnapshotPanel({ log }: { log: ActivityLogRecord }) {
  return (
    <section
      aria-labelledby="archived-snapshot-heading"
      className="w-full rounded-lg border border-[#CBCDD6] bg-white p-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="archived-snapshot-heading" className="text-sm font-bold text-[#121212]">
          Archived Message Snapshot
        </h2>
        <span className="rounded bg-[#E2E8F0] px-2.5 py-0.5 text-[11px] font-semibold text-[#525866]">
          Read-only system record
        </span>
      </div>

      <div className="max-h-[400px] w-full overflow-y-auto rounded border border-[#CBCDD6] bg-[#F8F9FA] p-4">
        <ArchivedEmailPreview log={log} />
      </div>

      <p className="mt-3 text-[11px] text-[#525866]">
        Communication logs are permanently archived in accordance with Trimble eCommerce compliance
        policies.
      </p>
    </section>
  );
}
