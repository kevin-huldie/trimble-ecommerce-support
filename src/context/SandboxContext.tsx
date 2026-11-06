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

/** Primary comparison scope: role-gated prototype vs. activity-logs refinement. */
export type FeatureScope = 'DXPBK-2123' | 'DXPBK-1900';

/** @deprecated Use {@link FeatureScope}. */
export type FeatureScopeId = FeatureScope;

export type ReleaseStage = 'stage1-mvp' | 'stage2-enhanced' | 'stage3-northstar';

export type SupportRoleType =
  | 'admin'
  | 'customer-support'
  | 'enhanced-cs'
  | 'epayments-cs'
  | 'epayments-team'
  | 'general-cs'
  | 'view-only-cs'
  | 'unassigned';

/** Primary-row support rep role labels (communication actions / read-only). */
export type RepRole =
  | 'View-Only Customer Support'
  | 'General Customer Support'
  | 'Enhanced Customer Support'
  | 'E-Payments Customer Support'
  | 'Administrator';

/** @deprecated Use `RepRole`. */
export type SandboxRole = RepRole;

export type PurchaseType = 'saas-subscription' | 'physical-hardware' | 'perpetual-license';

export interface RoleDefinition {
  id: SupportRoleType;
  label: string;
  allowedTiles: string[];
}

/**
 * Home portal tiles (`HomePage`), task-frequency order — single source of truth for RBAC ids.
 */
export const PORTAL_OPERATIONAL_TILE_IDS: readonly string[] = [
  'order-details',
  'cancel-orders',
  'refund-orders',
  'process-returns',
  'release-holds',
  'tax-exemption-holds',
  'chargebacks',
  'failed-orders',
  'generate-report',
  'product-upload',
  'promo-code-upload',
  'role-management',
] as const;

export const PORTAL_OPERATIONAL_TILE_COUNT = PORTAL_OPERATIONAL_TILE_IDS.length;

export const ROLE_DEFINITIONS: Record<SupportRoleType, RoleDefinition> = {
  admin: {
    id: 'admin',
    label: 'Administrator',
    allowedTiles: ['failed-orders', 'role-management'],
  },
  'customer-support': {
    id: 'customer-support',
    label: 'Customer Support',
    allowedTiles: [
      'order-details',
      'cancel-orders',
      'refund-orders',
      'process-returns',
      'release-holds',
      'tax-exemption-holds',
      'generate-report',
    ],
  },
  'enhanced-cs': {
    id: 'enhanced-cs',
    label: 'Enhanced Customer Support',
    allowedTiles: ['product-upload', 'promo-code-upload'],
  },
  'epayments-cs': {
    id: 'epayments-cs',
    label: 'E-Payments Customer Support',
    allowedTiles: ['chargebacks'],
  },
  'epayments-team': {
    id: 'epayments-team',
    label: 'E-Payments Team',
    allowedTiles: ['order-details', 'chargebacks'],
  },
  'general-cs': {
    id: 'general-cs',
    label: 'General Customer Support',
    allowedTiles: [
      'cancel-orders',
      'refund-orders',
      'process-returns',
      'release-holds',
      'tax-exemption-holds',
      'generate-report',
    ],
  },
  'view-only-cs': {
    id: 'view-only-cs',
    label: 'View-Only Customer Support',
    allowedTiles: ['order-details'],
  },
  unassigned: {
    id: 'unassigned',
    label: 'Unassigned',
    allowedTiles: [],
  },
};

export function getVisibleOperationalTileIds(
  featureScope: FeatureScope,
  activeRole: SupportRoleType,
): string[] {
  if (featureScope === 'DXPBK-1900') {
    return [...PORTAL_OPERATIONAL_TILE_IDS];
  }
  const def = ROLE_DEFINITIONS[activeRole];
  if (!def || def.allowedTiles.length === 0) {
    return [];
  }
  const allowed = new Set(def.allowedTiles);
  return PORTAL_OPERATIONAL_TILE_IDS.filter((id) => allowed.has(id));
}

function supportRoleTypeToRepRole(role: SupportRoleType): RepRole {
  switch (role) {
    case 'view-only-cs':
      return 'View-Only Customer Support';
    case 'enhanced-cs':
      return 'Enhanced Customer Support';
    case 'epayments-cs':
    case 'epayments-team':
      return 'E-Payments Customer Support';
    case 'admin':
      return 'Administrator';
    default:
      return 'General Customer Support';
  }
}

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
  featureScope: FeatureScope;
  /** Support rep simulation (DXPBK-2123); exposed as `activeRole` + `repRole` (mapped label). */
  activeRole: SupportRoleType;
  purchaseType: PurchaseType;
  releaseStage: ReleaseStage;
  deliveryStatus: SandboxDeliveryStatus;
  templateType: TemplateTypeSimulation;
  consentMode: ConsentMode;
  telemetryStream: TelemetryStream;
};

type SandboxContextValue = SandboxState & {
  setFeatureScope: (scope: FeatureScope) => void;
  setActiveRole: (role: SupportRoleType) => void;
  setPurchaseType: (value: PurchaseType) => void;
  setReleaseStage: (value: ReleaseStage) => void;
  setDeliveryStatus: (value: SandboxDeliveryStatus) => void;
  setTemplateType: (value: TemplateTypeSimulation) => void;
  setConsentMode: (value: ConsentMode) => void;
  setTelemetryStream: (value: TelemetryStream) => void;
  /** Same ID as `activeRole`, for log-details / communication surfaces. */
  repRole: RepRole;
  isTileAllowed: (tileId: string) => boolean;
};

const DEFAULT_SANDBOX_STATE: SandboxState = {
  featureScope: 'DXPBK-2123',
  activeRole: 'customer-support',
  purchaseType: 'saas-subscription',
  releaseStage: 'stage1-mvp',
  deliveryStatus: 'all-dispatches',
  templateType: 'all-templates',
  consentMode: 'enforce-checkbox',
  telemetryStream: 'sendgrid-live-mock',
};

const SandboxContext = createContext<SandboxContextValue | null>(null);

export function SandboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SandboxState>(DEFAULT_SANDBOX_STATE);

  const setFeatureScope = useCallback((featureScope: FeatureScope) => {
    setState((prev) => {
      let next = { ...prev, featureScope };
      if (featureScope === 'DXPBK-2123' && prev.releaseStage === 'stage3-northstar') {
        next = { ...next, releaseStage: 'stage1-mvp' };
      }
      return next;
    });
  }, []);

  const setActiveRole = useCallback((activeRole: SupportRoleType) => {
    setState((prev) => ({ ...prev, activeRole }));
  }, []);

  const setPurchaseType = useCallback((purchaseType: PurchaseType) => {
    setState((prev) => ({ ...prev, purchaseType }));
  }, []);

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

  const repRole = useMemo(() => supportRoleTypeToRepRole(state.activeRole), [state.activeRole]);

  const isTileAllowed = useCallback(
    (tileId: string): boolean => {
      if (state.featureScope === 'DXPBK-1900') {
        return true;
      }
      const def = ROLE_DEFINITIONS[state.activeRole];
      return def ? def.allowedTiles.includes(tileId) : false;
    },
    [state.featureScope, state.activeRole],
  );

  const value = useMemo(
    (): SandboxContextValue => ({
      ...state,
      repRole,
      setFeatureScope,
      setActiveRole,
      setPurchaseType,
      setReleaseStage,
      setDeliveryStatus,
      setTemplateType,
      setConsentMode,
      setTelemetryStream,
      isTileAllowed,
    }),
    [
      state,
      repRole,
      setFeatureScope,
      setActiveRole,
      setPurchaseType,
      setReleaseStage,
      setDeliveryStatus,
      setTemplateType,
      setConsentMode,
      setTelemetryStream,
      isTileAllowed,
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
  return releaseStage === 'stage1-mvp';
}

export function isStage2Enhanced(releaseStage: ReleaseStage): boolean {
  return releaseStage === 'stage2-enhanced';
}

export function isStage3NorthStar(releaseStage: ReleaseStage): boolean {
  return releaseStage === 'stage3-northstar';
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
    case 'stage3-northstar':
      return 'H3';
    case 'stage2-enhanced':
      return 'H2';
    default:
      return 'H1';
  }
}

export function horizonToReleaseStage(horizon: ProductHorizon): ReleaseStage {
  switch (horizon) {
    case 'H3':
      return 'stage3-northstar';
    case 'H2':
      return 'stage2-enhanced';
    default:
      return 'stage1-mvp';
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
