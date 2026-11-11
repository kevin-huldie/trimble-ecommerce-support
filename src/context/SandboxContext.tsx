import React, { createContext, useContext, useState, type ReactNode } from 'react';

// =========================================================================
// AUTHORITATIVE 14-MODULE ROSTER & PERMISSION MATRIX (DXPBK-2123)
// =========================================================================
export const MODULE_CATALOG = [
  'Cancel Orders',
  'Email Activity Logs',
  'Order Details',
  'Process Chargeback',
  'Product Upload',
  'Promo Code Upload',
  'Refund Orders',
  'Reports',
  'Returns',
  'Releasing Holds',
  'Releasing Tax Exempted Holds',
  'Reprocessing Failed Orders',
  'Role Management',
  'Trial Frequency Cap',
] as const;

export type ModuleName = typeof MODULE_CATALOG[number];
export type SupportRepRole = 'Customer Support' | 'E-Payments Team' | 'Administrator';
export type ReleaseStage = 'stage1-mvp' | 'stage2-enhanced' | 'stage3-northstar';

export const ROLE_PERMISSIONS: Record<SupportRepRole, ModuleName[]> = {
  // Basic Access + General Customer Support + Email Activity Logs & Trial Frequency Cap
  'Customer Support': [
    'Order Details',
    'Returns',
    'Releasing Holds',
    'Releasing Tax Exempted Holds',
    'Cancel Orders',
    'Refund Orders',
    'Reports',
    'Email Activity Logs',
    'Trial Frequency Cap',
  ],
  // Basic Access + E-Payments Customer Support
  'E-Payments Team': [
    'Order Details',
    'Process Chargeback',
  ],
  // Full Access across all 5 permission set groups
  'Administrator': [
    'Cancel Orders',
    'Email Activity Logs',
    'Order Details',
    'Process Chargeback',
    'Product Upload',
    'Promo Code Upload',
    'Refund Orders',
    'Reports',
    'Returns',
    'Releasing Holds',
    'Releasing Tax Exempted Holds',
    'Reprocessing Failed Orders',
    'Role Management',
    'Trial Frequency Cap',
  ],
};

// =========================================================================
// SATELLITE EXPORTS FOR LOGS, AUDIT, AND TELEMETRY PAGES
// =========================================================================

// LogDetailsPage.tsx (Line 11) & communication actions
export const communicationActionsReadOnly: boolean = true;
export const communicationActionsDisabled: boolean = false;
export const communicationActionsMessage: string = 'Read-only audit record in sandbox mode';

// SandboxTelemetryBanner.tsx
export const telemetryStreamWarning: string | null = null;
export const telemetryStreamingActive: boolean = false;

// ActivityLogsPage.tsx & AuditTable.tsx filters
export const logMatchesSandboxDelivery = (_log: any, _stage?: ReleaseStage | string): boolean => true;
export const logMatchesSandboxTemplate = (_log: any, _templateFilter?: string): boolean => true;
export const auditLogMatchesSandboxDelivery = (_log: any, _stage?: ReleaseStage | string): boolean => true;
export const auditLogMatchesSandboxTemplate = (_log: any, _templateFilter?: string): boolean => true;

// General mock collections and state toggles for sub-routes
export const MOCK_ORDERS: any[] = [];
export const MOCK_ACCOUNTS: any[] = [];
export const MOCK_LOGS: any[] = [];
export const MOCK_AUDIT_LOGS: any[] = [];

export interface SandboxContextType {
  releaseStage: ReleaseStage;
  setReleaseStage: (stage: ReleaseStage) => void;
  currentRole: SupportRepRole;
  setCurrentRole: (role: SupportRepRole) => void;
  visibleModuleNames: ModuleName[];
  visibleModuleCountString: string;
  // Legacy / satellite properties
  telemetryStreamWarning?: string | null;
  communicationActionsReadOnly?: boolean;
  communicationActionsDisabled?: boolean;
  communicationActionsMessage?: string;
  logMatchesSandboxDelivery?: typeof logMatchesSandboxDelivery;
  logMatchesSandboxTemplate?: typeof logMatchesSandboxTemplate;
  auditLogMatchesSandboxDelivery?: typeof auditLogMatchesSandboxDelivery;
  auditLogMatchesSandboxTemplate?: typeof auditLogMatchesSandboxTemplate;
  selectedOrderId?: string | null;
  setSelectedOrderId?: (id: string | null) => void;
  selectedAccountId?: string | null;
  setSelectedAccountId?: (id: string | null) => void;
}

const defaultContextValue: SandboxContextType = {
  releaseStage: 'stage1-mvp',
  setReleaseStage: () => {},
  currentRole: 'Customer Support',
  setCurrentRole: () => {},
  visibleModuleNames: ROLE_PERMISSIONS['Customer Support'],
  visibleModuleCountString: '9 of 14 Modules',
  telemetryStreamWarning: null,
  communicationActionsReadOnly: true,
  communicationActionsDisabled: false,
  communicationActionsMessage: 'Read-only audit record in sandbox mode',
  logMatchesSandboxDelivery,
  logMatchesSandboxTemplate,
  auditLogMatchesSandboxDelivery,
  auditLogMatchesSandboxTemplate,
  selectedOrderId: null,
  setSelectedOrderId: () => {},
  selectedAccountId: null,
  setSelectedAccountId: () => {},
};

const SandboxContext = createContext<SandboxContextType>(defaultContextValue);

export const SandboxProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [releaseStage, setReleaseStage] = useState<ReleaseStage>('stage1-mvp');
  const [currentRole, setCurrentRole] = useState<SupportRepRole>('Customer Support');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const visibleModuleNames = ROLE_PERMISSIONS[currentRole] || ROLE_PERMISSIONS['Customer Support'];
  const visibleModuleCountString = `${visibleModuleNames.length} of ${MODULE_CATALOG.length} Modules`;

  return (
    <SandboxContext.Provider
      value={{
        releaseStage,
        setReleaseStage,
        currentRole,
        setCurrentRole,
        visibleModuleNames,
        visibleModuleCountString,
        telemetryStreamWarning,
        communicationActionsReadOnly,
        communicationActionsDisabled,
        communicationActionsMessage,
        logMatchesSandboxDelivery,
        logMatchesSandboxTemplate,
        auditLogMatchesSandboxDelivery,
        auditLogMatchesSandboxTemplate,
        selectedOrderId,
        setSelectedOrderId,
        selectedAccountId,
        setSelectedAccountId,
      }}
    >
      {children}
    </SandboxContext.Provider>
  );
};

export const useSandbox = (): SandboxContextType => {
  const context = useContext(SandboxContext);
  return context || defaultContextValue;
};

// Hook required by ActivityLogsPage.tsx
export const useReleaseStageView = () => {
  const { releaseStage } = useSandbox();
  return {
    releaseStage,
    isMvp: releaseStage === 'stage1-mvp',
    isEnhanced: releaseStage === 'stage2-enhanced',
    isNorthStar: releaseStage === 'stage3-northstar',
    layoutMode: releaseStage === 'stage1-mvp' ? 'density-5-col' : 'operational-3-col',
  };
};

export default SandboxContext;