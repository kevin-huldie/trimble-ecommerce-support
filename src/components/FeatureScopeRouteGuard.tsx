import { Navigate, useLocation } from 'react-router-dom';
import { useSandbox } from '../context/SandboxContext';

/**
 * When DXPBK-2123 is active, keep the app on the homepage so deep links to
 * DXPBK-1900 flows (logs, details, etc.) cannot be used.
 */
export function FeatureScopeRouteGuard() {
  const { featureScope } = useSandbox();
  const { pathname } = useLocation();

  if (featureScope === 'DXPBK-2123' && pathname !== '/') {
    return <Navigate to="/" replace />;
  }
  return null;
}
