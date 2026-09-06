import type { AppState, CoreSubject, LearningRecord, MasteryRecord, Subject } from "@/src/models";

export function addDays(date: string, days: number) {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  const year = next.getFullYear();
  const month = String(next.getMonth() + 1).padStart(2, "0");
  const day = String(next.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function subjectForKnowledgeId(id: string): Subject | undefined {
  if (id.startsWith("pinyin_")) return "pinyin";
  if (id.startsWith("quantity_") || id.startsWith("number_") || id === "more_less" || id === "big_small") return "math";
  if (id.startsWith("hanzi_")) return "hanzi";
  if (id.startsWith("english_")) return "english";
  if (id.startsWith("poetry_")) return "poetry";
  return undefined;
}

function intervalForLevel(level: MasteryRecord["masteryLevel"]) {
  return [1, 1, 3, 7, 14][level];
}

export function recordLearning(state: AppState, record: LearningRecord): AppState {
  const previous = state.mastery[record.knowledgePointId];
  const wasSmooth = record.correct && record.attempts <= 2;
  const correctAttempts = (previous?.correctAttempts ?? 0) + (wasSmooth ? 1 : 0);
  const consecutiveCorrect = wasSmooth ? (previous?.consecutiveCorrect ?? 0) + 1 : 0;
  const oldLevel = previous?.masteryLevel ?? 0;
  const shouldLevelUp = wasSmooth && (oldLevel === 0 || consecutiveCorrect >= 2);
  const shouldEaseBack = !wasSmooth && record.attempts >= 3 && oldLevel >= 3;
  const nextLevel = Math.min(4, Math.max(1, oldLevel + (shouldLevelUp ? 1 : 0) - (shouldEaseBack ? 1 : 0))) as MasteryRecord["masteryLevel"];
  const reviewIntervalDays = wasSmooth ? intervalForLevel(nextLevel) : 1;
  const mastery: MasteryRecord = {
    knowledgePointId: record.knowledgePointId,
    firstLearnedAt: previous?.firstLearnedAt ?? record.date,
    lastReviewedAt: record.date,
    totalAttempts: (previous?.totalAttempts ?? 0) + record.attempts,
    correctAttempts,
    consecutiveCorrect,
    masteryLevel: nextLevel,
    reviewIntervalDays,
    nextReviewAt: addDays(record.date, reviewIntervalDays),
    lastResultCorrect: wasSmooth,
  };
  const previousQuest = state.questProgress[record.knowledgePointId];
  const completedLevels = record.questLevel && record.correct
    ? [...new Set([...(previousQuest?.completedLevels ?? []), record.questLevel])].sort((a, b) => a - b)
    : previousQuest?.completedLevels ?? [];
  const questProgress = record.questLevel ? {
    ...state.questProgress,
    [record.knowledgePointId]: {
      knowledgePointId: record.knowledgePointId,
      unlockedLevel: Math.min(5, Math.max(previousQuest?.unlockedLevel ?? 1, record.correct ? record.questLevel + 1 : record.questLevel)) as 1 | 2 | 3 | 4 | 5,
      completedLevels,
      bestStars: { ...(previousQuest?.bestStars ?? {}), ...(record.correct ? { [record.questLevel]: Math.max(previousQuest?.bestStars[record.questLevel] ?? 0, record.starsEarned) } : {}) },
    },
  } : state.questProgress;
  return {
    ...state,
    records: [...state.records, record],
    mastery: { ...state.mastery, [record.knowledgePointId]: mastery },
    questProgress,
    rewards: { stars: state.rewards.stars + record.starsEarned, coins: state.rewards.coins + 5 },
  };
}

export function getWeakKnowledge(state: AppState, date: string, subject?: Subject, limit = 5) {
  const cutoff = addDays(date, -14);
  const recent = state.records.filter((record) => record.date >= cutoff && (!subject || record.subject === subject));
  const errorCounts = recent.reduce<Record<string, number>>((counts, record) => {
    const errors = Math.max(0, record.attempts - 1) + (record.correct ? 0 : 1);
    counts[record.knowledgePointId] = (counts[record.knowledgePointId] ?? 0) + errors;
    return counts;
  }, {});
  return Object.values(state.mastery)
    .filter((item) => !subject || subjectForKnowledgeId(item.knowledgePointId) === subject)
    .filter((item) => !item.lastReviewedAt || item.lastReviewedAt >= cutoff)
    .sort((a, b) => {
      const errors = (errorCounts[b.knowledgePointId] ?? 0) - (errorCounts[a.knowledgePointId] ?? 0);
      if (errors) return errors;
      if (a.masteryLevel !== b.masteryLevel) return a.masteryLevel - b.masteryLevel;
      return a.consecutiveCorrect - b.consecutiveCorrect;
    })
    .slice(0, limit);
}

export function selectReviewItems(state: AppState, subject: CoreSubject, date: string, limit: number) {
  const relevant = Object.values(state.mastery).filter((item) => subjectForKnowledgeId(item.knowledgePointId) === subject);
  const due = relevant
    .filter((item) => !!item.nextReviewAt && item.nextReviewAt <= date)
    .sort((a, b) => (a.nextReviewAt ?? "").localeCompare(b.nextReviewAt ?? "") || a.masteryLevel - b.masteryLevel);
  const weak = getWeakKnowledge(state, date, subject, limit);
  return [...new Set([...weak, ...due].map((item) => item.knowledgePointId))].slice(0, limit);
}
