import type { AppState, ChestRewardResult, CoreSubject, DailyPlan, DailyTask, GameType, LearningRecord, LearningSettings, RoomSlot, Subject } from "@/src/models";

export const STORAGE_KEY = "my-learning-island:v1";

const coreSubjects: CoreSubject[] = ["pinyin", "math", "hanzi"];
const allSubjects: Subject[] = ["pinyin", "math", "hanzi", "english", "poetry"];
const gameTypes: GameType[] = ["listenChoose", "pictureChoose", "balloonPop", "quantityGame", "repeatAfterMe"];

export class InvalidBackupError extends Error {
  constructor(message = "这份备份好像不是学习小岛的数据。") {
    super(message);
    this.name = "InvalidBackupError";
  }
}

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createInitialState(): AppState {
  return {
    version: 3,
    installDate: localDateKey(),
    profile: { nickname: "小朋友", onboardingComplete: true },
    rewards: { stars: 0, coins: 0 },
    records: [],
    mastery: {},
    questProgress: {},
    dailyPlans: {},
    room: { unlockedItems: ["bed-basic", "desk-basic"], equippedItems: { bed: "bed-basic", desk: "desk-basic" } },
    settings: {
      dailyMinutes: 30,
      enabledSubjects: ["pinyin", "math", "hanzi"],
      newKnowledgePerDay: { pinyin: 1, math: 1, hanzi: 2 },
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function safeNumber(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

function normalizeSettings(value: unknown): LearningSettings {
  const record = isRecord(value) ? value : {};
  const enabled = Array.isArray(record.enabledSubjects)
    ? record.enabledSubjects.filter((subject): subject is Subject => typeof subject === "string" && allSubjects.includes(subject as Subject))
    : coreSubjects;
  const counts = isRecord(record.newKnowledgePerDay) ? record.newKnowledgePerDay : {};
  return {
    dailyMinutes: safeNumber(record.dailyMinutes, 30, 15, 45),
    enabledSubjects: enabled.length ? [...new Set(enabled)] : coreSubjects,
    newKnowledgePerDay: {
      pinyin: safeNumber(counts.pinyin, 1, 1, 2),
      math: safeNumber(counts.math, 1, 1, 2),
      hanzi: safeNumber(counts.hanzi, 2, 1, 3),
    },
  };
}

function normalizeRoom(value: unknown): AppState["room"] {
  const record = isRecord(value) ? value : {};
  const oldUnlocked = Array.isArray(record.unlockedItems) ? record.unlockedItems.filter((id): id is string => typeof id === "string") : [];
  const idMap: Record<string, string> = { bed: "bed-basic", desk: "desk-basic", "dino-sticker": "dino-poster" };
  const unlockedItems = [...new Set(["bed-basic", "desk-basic", ...oldUnlocked.map((id) => idMap[id] ?? id)])];
  const rawEquipped = isRecord(record.equippedItems) ? record.equippedItems : {};
  const equippedItems: Partial<Record<RoomSlot, string>> = { bed: "bed-basic", desk: "desk-basic" };
  for (const slot of ["bed", "desk", "floor", "corner", "pet", "wall"] as RoomSlot[]) {
    if (typeof rawEquipped[slot] === "string") equippedItems[slot] = rawEquipped[slot];
  }
  if (unlockedItems.includes("dino-poster") && !equippedItems.wall) equippedItems.wall = "dino-poster";
  return { unlockedItems, equippedItems };
}

export function normalizeState(value: unknown): AppState {
  if (!isRecord(value) || !Array.isArray(value.records) || !isRecord(value.rewards) || !isRecord(value.dailyPlans)) {
    throw new InvalidBackupError();
  }
  const initial = createInitialState();
  const profile = isRecord(value.profile) ? value.profile : {};
  const masterySource = isRecord(value.mastery) ? value.mastery : {};
  const questSource = isRecord(value.questProgress) ? value.questProgress : {};
  const masteryEntries = Object.entries(masterySource).flatMap(([id, item]): Array<[string, Record<string, unknown>]> => isRecord(item) ? [[id, item]] : []);
  const mastery = Object.fromEntries(masteryEntries.map(([id, item]) => [id, {
    ...item,
    knowledgePointId: id,
    totalAttempts: safeNumber(item.totalAttempts, 0, 0, 1_000_000),
    correctAttempts: safeNumber(item.correctAttempts, 0, 0, 1_000_000),
    consecutiveCorrect: safeNumber(item.consecutiveCorrect, 0, 0, 1_000_000),
    masteryLevel: safeNumber(item.masteryLevel, 0, 0, 4),
    reviewIntervalDays: safeNumber(item.reviewIntervalDays, 1, 1, 14),
  }]));
  const questProgress = Object.fromEntries(Object.entries(questSource).flatMap(([id, item]) => {
    if (!isRecord(item)) return [];
    const completedLevels = Array.isArray(item.completedLevels) ? item.completedLevels.filter((level): level is number => typeof level === "number" && level >= 1 && level <= 5) : [];
    const bestStars = isRecord(item.bestStars) ? Object.fromEntries(Object.entries(item.bestStars).filter(([level, stars]) => Number(level) >= 1 && Number(level) <= 5 && typeof stars === "number").map(([level, stars]) => [Number(level), safeNumber(stars, 0, 0, 3)])) : {};
    return [[id, { knowledgePointId: id, unlockedLevel: safeNumber(item.unlockedLevel, 1, 1, 5), completedLevels: [...new Set(completedLevels)], bestStars }]];
  }));
  const dailyPlanEntries = Object.entries(value.dailyPlans).flatMap(([date, item]): Array<[string, Record<string, unknown>]> => isRecord(item) ? [[date, item]] : []);
  const dailyPlans = Object.fromEntries(dailyPlanEntries.map(([date, item]): [string, DailyPlan] => {
    const tasks: DailyTask[] = Array.isArray(item.tasks) ? item.tasks.flatMap((task): DailyTask[] => {
      if (!isRecord(task) || typeof task.subject !== "string" || !coreSubjects.includes(task.subject as CoreSubject)) return [];
      return [{
        subject: task.subject as CoreSubject,
        knowledgePointIds: Array.isArray(task.knowledgePointIds) ? task.knowledgePointIds.filter((id): id is string => typeof id === "string") : [],
        newKnowledgePointIds: Array.isArray(task.newKnowledgePointIds) ? task.newKnowledgePointIds.filter((id): id is string => typeof id === "string") : [],
        reviewKnowledgePointIds: Array.isArray(task.reviewKnowledgePointIds) ? task.reviewKnowledgePointIds.filter((id): id is string => typeof id === "string") : [],
        completed: task.completed === true,
        stepIndex: safeNumber(task.stepIndex, 0, 0, 100),
        rewardClaimed: task.rewardClaimed === true,
      }];
    }) : [];
    const reward = isRecord(item.chestReward) && typeof item.chestReward.label === "string" && typeof item.chestReward.emoji === "string"
      ? item.chestReward as unknown as ChestRewardResult
      : undefined;
    return [date, {
      date,
      dayNumber: safeNumber(item.dayNumber, 1, 1, 100_000),
      tasks,
      activeTaskIndex: safeNumber(item.activeTaskIndex, 0, 0, Math.max(0, tasks.length - 1)),
      dailyCompleted: item.dailyCompleted === true,
      chestClaimed: item.chestClaimed === true,
      chestReward: reward,
    }];
  }));
  const records: LearningRecord[] = value.records.flatMap((record): LearningRecord[] => {
    if (!isRecord(record) || typeof record.knowledgePointId !== "string" || typeof record.subject !== "string" || !allSubjects.includes(record.subject as Subject) || typeof record.gameType !== "string" || !gameTypes.includes(record.gameType as GameType)) return [];
    return [{
      id: typeof record.id === "string" ? record.id : `${record.knowledgePointId}-${Date.now()}`,
      knowledgePointId: record.knowledgePointId,
      subject: record.subject as Subject,
      date: typeof record.date === "string" ? record.date : initial.installDate,
      gameType: record.gameType as GameType,
      correct: record.correct === true,
      attempts: safeNumber(record.attempts, 1, 1, 100),
      duration: safeNumber(record.duration, 1, 0, 86_400),
      starsEarned: safeNumber(record.starsEarned, 1, 0, 3),
      questLevel: typeof record.questLevel === "number" && record.questLevel >= 1 && record.questLevel <= 5 ? record.questLevel as 1 | 2 | 3 | 4 | 5 : undefined,
    }];
  });
  return {
    ...initial,
    version: 3,
    installDate: typeof value.installDate === "string" ? value.installDate : initial.installDate,
    profile: { nickname: typeof profile.nickname === "string" ? profile.nickname.slice(0, 12) : "小朋友", onboardingComplete: profile.onboardingComplete !== false },
    rewards: { stars: safeNumber(value.rewards.stars, 0, 0, 1_000_000), coins: safeNumber(value.rewards.coins, 0, 0, 1_000_000) },
    records,
    mastery: mastery as AppState["mastery"],
    questProgress: questProgress as AppState["questProgress"],
    dailyPlans: dailyPlans as AppState["dailyPlans"],
    room: normalizeRoom(value.room),
    settings: normalizeSettings(value.settings),
  };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return createInitialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed: unknown = JSON.parse(raw);
    return normalizeState(parsed);
  } catch {
    return createInitialState();
  }
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function exportState(state: AppState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `学习小岛备份-${localDateKey()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function importStateFile(file: File) {
  if (file.size > 5_000_000) throw new InvalidBackupError("备份文件太大了，请选择学习小岛导出的 JSON。");
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text()) as unknown;
  } catch {
    throw new InvalidBackupError("备份文件无法读取，请重新选择。");
  }
  return normalizeState(parsed);
}

export function resetState() {
  if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
  return createInitialState();
}
