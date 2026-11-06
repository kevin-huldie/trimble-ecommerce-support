import type { ReleaseStage } from '../context/SandboxContext';

/** URL `stage` query values (`?stage=…`). */
export type ReleaseStageSlug = 'stage1-mvp' | 'stage2-enhanced' | 'stage3-north-star';

export const SANDBOX_STAGE_PARAM = 'stage';

const STAGE_PARAM_TO_RELEASE: Record<string, ReleaseStage> = {
  'stage1-mvp': 'stage1-mvp',
  'stage2-enhanced': 'stage2-enhanced',
  'stage3-north-star': 'stage3-northstar',
};

const RELEASE_TO_STAGE_PARAM: Record<ReleaseStage, string> = {
  'stage1-mvp': 'stage1-mvp',
  'stage2-enhanced': 'stage2-enhanced',
  'stage3-northstar': 'stage3-north-star',
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
