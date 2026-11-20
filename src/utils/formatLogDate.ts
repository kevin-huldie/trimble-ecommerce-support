const statusDateWithYearFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'America/New_York',
});

const statusTimeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'America/New_York',
});

const fullTimestampFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'full',
  timeStyle: 'short',
});

export interface LogDateParts {
  display: string;
  title: string;
  datetime: string;
}

/** Table status column display string: "Oct 14, 2026 • 1:00 PM EST" */
export function formatLogTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return formatLogStatusDate(isoString).display;
  } catch {
    return isoString;
  }
}

/** Stage 1 MVP table — date (with year) on first line, time on second. */
export function formatLogMvpDateTimeStack(iso: string): {
  dateLine: string;
  timeLine: string;
  title: string;
  datetime: string;
} {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return { dateLine: iso, timeLine: '', title: iso, datetime: iso };
    }
    return {
      dateLine: statusDateWithYearFormatter.format(date),
      timeLine: `${statusTimeFormatter.format(date)} EST`,
      title: fullTimestampFormatter.format(date),
      datetime: iso,
    };
  } catch {
    return { dateLine: iso, timeLine: '', title: iso, datetime: iso };
  }
}

/** Table status column: "Oct 9, 2026 • 2:22 PM EST" */
export function formatLogStatusDate(iso: string): LogDateParts {
  const date = new Date(iso);
  const datePart = statusDateWithYearFormatter.format(date);
  const timePart = statusTimeFormatter.format(date);

  return {
    display: `${datePart} • ${timePart} EST`,
    title: fullTimestampFormatter.format(date),
    datetime: iso,
  };
}
