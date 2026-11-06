import React, { useMemo, useState } from 'react';
import {
  useSandbox,
  ROLE_DEFINITIONS,
  getVisibleOperationalTileIds,
  PORTAL_OPERATIONAL_TILE_COUNT,
} from '../context/SandboxContext';
import type { SupportRoleType, ReleaseStage } from '../context/SandboxContext';

const READ_ONLY_FIELD_CLASS =
  'min-w-[12rem] rounded border border-gray-700 bg-[#141A23] px-2.5 py-1 text-xs text-gray-200 cursor-not-allowed select-none';

/** Wide enough for `DXPBK-2123 | Restrict Access by Role` at `text-xs` without clipping. */
const FEATURE_SCOPE_READ_ONLY_CLASS = `${READ_ONLY_FIELD_CLASS} min-w-[26rem] max-w-full`;

export const SandboxUtilityBar: React.FC = () => {
  const { releaseStage, setReleaseStage, activeRole, setActiveRole, featureScope } = useSandbox();

  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const visibleOperationalCount = useMemo(
    () => getVisibleOperationalTileIds(featureScope, activeRole).length,
    [featureScope, activeRole],
  );

  return (
    <div className="relative z-50 border-b border-[#0063A3] bg-[#0F141C] text-xs text-white">
      {/* Tier 1: Global Identity Bar */}
      <div className="flex w-full flex-wrap items-center justify-between gap-4 px-4 py-2.5">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-6">
          <span className="font-bold tracking-wide text-white">Trimble Prototype Sandbox</span>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <label htmlFor="feature-scope-readonly" className="shrink-0 font-bold text-gray-300">
              Feature Scope:
            </label>
            <input
              id="feature-scope-readonly"
              type="text"
              readOnly
              value="DXPBK-2123 | Restrict Access by Role"
              aria-disabled="true"
              className={FEATURE_SCOPE_READ_ONLY_CLASS}
            />
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <label htmlFor="purchase-type-readonly" className="shrink-0 font-bold text-gray-300">
              Purchase Type:
            </label>
            <input
              id="purchase-type-readonly"
              type="text"
              readOnly
              value="SaaS Subscription"
              aria-disabled="true"
              className={READ_ONLY_FIELD_CLASS}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded border border-gray-700 bg-[#1A222D] px-2.5 py-1 text-gray-400 hover:text-white focus:outline-none"
          aria-label={isExpanded ? 'Collapse Feature Controls' : 'Expand Feature Controls'}
        >
          {isExpanded ? '—' : '+'}
        </button>
      </div>

      {/* Tier 2: Feature Controls (DXPBK-2123) */}
      {isExpanded ? (
        <div className="border-t border-gray-800 bg-[#141A23] px-4 py-2.5">
          <div className="flex w-full flex-wrap items-center gap-6">
            <span className="flex shrink-0 items-center gap-1.5 font-bold text-gray-400">
              ↳ Feature Controls (DXPBK-2123):
            </span>

            {/* Release Stage — first (left) */}
            <div className="flex min-w-0 shrink-0 items-center gap-2">
              <label htmlFor="release-stage-select-2123" className="shrink-0 font-bold text-gray-300">
                Release Stage:
              </label>
              <select
                id="release-stage-select-2123"
                value={releaseStage}
                onChange={(e) => setReleaseStage(e.target.value as ReleaseStage)}
                className="min-w-0 rounded border border-gray-700 bg-[#1A222D] px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#0063A3]"
              >
                <option value="stage1-mvp">Stage 1: MVP</option>
                <option value="stage2-enhanced">Stage 2: Enhanced</option>
                <option value="stage3-northstar" disabled>
                  Stage 3: North Star (In Planning - Deferred)
                </option>
              </select>
            </div>

            {/* Support Rep Role + module count (grouped) */}
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <div className="flex min-w-0 shrink-0 items-center gap-2">
                <label htmlFor="role-select" className="shrink-0 font-bold text-gray-300">
                  Support Rep Role:
                </label>
                <select
                  id="role-select"
                  value={activeRole}
                  onChange={(e) => setActiveRole(e.target.value as SupportRoleType)}
                  className="min-w-0 rounded border border-gray-700 bg-[#1A222D] px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#0063A3]"
                >
                  {Object.values(ROLE_DEFINITIONS).map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className="shrink-0 rounded border border-gray-600 bg-[#1E2630] px-3 py-1.5 text-xs text-gray-200"
                role="status"
                aria-live="polite"
              aria-label={`Available modules for this role: ${visibleOperationalCount} of ${PORTAL_OPERATIONAL_TILE_COUNT}`}
            >
              <span>
                Available Modules:{' '}
                <strong className="text-[#5EB0FF]">{visibleOperationalCount}</strong>
                <span className="text-gray-400"> / {PORTAL_OPERATIONAL_TILE_COUNT}</span>
              </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

/** Wired to `SandboxProvider` — used in `App.tsx`. */
export const ConnectedSandboxUtilityBar = SandboxUtilityBar;
