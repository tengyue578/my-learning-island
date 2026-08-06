export const PROGRESS_KEY = "baby-learning-park:v1";

export type ActivityKey = "letters" | "poems" | "numbers" | "logic" | "adventure";

export interface LearningProgress {
  stars: number;
  adventureLevel: number;
  completedLevels: number[];
  badges: string[];
  activityCounts: Record<ActivityKey, number>;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const DEFAULT_PROGRESS: LearningProgress = {
  stars: 0,
  adventureLevel: 1,
  completedLevels: [],
  badges: [],
  activityCounts: {
    letters: 0,
    poems: 0,
    numbers: 0,
    logic: 0,
    adventure: 0,
  },
};

const activityKeys: ActivityKey[] = ["letters", "poems", "numbers", "logic", "adventure"];

function safeInteger(value: unknown, fallback: number, min: number, max = Number.MAX_SAFE_INTEGER) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.floor(value)))
    : fallback;
}

function freshDefault(): LearningProgress {
  return {
    ...DEFAULT_PROGRESS,
    completedLevels: [],
    badges: [],
    activityCounts: { ...DEFAULT_PROGRESS.activityCounts },
  };
}

export function normalizeProgress(input: unknown): LearningProgress {
  if (!input || typeof input !== "object") return freshDefault();
  const candidate = input as Partial<LearningProgress>;
  const activitySource: Record<string, unknown> =
    candidate.activityCounts && typeof candidate.activityCounts === "object"
      ? (candidate.activityCounts as Record<string, unknown>)
      : {};

  const activityCounts = activityKeys.reduce(
    (result, key) => {
      result[key] = safeInteger(activitySource[key], 0, 0);
      return result;
    },
    {} as Record<ActivityKey, number>,
  );

  const completedLevels = Array.isArray(candidate.completedLevels)
    ? [...new Set(candidate.completedLevels.filter(
        (level): level is number =>
          typeof level === "number" && Number.isInteger(level) && level >= 1 && level <= 10,
      ))].sort((a, b) => a - b)
    : [];

  const badges = Array.isArray(candidate.badges)
    ? [...new Set(candidate.badges.filter((badge): badge is string => typeof badge === "string"))]
    : [];

  return {
    stars: safeInteger(candidate.stars, 0, 0),
    adventureLevel: safeInteger(candidate.adventureLevel, 1, 1, 10),
    completedLevels,
    badges,
    activityCounts,
  };
}

export function loadProgress(storage?: StorageLike): LearningProgress {
  if (!storage) return freshDefault();
  try {
    const raw = storage.getItem(PROGRESS_KEY);
    return raw ? normalizeProgress(JSON.parse(raw)) : freshDefault();
  } catch {
    return freshDefault();
  }
}

export function saveProgress(progress: LearningProgress, storage?: StorageLike): void {
  if (!storage) return;
  try {
    storage.setItem(PROGRESS_KEY, JSON.stringify(normalizeProgress(progress)));
  } catch {
    // 浏览器禁用本地存储时，当前会话内的学习功能仍可继续使用。
  }
}
