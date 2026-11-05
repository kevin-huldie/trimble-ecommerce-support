import { useCallback, useEffect, useState, type FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FEATURE_SCOPE_DXBK_1900_LABEL,
  PURCHASE_TYPE_LABEL,
  REP_ROLE_LABEL,
  getReleaseStageViewFlags,
  useSandbox,
  type ReleaseStage,
} from '../context/SandboxContext';
import {
  readSandboxSimError,
  SANDBOX_LEGACY_ERROR_PARAM,
  SANDBOX_SIM_ERROR_PARAM,
  sandboxErrorNavigationPath,
  type SandboxErrorState,
} from '../utils/sandboxErrorDeepLink';
import {
  releaseStageFromUrlParam,
  releaseStageToUrlParam,
  SANDBOX_STAGE_PARAM,
} from '../utils/sandboxReleaseStage';

export type {
  SandboxErrorQueryValue,
  SandboxErrorState,
} from '../utils/sandboxErrorDeepLink';
export {
  EMAIL_ACTIVITY_LOGS_PATH,
  parseSandboxErrorState,
  SANDBOX_ERROR_QUERY_VALUES,
} from '../utils/sandboxErrorDeepLink';

const SANDBOX_FIELD_LABEL_CLASS =
  'mr-2 whitespace-nowrap text-xs font-bold text-[#d0d3d9]';

const ERROR_STATE_LABEL_CLASS =
  'mr-2 whitespace-nowrap text-xs font-bold text-[#E2E7EC]';

const PRIMARY_READ_ONLY_VALUE_CLASS =
  'inline-flex min-h-[1.625rem] min-w-[8rem] max-w-[min(100%,28rem)] cursor-default select-text items-center rounded border border-[#3B424C] bg-[#1E2227] px-2.5 py-1 text-xs font-normal text-[#ffffff]';

const PRIMARY_READ_ONLY_VALUE_FILL_CLASS =
  'inline-flex min-h-[1.625rem] min-w-0 flex-1 cursor-default select-text items-center rounded border border-[#3B424C] bg-[#1E2227] px-2.5 py-1 text-xs font-normal text-[#ffffff]';

const FEATURE_CONTROL_SELECT_CLASS =
  'cursor-pointer rounded border border-[#3B424C] bg-[#1E2227] px-2.5 py-1 text-xs text-[#ffffff] outline-none focus:border-[#0063A3] focus:ring-1 focus:ring-[#0063A3]';

const FEATURE_RELEASE_STAGE_SELECT_CLASS = `sandbox-feature-release-stage-select ${FEATURE_CONTROL_SELECT_CLASS}`;

const FEATURE_ERROR_STATE_SELECT_CLASS = `sandbox-feature-error-state-select ${FEATURE_CONTROL_SELECT_CLASS}`;

const RELEASE_STAGE_OPTIONS: ReleaseStage[] = [
  'Stage 1: MVP',
  'Stage 2: Enhanced',
  'Stage 3: North Star',
];

const RELEASE_STAGE_OPTION_STYLE = {
  color: '#ffffff',
  backgroundColor: '#1E2227',
} as const;


function PrimaryReadOnlyField({
  label,
  value,
  fill = false,
}: {
  label: string;
  value: string;
  fill?: boolean;
}) {
  return (
    <div
      className={
        fill
          ? 'flex min-w-[12rem] flex-1 items-center'
          : 'flex min-w-0 shrink-0 items-center'
      }
    >
      <span className={SANDBOX_FIELD_LABEL_CLASS}>{label}</span>
      <span
        className={fill ? PRIMARY_READ_ONLY_VALUE_FILL_CLASS : PRIMARY_READ_ONLY_VALUE_CLASS}
        aria-readonly="true"
      >
        {value}
      </span>
    </div>
  );
}

function Dxpbk1900FeatureControls({
  releaseStage,
  onReleaseStageChange,
  currentErrorParam,
  onErrorStateNavigation,
}: {
  releaseStage: ReleaseStage;
  onReleaseStageChange: (value: ReleaseStage) => void;
  currentErrorParam: SandboxErrorState;
  onErrorStateNavigation: (value: string) => void;
}) {
  return (
    <div className="mt-2 flex w-full flex-wrap items-center gap-6 border-t border-[#1E2227] pt-2 text-xs">
      <div className="flex items-center whitespace-nowrap text-xs">
        <span className="mr-1.5 font-mono text-[#9EA8B6]">↳</span>
        <span className="font-bold text-[#d0d3d9]">Feature Controls (DXPBK-1900):</span>
      </div>
      <div className="flex min-w-0 items-center">
        <label htmlFor="feature-release-stage" className={SANDBOX_FIELD_LABEL_CLASS}>
          Release Stage:
        </label>
        <select
          id="feature-release-stage"
          name="feature-release-stage"
          value={releaseStage}
          onChange={(e) => onReleaseStageChange(e.target.value as ReleaseStage)}
          className={FEATURE_RELEASE_STAGE_SELECT_CLASS}
        >
          {RELEASE_STAGE_OPTIONS.map((stage) => (
            <option key={stage} value={stage} style={RELEASE_STAGE_OPTION_STYLE}>
              {stage}
            </option>
          ))}
        </select>
      </div>
      <div className="flex min-w-0 items-center">
        <label htmlFor="feature-error-state" className={ERROR_STATE_LABEL_CLASS}>
          Error State:
        </label>
        <select
          id="feature-error-state"
          name="feature-error-state"
          value={currentErrorParam}
          onChange={(e) => onErrorStateNavigation(e.target.value)}
          className={FEATURE_ERROR_STATE_SELECT_CLASS}
        >
          <option value="none" style={RELEASE_STAGE_OPTION_STYLE}>
            None (Clean Baseline)
          </option>
          <optgroup label="Email Activity Logs">
            <option value="search-inline" style={RELEASE_STAGE_OPTION_STYLE}>
              Search: Inline Field Error
            </option>
            <option value="search-zero" style={RELEASE_STAGE_OPTION_STYLE}>
              Search: Zero Results Found
            </option>
            <option value="filter-inline" style={RELEASE_STAGE_OPTION_STYLE}>
              Advanced Filters: Inline Field Errors
            </option>
            <option value="filter-zero" style={RELEASE_STAGE_OPTION_STYLE}>
              Advanced Filters: Zero Results Found
            </option>
          </optgroup>
          <optgroup label="Email Details & Actions">
            <option value="recipient-inline" style={RELEASE_STAGE_OPTION_STYLE}>
              To / CC / BCC Inline Errors
            </option>
            {getReleaseStageViewFlags(releaseStage).showAuditJustification ? (
              <option value="justification-missing" style={RELEASE_STAGE_OPTION_STYLE}>
                Missing Audit Justification Error
              </option>
            ) : null}
            <option value="subject-missing" style={RELEASE_STAGE_OPTION_STYLE}>
              Missing Subject Line Error
            </option>
          </optgroup>
        </select>
      </div>
    </div>
  );
}

export type SandboxUtilityBarProps = {
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  releaseStage: ReleaseStage;
  onReleaseStageChange: (value: ReleaseStage) => void;
  currentErrorParam: SandboxErrorState;
  onErrorStateNavigation: (value: string) => void;
};

export const SandboxUtilityBar: FC<SandboxUtilityBarProps> = ({
  isCollapsed,
  onToggleCollapsed,
  releaseStage,
  onReleaseStageChange,
  currentErrorParam,
  onErrorStateNavigation,
}) => {
  return (
    <header
      className="sticky top-0 z-[60] w-full border-b border-[#2B3037] bg-[#121518] px-4 py-2 font-[family-name:var(--font-open-sans,'Open_Sans',sans-serif)] text-white"
      role="region"
      aria-label="Prototype sandbox controls"
    >
      <div className="w-full">
        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
            <span className="shrink-0 whitespace-nowrap text-[13px] font-bold tracking-tight text-white">
              Trimble Prototype Sandbox
            </span>
            <PrimaryReadOnlyField
              fill
              label="Feature Scope:"
              value={FEATURE_SCOPE_DXBK_1900_LABEL}
            />
            <PrimaryReadOnlyField label="Support Rep Role:" value={REP_ROLE_LABEL} />
            <PrimaryReadOnlyField label="Purchase Type:" value={PURCHASE_TYPE_LABEL} />
          </div>
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-expanded={!isCollapsed}
            aria-label="Toggle Sandbox Controls"
            className="shrink-0 rounded border border-[#3B424C] bg-[#1E2227] px-2.5 py-0.5 font-mono text-xs text-white transition-colors hover:bg-[#2B3037] focus:border-[#0063A3] focus:outline-none focus:ring-1 focus:ring-[#0063A3]"
          >
            {isCollapsed ? '+' : '−'}
          </button>
        </div>

        {!isCollapsed ? (
          <Dxpbk1900FeatureControls
            releaseStage={releaseStage}
            onReleaseStageChange={onReleaseStageChange}
            currentErrorParam={currentErrorParam}
            onErrorStateNavigation={onErrorStateNavigation}
          />
        ) : null}
      </div>
    </header>
  );
};

/** Wired to `SandboxProvider` — used in `App.tsx`. */
export const ConnectedSandboxUtilityBar: FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { releaseStage, setReleaseStage } = useSandbox();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentErrorParam = readSandboxSimError(searchParams);

  useEffect(() => {
    const fromUrl = releaseStageFromUrlParam(searchParams.get(SANDBOX_STAGE_PARAM));
    if (fromUrl && fromUrl !== releaseStage) {
      setReleaseStage(fromUrl);
    }
  }, [searchParams, releaseStage, setReleaseStage]);

  const clearSimErrorFromUrl = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(SANDBOX_SIM_ERROR_PARAM);
        next.delete(SANDBOX_LEGACY_ERROR_PARAM);
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const handleReleaseStageChange = useCallback(
    (stage: ReleaseStage) => {
      setReleaseStage(stage);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(SANDBOX_STAGE_PARAM, releaseStageToUrlParam(stage));
          if (
            getReleaseStageViewFlags(stage).isMVP
            && readSandboxSimError(prev) === 'justification-missing'
          ) {
            next.delete(SANDBOX_SIM_ERROR_PARAM);
            next.delete(SANDBOX_LEGACY_ERROR_PARAM);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setReleaseStage, setSearchParams],
  );

  useEffect(() => {
    if (
      getReleaseStageViewFlags(releaseStage).isMVP
      && currentErrorParam === 'justification-missing'
    ) {
      clearSimErrorFromUrl();
    }
  }, [releaseStage, currentErrorParam, clearSimErrorFromUrl]);

  const handleErrorStateNavigation = useCallback(
    (value: string) => {
      const path = sandboxErrorNavigationPath(value);
      const stageParam = releaseStageToUrlParam(releaseStage);
      if (value === 'none') {
        navigate(path);
        return;
      }
      const separator = path.includes('?') ? '&' : '?';
      navigate(`${path}${separator}${SANDBOX_STAGE_PARAM}=${encodeURIComponent(stageParam)}`);
    },
    [navigate, releaseStage],
  );

  return (
    <SandboxUtilityBar
      isCollapsed={isCollapsed}
      onToggleCollapsed={() => setIsCollapsed((prev) => !prev)}
      releaseStage={releaseStage}
      onReleaseStageChange={handleReleaseStageChange}
      currentErrorParam={currentErrorParam}
      onErrorStateNavigation={handleErrorStateNavigation}
    />
  );
};
