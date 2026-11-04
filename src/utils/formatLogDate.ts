const statusDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
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

/** Table status column display string: "Oct 14 • 1:00 PM EST" */
export function formatLogTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return formatLogStatusDate(isoString).display;
  } catch {
    return isoString;
  }
}

/** Table status column: "Oct 9 • 2:22 PM EST" */
export function formatLogStatusDate(iso: string): LogDateParts {
  const date = new Date(iso);
  const datePart = statusDateFormatter.format(date);
  const timePart = statusTimeFormatter.format(date);

  return {
    display: `${datePart} • ${timePart} EST`,
    title: fullTimestampFormatter.format(date),
    datetime: iso,
  };
}
