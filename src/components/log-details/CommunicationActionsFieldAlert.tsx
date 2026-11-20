type CommunicationActionsFieldAlertProps = {
  id?: string;
  message: string;
};

export function CommunicationActionsFieldAlert({
  id,
  message,
}: CommunicationActionsFieldAlertProps) {
  return (
    <p
      id={id}
      role="alert"
      className="mt-1 flex items-center gap-1.5 text-xs font-normal text-[#A81E1E]"
    >
      <span
        aria-hidden
        className="inline-block h-3.5 w-3.5 rounded-full border border-[#A81E1E] text-center text-[10px] font-bold leading-3"
      >
        !
      </span>
      {message}
    </p>
  );
}

export const AUDIT_JUSTIFICATION_SANDBOX_ERROR =
  'Select an audit justification to proceed.';
