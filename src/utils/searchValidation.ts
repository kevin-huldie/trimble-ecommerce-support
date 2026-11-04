const SEARCH_ERROR =
  'Invalid search query format. Please enter a valid name, email, or order ID.';

const DANGEROUS_PATTERNS = [
  /<script/i,
  /<\/script/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /(\bOR\b|\bAND\b)\s+['"]?\w+['"]?\s*=/i,
  /;\s*DROP\s+/i,
  /UNION\s+SELECT/i,
  /--/,
  /\/\*/,
  /<\/?[a-z][\s\S]*>/i,
];

/** Allowed characters for activity log search (names, emails, order IDs). */
const ALLOWED_SEARCH = /^[\w\s@.#+\-_,/|:]+$/i;

export function validateSearchQuery(query: string): string | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmed)) return SEARCH_ERROR;
  }

  if (!ALLOWED_SEARCH.test(trimmed)) return SEARCH_ERROR;

  return null;
}

export const SEARCH_QUERY_ERROR_MESSAGE = SEARCH_ERROR;
