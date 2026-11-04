type ValidationLiveRegionProps = {
  message: string;
};

/** Screen reader announcements for validation (does not steal focus). */
export function ValidationLiveRegion({ message }: ValidationLiveRegionProps) {
  return (
    <p className="sr-only" aria-live="polite" aria-atomic="true">
      {message}
    </p>
  );
}
