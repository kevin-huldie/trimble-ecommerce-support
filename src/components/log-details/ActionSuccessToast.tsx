type ActionSuccessToastProps = {
  message: string;
  onClose: () => void;
};

export function ActionSuccessToast({ message, onClose }: ActionSuccessToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[9999] flex w-auto max-w-md translate-y-0 transform items-center gap-3 rounded-lg border border-[#A2DCA0] bg-[#E2F8E1] px-4 py-3 text-xs font-semibold text-[#14321A] opacity-100 shadow-lg transition-all duration-300 ease-in-out"
    >
      <svg
        className="h-5 w-5 shrink-0 text-[#1E5631]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2.5"
        aria-hidden
      >
        <circle cx="12" cy="12" r="10" fill="#E2F8E1" className="fill-current text-[#E2F8E1]" />
        <path stroke="#1E5631" strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
        <path
          stroke="#1E5631"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
          fill="#1E5631"
          className="fill-current"
        />
      </svg>

      <span className="font-medium leading-relaxed">{message || 'Action completed successfully.'}</span>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss Notification"
        className="ml-auto flex cursor-pointer items-center justify-center self-center border-none bg-transparent pl-3 text-sm font-bold text-[#525866] transition-colors hover:text-[#121212]"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
