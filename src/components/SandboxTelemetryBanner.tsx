import { telemetryStreamWarning, useSandbox } from '../context/SandboxContext';

/** Inline warning when sandbox telemetry stream is degraded (Activity Logs, etc.). */
export function SandboxTelemetryBanner() {
  const { telemetryStream, featureScope } = useSandbox();
  if (featureScope !== 'DXPBK-1900') {
    return null;
  }
  const message = telemetryStreamWarning(telemetryStream);
  if (!message) {
    return null;
  }
  return (
    <div
      className="border-b border-[#E36C09] bg-[#FFF4E5] px-4 py-2 text-xs font-semibold text-[#7A4100]"
      role="alert"
    >
      {message}
    </div>
  );
}
