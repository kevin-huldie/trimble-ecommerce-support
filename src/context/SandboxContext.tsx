import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ActivityLogRecord, LogDeliveryStatus } from '../data/mockLogs';
import { releaseStageToSlug, type ReleaseStageSlug } from '../utils/sandboxReleaseStage';
import type { ProductHorizon } from './HorizonContext';

export type FeatureScopeId =
  | 'DXPBK-1900'
  | 'DXPBK-2100'
  | 'DXPBK-2101'
  | 'DXPBK-2102'
  | 'DXPBK-2103'
  | 'DXPBK-2104'
  | 'DXPBK-2105';

/** Primary-row support rep role simulation (matches `rep-role` select options). */
export type RepRole =
  | 'View-Only Customer Support'
  | 'General Customer Support'
  | 'Enhanced Customer Support'
  | 'E-Payments Customer Support'
  | 'Administrator';

/** @deprecated Use `RepRole`. */
export type SandboxRole = RepRole;

/** Fixed primary-row purchase type (read-only in the utility bar). */
export type PurchaseType = 'SaaS Subscription';

export const FEATURE_SCOPE_DXBK_1900_LABEL =
  'DXPBK-1900 | Establish Repository for All Customer Emails';

export const PURCHASE_TYPE_LABEL: PurchaseType = 'SaaS Subscription';

export const REP_ROLE_LABEL: RepRole = 'General Customer Support';

/** DXPBK-1900 secondary row — release stage (`feature-release-stage`). */
export type ReleaseStage =
  | 'Stage 1: MVP'
  | 'Stage 2: Enhanced'
  | 'Stage 3: North Star';

/** DXPBK-1900 feature control: delivery status simulation. */
export type SandboxDeliveryStatus =
  | 'all-dispatches'
  | 'delivered-250'
  | 'bounced-550-mailbox'
  | 'dropped-spam'
  | 'tax-exemption-held'
  | 'pending-processing';

export type TemplateTypeSimulation =
  | 'all-templates'
  | 'tmb-ord-01'
  | 'tmb-inv-02'
  | 'tmb-ret-01'
  | 'tmb-tax-hold'
  | 'tmb-sanct-01'
  | 'tmb-trl-01';

export type ConsentMode = 'enforce-checkbox' | 'pre-approved-rep-4402' | 'bypass-admin-audit';

export type TelemetryStream =
  | 'sendgrid-live-mock'
  | 'webhook-lag-30s'
  | 'smtp-connection-503';

export type SandboxState = {
  /** Fixed prototype ticket scope (primary row is read-only). */
  featureScope: FeatureScopeId;
  repRole: RepRole;
  purchaseType: PurchaseType;
  releaseStage: ReleaseStage;
  deliveryStatus: SandboxDeliveryStatus;
  templateType: TemplateTypeSimulation;
  consentMode: ConsentMode;
  telemetryStream: TelemetryStream;
};

type SandboxContextValue = SandboxState & {
  setReleaseStage: (value: ReleaseStage) => void;
  setDeliveryStatus: (value: SandboxDeliveryStatus) => void;
  setTemplateType: (value: TemplateTypeSimulation) => void;
  setConsentMode: (value: ConsentMode) => void;
  setTelemetryStream: (value: TelemetryStream) => void;
};

const DEFAULT_SANDBOX_STATE: SandboxState = {
  featureScope: 'DXPBK-1900',
  repRole: REP_ROLE_LABEL,
  purchaseType: PURCHASE_TYPE_LABEL,
  releaseStage: 'Stage 1: MVP',
  deliveryStatus: 'all-dispatches',
  templateType: 'all-templates',
  consentMode: 'enforce-checkbox',
  telemetryStream: 'sendgrid-live-mock',
};

const SandboxContext = createContext<SandboxContextValue | null>(null);

export function SandboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SandboxState>(DEFAULT_SANDBOX_STATE);

  const setReleaseStage = useCallback((releaseStage: ReleaseStage) => {
    setState((prev) => ({ ...prev, releaseStage }));
  }, []);
  const setDeliveryStatus = useCallback((deliveryStatus: SandboxDeliveryStatus) => {
    setState((prev) => ({ ...prev, deliveryStatus }));
  }, []);
  const setTemplateType = useCallback((templateType: TemplateTypeSimulation) => {
    setState((prev) => ({ ...prev, templateType }));
  }, []);
  const setConsentMode = useCallback((consentMode: ConsentMode) => {
    setState((prev) => ({ ...prev, consentMode }));
  }, []);
  const setTelemetryStream = useCallback((telemetryStream: TelemetryStream) => {
    setState((prev) => ({ ...prev, telemetryStream }));
  }, []);

  const value = useMemo(
    (): SandboxContextValue => ({
      ...state,
      setReleaseStage,
      setDeliveryStatus,
      setTemplateType,
      setConsentMode,
      setTelemetryStream,
    }),
    [
      state,
      setReleaseStage,
      setDeliveryStatus,
      setTemplateType,
      setConsentMode,
      setTelemetryStream,
    ],
  );

  return <SandboxContext.Provider value={value}>{children}</SandboxContext.Provider>;
}

export function useSandbox(): SandboxContextValue {
  const ctx = useContext(SandboxContext);
  if (!ctx) {
    throw new Error('useSandbox must be used within a SandboxProvider');
  }
  return ctx;
}

export function isStage1Mvp(releaseStage: ReleaseStage): boolean {
  return releaseStage === 'Stage 1: MVP';
}

export function isStage2Enhanced(releaseStage: ReleaseStage): boolean {
  return releaseStage === 'Stage 2: Enhanced';
}

export function isStage3NorthStar(releaseStage: ReleaseStage): boolean {
  return releaseStage === 'Stage 3: North Star';
}

/**
 * Normalized release-stage flags for additive UI branches.
 * Stage 3: North Star remains the default comprehensive experience (`isNorthStar` fallback).
 */
export type ReleaseStageViewFlags = {
  releaseStage: ReleaseStage;
  slug: ReleaseStageSlug;
  isMVP: boolean;
  isEnhanced: boolean;
  isNorthStar: boolean;
  showAuditJustification: boolean;
  showStatusBadges: boolean;
  showTriggeringEventFilter: boolean;
  showDeliveryStatusFilter: boolean;
  showTriggeringEventMetadata: boolean;
  /** SendGrid Template ID — Stage 2: Enhanced and Stage 3: North Star. */
  showSendGridTemplateId: boolean;
  /** Account ID in Message Metadata right column (all stages). */
  showAccountIdMetadata: boolean;
  /** @deprecated Use {@link ReleaseStageViewFlags.showAccountIdMetadata}. */
  showMvpAccountIdMetadata: boolean;
  /** Stage 1: MVP — simplified sidebar / advanced filters. */
  useMvpActivityLogsTable: boolean;
  /** Stage 1: MVP or Stage 2: Enhanced — 3-column Recipient / Subject / Date-Time table. */
  useCompactActivityLogsTable: boolean;
  /** Stage 2: Enhanced — delivery status badge stacked above date/time in column 3. */
  showStatusBadgeInCompactDateColumn: boolean;
  useMvpAuditHistoryTable: boolean;
};

export function getReleaseStageViewFlags(releaseStage: ReleaseStage): ReleaseStageViewFlags {
  const isMVP = isStage1Mvp(releaseStage);
  const isEnhanced = isStage2Enhanced(releaseStage);
  const isNorthStar = isStage3NorthStar(releaseStage) || (!isMVP && !isEnhanced);

  const showAuditJustification = isEnhanced || isNorthStar;
  const showStatusBadges = isEnhanced || isNorthStar;
  const showTriggeringEventFilter = isEnhanced || isNorthStar;
  const showDeliveryStatusFilter = isEnhanced || isNorthStar;
  const showTriggeringEventMetadata = isEnhanced || isNorthStar;
  const showSendGridTemplateId = isEnhanced || isNorthStar;
  const showAccountIdMetadata = isMVP || isEnhanced || isNorthStar;

  return {
    releaseStage,
    slug: releaseStageToSlug(releaseStage),
    isMVP,
    isEnhanced,
    isNorthStar,
    showAuditJustification,
    showStatusBadges,
    showTriggeringEventFilter,
    showDeliveryStatusFilter,
    showTriggeringEventMetadata,
    showSendGridTemplateId,
    showAccountIdMetadata,
    showMvpAccountIdMetadata: isMVP,
    useMvpActivityLogsTable: isMVP,
    useCompactActivityLogsTable: isMVP || isEnhanced,
    showStatusBadgeInCompactDateColumn: isEnhanced,
    useMvpAuditHistoryTable: isMVP,
  };
}

export function useReleaseStageView(): ReleaseStageViewFlags {
  const { releaseStage } = useSandbox();
  return useMemo(() => getReleaseStageViewFlags(releaseStage), [releaseStage]);
}

export function releaseStageToHorizon(stage: ReleaseStage): ProductHorizon {
  switch (stage) {
    case 'Stage 3: North Star':
      return 'H3';
    case 'Stage 2: Enhanced':
      return 'H2';
    default:
      return 'H1';
  }
}

export function horizonToReleaseStage(horizon: ProductHorizon): ReleaseStage {
  switch (horizon) {
    case 'H3':
      return 'Stage 3: North Star';
    case 'H2':
      return 'Stage 2: Enhanced';
    default:
      return 'Stage 1: MVP';
  }
}

export type SandboxDeliveryDisplay = {
  status: LogDeliveryStatus | 'Dropped';
  label: string;
};

/** Badge pill + log filter mapping for sandbox delivery simulation. */
export function sandboxDeliveryDisplay(
  simulation: SandboxDeliveryStatus,
): SandboxDeliveryDisplay | null {
  switch (simulation) {
    case 'delivered-250':
      return { status: 'Delivered', label: 'Delivered (250 OK)' };
    case 'bounced-550-mailbox':
      return { status: 'Bounced', label: 'Bounced (550)' };
    case 'dropped-spam':
      return { status: 'Dropped', label: 'Dropped (Spam)' };
    case 'tax-exemption-held':
      return { status: 'Held', label: 'Tax Exemption Held' };
    case 'pending-processing':
      return { status: 'Pending', label: 'Pending Processing' };
    default:
      return null;
  }
}

export function sandboxDeliveryToLogStatus(
  simulation: SandboxDeliveryStatus,
): LogDeliveryStatus | '' {
  const display = sandboxDeliveryDisplay(simulation);
  if (!display || display.status === 'Dropped') {
    if (simulation === 'dropped-spam') {
      return 'Deferred';
    }
    return '';
  }
  return display.status;
}

export function logMatchesSandboxDelivery(
  log: ActivityLogRecord,
  simulation: SandboxDeliveryStatus,
): boolean {
  if (simulation === 'all-dispatches') {
    return true;
  }
  if (simulation === 'dropped-spam') {
    return log.deliveryStatus === 'Deferred' || log.deliveryStatus === 'Bounced';
  }
  if (simulation === 'tax-exemption-held') {
    return (
      log.deliveryStatus === 'Held'
      || log.deliveryStatus === 'Pending'
      || /tax exemption/i.test(log.subject)
      || /tax exemption/i.test(log.triggeringEvent)
    );
  }
  const mapped = sandboxDeliveryToLogStatus(simulation);
  return mapped === '' || log.deliveryStatus === mapped;
}

export function logMatchesSandboxTemplate(
  log: ActivityLogRecord,
  template: TemplateTypeSimulation,
): boolean {
  if (template === 'all-templates') {
    return true;
  }
  const subject = log.subject.toLowerCase();
  const event = log.triggeringEvent.toLowerCase();
  switch (template) {
    case 'tmb-ord-01':
      return subject.includes('order confirmation') || event.includes('order confirmation');
    case 'tmb-inv-02':
      return subject.includes('invoice') || event.includes('license provisioning');
    case 'tmb-ret-01':
      return subject.includes('return') || event.includes('return');
    case 'tmb-tax-hold':
      return /tax exemption/i.test(subject) || /tax exemption/i.test(event);
    case 'tmb-sanct-01':
      return /d-country/i.test(subject) || /d-country/i.test(event) || /sanction/i.test(event);
    case 'tmb-trl-01':
      return subject.includes('trial') || event.includes('trial');
    default:
      return true;
  }
}

export function auditLogMatchesSandboxDelivery(
  deliveryStatus: LogDeliveryStatus,
  simulation: SandboxDeliveryStatus,
): boolean {
  if (simulation === 'all-dispatches') {
    return true;
  }
  if (simulation === 'dropped-spam') {
    return deliveryStatus === 'Deferred' || deliveryStatus === 'Bounced';
  }
  if (simulation === 'tax-exemption-held') {
    return deliveryStatus === 'Held' || deliveryStatus === 'Pending';
  }
  const mapped = sandboxDeliveryToLogStatus(simulation);
  return mapped === '' || deliveryStatus === mapped;
}

export function telemetryStreamWarning(stream: TelemetryStream): string | null {
  switch (stream) {
    case 'webhook-lag-30s':
      return 'Telemetry simulation: SendGrid webhooks are delayed ~30 seconds. Activity counts may be stale.';
    case 'smtp-connection-503':
      return 'Telemetry simulation: SMTP connection error (503 Service Unavailable). Delivery events may be missing from the stream.';
    default:
      return null;
  }
}

const FEATURE_SCOPE_HOME_TILE: Record<FeatureScopeId, string> = {
  'DXPBK-1900': 'email-activity-logs',
  'DXPBK-2100': 'cancel-orders',
  'DXPBK-2101': 'returns',
  'DXPBK-2102': 'releasing-holds',
  'DXPBK-2103': 'tax-exempt-holds',
  'DXPBK-2104': 'reprocess-failed',
  'DXPBK-2105': 'order-details',
};

export function isHomeTileInFeatureScope(tileId: string, featureScope: FeatureScopeId): boolean {
  return FEATURE_SCOPE_HOME_TILE[featureScope] === tileId;
}

export function supportRepCanEditCommunicationActions(repRole: RepRole): boolean {
  return repRole !== 'View-Only Customer Support';
}

export function communicationActionsReadOnly(repRole: RepRole, _releaseStage: ReleaseStage): boolean {
  return !supportRepCanEditCommunicationActions(repRole);
}

export function consentRequiredForSubmit(mode: ConsentMode): boolean {
  return mode === 'enforce-checkbox';
}

export function consentCheckboxDisabled(mode: ConsentMode): boolean {
  return mode === 'pre-approved-rep-4402' || mode === 'bypass-admin-audit';
}

export function consentCheckboxDefaultChecked(mode: ConsentMode): boolean {
  return mode === 'pre-approved-rep-4402' || mode === 'bypass-admin-audit';
}
