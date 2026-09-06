import { hanziLessons } from "@/src/data/hanzi/lessons";
import { mathLessons } from "@/src/data/math/lessons";
import { pinyinLessons } from "@/src/data/pinyin/lessons";
import type { AppState, CoreSubject, DailyPlan, DailyTask, KnowledgePoint } from "@/src/models";
import { selectReviewItems } from "@/src/services/learning/mastery";
import { isKnowledgeComplete, nextLearningItems } from "@/src/services/learning/curriculum";
import { localDateKey } from "@/src/services/storage/StorageService";

const firstWeek = [
  { pinyin: ["pinyin_a"], math: ["quantity_1"], hanzi: ["hanzi_山", "hanzi_水"] },
  { pinyin: ["pinyin_a", "pinyin_o"], math: ["quantity_1", "quantity_2"], hanzi: ["hanzi_山", "hanzi_水", "hanzi_火", "hanzi_日"] },
  { pinyin: ["pinyin_a", "pinyin_o", "pinyin_e"], math: ["quantity_1", "quantity_2", "quantity_3"], hanzi: ["hanzi_月", "hanzi_大"] },
  { pinyin: ["pinyin_a", "pinyin_o", "pinyin_e"], math: ["number_1", "number_2", "number_3"], hanzi: ["hanzi_小", "hanzi_上"] },
  { pinyin: ["pinyin_i", "pinyin_a"], math: ["more_less"], hanzi: ["hanzi_下", "hanzi_人"] },
  { pinyin: ["pinyin_a", "pinyin_o", "pinyin_e"], math: ["quantity_1", "quantity_2", "quantity_3"], hanzi: ["hanzi_山", "hanzi_水", "hanzi_火"] },
  { pinyin: ["pinyin_a", "pinyin_o", "pinyin_e"], math: ["quantity_1", "quantity_2", "quantity_3"], hanzi: ["hanzi_日", "hanzi_月", "hanzi_大", "hanzi_小"] },
] as const;

const lessonPools: Record<CoreSubject, KnowledgePoint[]> = {
  pinyin: pinyinLessons,
  math: mathLessons,
  hanzi: hanziLessons,
};

const reviewLimits: Record<CoreSubject, number> = { pinyin: 4, math: 4, hanzi: 5 };

function daysBetween(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000));
}

function unique(ids: string[]) {
  return [...new Set(ids)];
}

function makeTask(subject: CoreSubject, knowledgePointIds: string[], newIds: string[], reviewIds: string[]): DailyTask {
  return {
    subject,
    knowledgePointIds: unique(knowledgePointIds),
    newKnowledgePointIds: unique(newIds),
    reviewKnowledgePointIds: unique(reviewIds),
    completed: false,
    stepIndex: 0,
    rewardClaimed: false,
  };
}

function seededTask(state: AppState, subject: CoreSubject, ids: readonly string[]) {
  const newIds = ids.filter((id) => !isKnowledgeComplete(state, id));
  const reviewIds = ids.filter((id) => isKnowledgeComplete(state, id));
  return makeTask(subject, [...newIds, ...reviewIds], newIds, reviewIds);
}

function automaticTask(state: AppState, subject: CoreSubject, date: string) {
  const reviewIds = selectReviewItems(state, subject, date, reviewLimits[subject]);
  const newCount = state.settings.newKnowledgePerDay[subject];
  const newIds = nextLearningItems(state, subject, newCount);
  let ids = unique([...newIds, ...reviewIds]);
  if (!ids.length) {
    ids = Object.values(state.mastery)
      .filter((item) => lessonPools[subject].some((lesson) => lesson.id === item.knowledgePointId))
      .sort((a, b) => a.masteryLevel - b.masteryLevel)
      .slice(0, 2)
      .map((item) => item.knowledgePointId);
  }
  if (!ids.length) ids = lessonPools[subject].slice(0, newCount).map((lesson) => lesson.id);
  return makeTask(subject, ids, newIds, reviewIds);
}

export function createDailyPlan(state: AppState, date = localDateKey()): DailyPlan {
  const dayNumber = daysBetween(state.installDate, date) + 1;
  const enabled = (["pinyin", "math", "hanzi"] as CoreSubject[]).filter((subject) => state.settings.enabledSubjects.includes(subject));
  const subjects = enabled.length ? enabled : (["pinyin", "math", "hanzi"] as CoreSubject[]);
  const tasks = dayNumber <= firstWeek.length
    ? subjects.map((subject) => seededTask(state, subject, firstWeek[dayNumber - 1][subject]))
    : subjects.map((subject) => automaticTask(state, subject, date));
  return {
    date,
    dayNumber,
    tasks,
    activeTaskIndex: 0,
    dailyCompleted: false,
    chestClaimed: false,
  };
}

export function ensureTodayPlan(state: AppState) {
  const date = localDateKey();
  if (state.dailyPlans[date]) return state;
  return { ...state, dailyPlans: { ...state.dailyPlans, [date]: createDailyPlan(state, date) } };
}
