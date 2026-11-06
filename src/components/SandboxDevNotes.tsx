import { useMemo, useState } from 'react';
import { useSandbox } from '../context/SandboxContext';
import { releaseStageToSlug, type ReleaseStageSlug } from '../utils/sandboxReleaseStage';

interface StageDoc {
  badgeTitle: string;
  summary: string;
  capabilities: { label: string; detail: string }[];
  integrations: { badge: string; name: string; detail: string; active: boolean }[];
  evaluationTip: string;
}

const stageData: Record<ReleaseStageSlug, StageDoc> = {
  'stage1-mvp': {
    badgeTitle: 'STAGE 1: MVP SCOPE (BASELINE OPERATIONAL TRIAGE)',
    summary:
      'Delivers core communication lookup, single-action resend capabilities, and streamlined 2-column metadata for immediate order support resolution.',
    capabilities: [
      {
        label: 'Activity Logs Table:',
        detail: '3 Columns (Recipient, Subject, Date/Time with top vertical alignment).',
      },
      {
        label: 'Message Metadata:',
        detail: '2-Column Balanced Grid (Recipient/Sender, Order/Account). Telemetry omitted.',
      },
      {
        label: 'Audit Justification:',
        detail: 'Suppressed / Hidden across all 3 communication tabs (Resend, Reply, Forward).',
      },
      {
        label: 'Error Simulation:',
        detail: 'Missing Audit Justification option hidden from Sandbox Utility Bar.',
      },
      {
        label: 'Action CTAs:',
        detail: 'Direct resend available; validation bypassed for reason codes.',
      },
    ],
    integrations: [
      {
        badge: 'SALESFORCE',
        name: 'Support_Action_Audit__c',
        detail: 'Basic logging; default enum (MVP_LEGACY_REPLAY) assigned.',
        active: true,
      },
      {
        badge: 'SENDGRID',
        name: 'Transactional Dispatch',
        detail: 'Direct template_id replay; live delivery webhooks suppressed.',
        active: true,
      },
      {
        badge: 'TRIMBLE ID',
        name: 'Agent TID Audit',
        detail: 'Records acting support agent TID into audit record.',
        active: true,
      },
      {
        badge: 'STANDBY',
        name: 'OMS & Tax Holds',
        detail: 'Line-item returns, refunds, and D-Country holds deferred.',
        active: false,
      },
    ],
    evaluationTip:
      'Switch Release Stage to Stage 2: Enhanced to observe the 3-column metadata expansion, delivery status badges in Column 3, and mandatory justification enforcement.',
  },
  'stage2-enhanced': {
    badgeTitle: 'STAGE 2: ENHANCED SCOPE (TELEMETRY & COMPLIANCE GOVERNANCE)',
    summary:
      'Introduces live SendGrid delivery status telemetry, expanded 3-column domain metadata, and mandatory operational justification logging for CRM audit compliance.',
    capabilities: [
      {
        label: 'Activity Logs Table:',
        detail:
          '3 Columns with embedded Modus Status Badges (Delivered, Bounced, Dropped) in Date/Time.',
      },
      {
        label: 'Message Metadata:',
        detail:
          '3-Column Domain Grid (Adds Triggering Event and copyable SendGrid Template ID).',
      },
      {
        label: 'Typographic Scale:',
        detail: '12px semibold labels (#495057) paired with 14px regular values (#212529).',
      },
      {
        label: 'Audit Justification:',
        detail: 'Mandatory dropdown active across all tabs with 4 operational reasons.',
      },
      {
        label: 'Error Simulation:',
        detail: 'Missing Audit Justification Error restored in Sandbox Utility Bar.',
      },
    ],
    integrations: [
      {
        badge: 'SALESFORCE',
        name: 'Support_Action_Audit__c',
        detail: 'Mandatory Justification_Code__c and note payload written on send.',
        active: true,
      },
      {
        badge: 'SENDGRID',
        name: 'Event Webhook Pipeline',
        detail: 'Ingests real-time delivery telemetry (delivered, bounce, dropped).',
        active: true,
      },
      {
        badge: 'ADMIN CONSOLE',
        name: 'Account ID Lookups',
        detail: 'Direct cross-linking to master enterprise organization profiles.',
        active: true,
      },
      {
        badge: 'ACTIVE OMS',
        name: 'Order Exception Sync',
        detail:
          'Telemetry tags correlate with order invoice and tax exemption hold statuses.',
        active: true,
      },
    ],
    evaluationTip:
      'Test form validation by attempting to resend without selecting an Audit Justification, or use the Error State dropdown to simulate missing field errors.',
  },
  'stage3-north-star': {
    badgeTitle: 'STAGE 3: NORTH STAR (CENTRALIZED MULTI-CHANNEL SUPPORT HUB)',
    summary:
      'The complete direct-via-web post-purchase destination: bi-directional CRM case management, multi-folder activity navigation, and comprehensive order exception triage.',
    capabilities: [
      {
        label: 'Activity Logs Table:',
        detail: 'Full 5+ column grid with Rep TID, advanced multi-field filters, and search indexing.',
      },
      {
        label: 'Message Metadata:',
        detail:
          '3-Column Domain Grid with full system telemetry, raw payload viewers, and template overrides.',
      },
      {
        label: 'Folder Navigation:',
        detail: 'Side drawer with folder tree (All Logs, Bounced, Dropped, Customer Resends).',
      },
      {
        label: 'Communication Suite:',
        detail:
          'Full rich-text composer, CC/BCC expansion, attachment handling, and audit timeline.',
      },
      {
        label: 'Order Exception Flows:',
        detail:
          'Unified actions for Cancel Orders, Process Returns, Refund Orders, and Release Holds.',
      },
    ],
    integrations: [
      {
        badge: 'SALESFORCE',
        name: 'Service Cloud Integration',
        detail:
          'Bi-directional sync with Case Management, Service Console, and TID entitlements.',
        active: true,
      },
      {
        badge: 'SENDGRID',
        name: 'Dynamic Template Studio',
        detail: 'Live template previews, bounce diagnosis, and automated replay pipelines.',
        active: true,
      },
      {
        badge: 'COMMERCE CLOUD',
        name: 'Centralized Post-Purchase',
        detail: 'Full self-service and rep-assisted order modification lifecycle.',
        active: true,
      },
      {
        badge: 'COMPLIANCE',
        name: 'Trade & Tax Engine',
        detail: 'Integrated automated verification for D-Country and Tax Exemption holds.',
        active: true,
      },
    ],
    evaluationTip:
      'Explore the full unconstrained architecture. Toggle between stages in Tier 2 of the Utility Bar to verify backward-compatible rendering.',
  },
};

export function SandboxDevNotes() {
  const { releaseStage } = useSandbox();
  const [isOpen, setIsOpen] = useState(false);

  const activeKey = releaseStageToSlug(releaseStage);
  const currentDoc = useMemo(() => stageData[activeKey], [activeKey]);

  return (
    <aside
      aria-label="Release Stage Developer Notes"
      className="relative z-40 border-t border-[#0063A3] bg-[#0F141C] text-gray-200 transition-all duration-200"
    >
      <div className="flex items-center justify-between px-6 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="h-5 w-1 shrink-0 rounded-r bg-[#0063A3]" aria-hidden="true" />

          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-sm text-[#00A3E0]" aria-hidden="true">
              ℹ
            </span>
            <p className="truncate text-xs font-bold uppercase tracking-wider text-white">
              {currentDoc.badgeTitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="dev-notes-content"
          className="ml-4 shrink-0 rounded border border-gray-700 bg-[#1A222D] px-3 py-1 text-xs text-gray-300 transition-colors hover:bg-[#25303F] hover:text-white focus:outline-none focus:ring-1 focus:ring-[#0063A3]"
        >
          {isOpen ? 'Hide Dev Notes' : 'Show Dev Notes'}
        </button>
      </div>

      {isOpen ? (
        <div id="dev-notes-content" className="border-t border-gray-800 px-6 pb-5 pt-1">
          <p className="mb-5 text-xs font-normal leading-relaxed text-gray-300">
            {currentDoc.summary}
          </p>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#00A3E0]">
                Stage Capabilities
              </h3>
              <ul className="space-y-2">
                {currentDoc.capabilities.map((cap) => (
                  <li key={cap.label} className="flex items-start gap-2.5 text-xs">
                    <span className="shrink-0 rounded border border-gray-700 bg-[#1A222D] px-2 py-0.5 text-[11px] font-semibold text-gray-300">
                      {cap.label}
                    </span>
                    <span className="pt-0.5 leading-tight text-gray-300">{cap.detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#00A3E0]">
                Subsystem Integration &amp; Data Paths
              </h3>
              <ul className="space-y-2">
                {currentDoc.integrations.map((item) => (
                  <li key={`${item.badge}-${item.name}`} className="flex items-start gap-2.5 text-xs">
                    <span
                      className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                        item.active
                          ? 'bg-[#0063A3] text-white'
                          : 'border border-gray-700 bg-[#25303F] text-gray-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                    <div className="pt-0.5 leading-tight text-gray-300">
                      <strong className="font-semibold text-white">{item.name}:</strong>{' '}
                      {item.detail}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-2 rounded border border-gray-800 bg-[#161D26] p-3 pt-3 text-xs text-gray-300">
            <span aria-hidden="true">💡</span>
            <p>
              <strong className="font-semibold text-white">Evaluation Guide:</strong>{' '}
              {currentDoc.evaluationTip}
            </p>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
