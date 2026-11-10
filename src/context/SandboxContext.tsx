import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

// ============================================================================
// 1. Role, Persona, and Scope Types
// ============================================================================

export type SupportRoleType =
  | 'super-admin'
  | 'admin'
  | 'customer-support'
  | 'general-cs'
  | 'enhanced-cs'
  | 'epayments-cs'
  | 'epayments-team'
  | 'view-only-cs'
  | 'unassigned';

export type RepRole =
  | 'Super Admin'
  | 'Administrator'
  | 'Customer Support'
  | 'General Customer Support'
  | 'Enhanced Customer Support'
  | 'E-Payments Customer Support'
  | 'View-Only Customer Support';

export type ReleaseStage = 'stage1-mvp' | 'stage2-enhanced' | 'stage3-northstar';
export type PurchaseType = 'saas-subscription' | 'physical-hardware' | 'perpetual-license';

export type FeatureScope =
  | 'DXPBK-1900'
  | 'DXPBK-2123'
  | 'all'
  | 'active-only'
  | 'planned-only'
  | (string & {});

export interface RoleDefinition {
  id: SupportRoleType;
  label: string;
  allowedTiles: string[];
}

// ============================================================================
// 2. Master Operational Tile Catalog (Single Source of Truth)
// Exactly 14 modules: 8 Active Operational Triage + 6 Planned Roadmap
// ============================================================================

export const PORTAL_OPERATIONAL_TILE_IDS: readonly string[] = [
  // 8 Active Operational Triage Modules
  'failed-orders',
  'cancel-orders',
  'order-details',
  'refund-orders',
  'release-holds',
  'tax-exemption-holds',
  'reports',
  'process-returns',

  // 6 Planned Roadmap Modules (Stage 2/3 Preview)
  'product-upload',
  'promo-code-upload',
  'process-chargeback',
  'email-activity-logs',
  'role-management',
  'trial-frequency-cap',
] as const;

export const PORTAL_OPERATIONAL_TILE_COUNT = PORTAL_OPERATIONAL_TILE_IDS.length; // 14

export const ROLE_DEFINITIONS: Record<SupportRoleType, RoleDefinition> = {
  'super-admin': {
    id: 'super-admin',
    label: 'Super Admin',
    allowedTiles: [
      'failed-orders',
      'cancel-orders',
      'order-details',
      'refund-orders',
      'release-holds',
      'tax-exemption-holds',
      'reports',
      'process-returns',
      'product-upload',
      'promo-code-upload',
      'process-chargeback',
      'email-activity-logs',
      'role-management',
      'trial-frequency-cap',
    ],
  },
  admin: {
    id: 'admin',
    label: 'Administrator (System Operations)',
    allowedTiles: ['failed-orders', 'role-management', 'email-activity-logs'],
  },
  'customer-support': {
    id: 'customer-support',
    label: 'Customer Support',
    allowedTiles: [
      'failed-orders',
      'cancel-orders',
      'order-details',
      'refund-orders',
      'release-holds',
      'tax-exemption-holds',
      'reports',
      'process-returns',
    ],
  },
  'general-cs': {
    id: 'general-cs',
    label: 'General Customer Support',
    allowedTiles: ['order-details', 'cancel-orders', 'refund-orders', 'process-returns', 'reports'],
  },
  'enhanced-cs': {
    id: 'enhanced-cs',
    label: 'Enhanced Customer Support',
    allowedTiles: ['order-details', 'product-upload', 'promo-code-upload', 'email-activity-logs'],
  },
  'epayments-cs': {
    id: 'epayments-cs',
    label: 'E-Payments Customer Support',
    allowedTiles: ['order-details', 'process-chargeback'],
  },
  'epayments-team': {
    id: 'epayments-team',
    label: 'E-Payments Team',
    allowedTiles: ['order-details', 'process-chargeback', 'email-activity-logs'],
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

// ============================================================================
// 3. Helper Functions, Stubs & Custom Hooks (Ticket DXPBK-2123)
// ============================================================================

export const isOperationalTile = (id: string): boolean => {
  return (PORTAL_OPERATIONAL_TILE_IDS as readonly string[]).includes(id);
};

export const getTileLabel = (id: string): string => {
  return id.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getVisibleOperationalTileIds = (
  _scope: FeatureScope = 'DXPBK-2123',
  role: SupportRoleType = 'super-admin',
  _stage: ReleaseStage = 'stage2-enhanced'
): string[] => {
  return ROLE_DEFINITIONS[role]?.allowedTiles || [];
};

export const telemetryStreamWarning = null;

export const logMatchesSandboxDelivery = (
  _log?: any,
  _filterCriteria?: any
): boolean => true;

export const logMatchesSandboxTemplate = (
  _log?: any,
  _filterCriteria?: any
): boolean => true;

export const auditLogMatchesSandboxDelivery = (
  _log?: any,
  _filterCriteria?: any
): boolean => true;

/**
 * Callable permission guard function resolving Ln 28 in LogDetailsPage.tsx
 */
export const communicationActionsReadOnly = (_role?: any): boolean => false;

/**
 * Stage view return contract explicitly providing layout and metadata flags
 */
export interface ReleaseStageViewResult {
  stage: ReleaseStage;
  isMVP: boolean;
  isStage1: boolean;
  isStage2: boolean;
  isStage3: boolean;
  isStage2Or3: boolean;
  useCompactActivityLogTable: boolean;
  showStatusBadgeInCompactDateColumn: boolean;
  // Metadata flags consumed by LogDetailsPage.tsx
  showAccountIdMetadata: boolean;
  showTriggeringEventMetadata: boolean;
  showSendGridTemplateId: boolean;
  useMvpAuditHistoryTable: boolean;
  showAuditJustification: boolean;
}

export const useReleaseStageView = (): ReleaseStageViewResult => {
  const { releaseStage } = useSandbox();
  const isMVP = releaseStage === 'stage1-mvp';
  const isStage2 = releaseStage === 'stage2-enhanced';
  const isStage3 = releaseStage === 'stage3-northstar';

  return {
    stage: releaseStage,
    isMVP,
    isStage1: isMVP,
    isStage2,
    isStage3,
    isStage2Or3: isStage2 || isStage3,
    useCompactActivityLogTable: isMVP,
    showStatusBadgeInCompactDateColumn: !isStage3,
    showAccountIdMetadata: true,
    showTriggeringEventMetadata: true,
    showSendGridTemplateId: !isMVP,
    useMvpAuditHistoryTable: isMVP,
    showAuditJustification: isStage2 || isStage3,
  };
};

// ============================================================================
// 4. Context Definition and State Provider
// ============================================================================

export interface SandboxContextValue {
  releaseStage: ReleaseStage;
  setReleaseStage: (stage: ReleaseStage) => void;
  activeRole: SupportRoleType;
  /** Role alias expected by LogDetailsPage.tsx Ln 26 */
  repRole?: SupportRoleType;
  setActiveRole: (role: SupportRoleType) => void;
  purchaseType: PurchaseType;
  setPurchaseType: (type: PurchaseType) => void;
  featureScope: FeatureScope;
  setFeatureScope: (scope: FeatureScope) => void;
  allowedTiles: string[];
  isTileAllowed: (tileId: string) => boolean;
  isDevNotesOpen: boolean;
  setIsDevNotesOpen: (open: boolean) => void;
  toggleDevNotes: () => void;
  deliveryStatus?: string;
  templateType?: string;
}

const SandboxContext = createContext<SandboxContextValue | undefined>(undefined);

export interface SandboxProviderProps {
  children: React.ReactNode;
  initialStage?: ReleaseStage;
  initialRole?: SupportRoleType;
  initialPurchaseType?: PurchaseType;
  initialFeatureScope?: FeatureScope;
}

export const SandboxProvider: React.FC<SandboxProviderProps> = ({
  children,
  initialStage = 'stage2-enhanced',
  initialRole = 'super-admin',
  initialPurchaseType = 'saas-subscription',
  initialFeatureScope = 'DXPBK-2123',
}) => {
  const [releaseStage, setReleaseStage] = useState<ReleaseStage>(initialStage);
  const [activeRole, setActiveRole] = useState<SupportRoleType>(initialRole);
  const [purchaseType, setPurchaseType] = useState<PurchaseType>(initialPurchaseType);
  const [featureScope, setFeatureScope] = useState<FeatureScope>(initialFeatureScope);
  const [isDevNotesOpen, setIsDevNotesOpen] = useState<boolean>(true);

  const allowedTiles = useMemo(() => {
    return ROLE_DEFINITIONS[activeRole]?.allowedTiles || [];
  }, [activeRole]);

  const isTileAllowed = useCallback(
    (tileId: string): boolean => {
      return Array.isArray(allowedTiles) && allowedTiles.includes(tileId);
    },
    [allowedTiles]
  );

  const toggleDevNotes = useCallback(() => {
    setIsDevNotesOpen((prev) => !prev);
  }, []);

 // ---> YOUR CODE SNIPPET BELONGS RIGHT HERE <---
 const value = useMemo(
  () => ({
    releaseStage,
    setReleaseStage,
    activeRole,
    repRole: activeRole,
    setActiveRole,
    purchaseType,
    setPurchaseType,
    featureScope,
    setFeatureScope,
    allowedTiles,
    isTileAllowed,
    isDevNotesOpen,
    setIsDevNotesOpen,
    toggleDevNotes,
    deliveryStatus: 'all',
    templateType: 'all',
  }),
  [
    releaseStage,
    activeRole,
    purchaseType,
    featureScope,
    allowedTiles,
    isTileAllowed,
    isDevNotesOpen,
    toggleDevNotes,
  ]
);

return <SandboxContext.Provider value={value}>{children}</SandboxContext.Provider>;
};

export const useSandbox = (): SandboxContextValue => {
  const context = useContext(SandboxContext);
  if (!context) {
    throw new Error('useSandbox must be used within a SandboxProvider');
  }
  return context;
};