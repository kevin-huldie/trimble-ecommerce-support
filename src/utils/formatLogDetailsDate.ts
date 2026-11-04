const detailsFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
  timeZone: 'America/New_York',
});

export function formatLogDetailsTimestamp(iso: string): {
  display: string;
  datetime: string;
} {
  const date = new Date(iso);
  return {
    display: `${detailsFormatter.format(date)} EST`,
    datetime: iso,
  };
}
