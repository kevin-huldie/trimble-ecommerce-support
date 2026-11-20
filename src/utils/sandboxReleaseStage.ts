import type { ReleaseStage } from '../context/SandboxContext';

/** URL `stage` query values (`?stage=…`). */
export type ReleaseStageSlug = 'stage1-mvp' | 'stage2-enhanced' | 'stage3-north-star';

export const SANDBOX_STAGE_PARAM = 'stage';

const STAGE_PARAM_TO_RELEASE: Record<string, ReleaseStage> = {
  'stage1-mvp': 'Stage 1: MVP',
  'stage2-enhanced': 'Stage 2: Enhanced',
  'stage3-north-star': 'Stage 3: North Star',
};

const RELEASE_TO_STAGE_PARAM: Record<ReleaseStage, string> = {
  'Stage 1: MVP': 'stage1-mvp',
  'Stage 2: Enhanced': 'stage2-enhanced',
  'Stage 3: North Star': 'stage3-north-star',
};

export function releaseStageFromUrlParam(param: string | null): ReleaseStage | null {
  if (!param) return null;
  return STAGE_PARAM_TO_RELEASE[param] ?? null;
}

export function releaseStageToUrlParam(stage: ReleaseStage): string {
  return RELEASE_TO_STAGE_PARAM[stage];
}

export function releaseStageToSlug(stage: ReleaseStage): ReleaseStageSlug {
  return releaseStageToUrlParam(stage) as ReleaseStageSlug;
}
