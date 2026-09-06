import { englishLessons } from "@/src/data/english/lessons";
import { hanziLessons } from "@/src/data/hanzi/lessons";
import { mathLessons } from "@/src/data/math/lessons";
import { pinyinLessons } from "@/src/data/pinyin/lessons";
import { poetryLessons } from "@/src/data/poetry/lessons";
import type { AppState, KnowledgePoint, Subject } from "@/src/models";

export const curriculumPools: Record<Subject, KnowledgePoint[]> = {
  pinyin: pinyinLessons,
  math: mathLessons,
  hanzi: hanziLessons,
  english: englishLessons,
  poetry: poetryLessons,
};

export function isKnowledgeComplete(state: AppState, id: string) {
  const quest = state.questProgress[id];
  return quest ? quest.completedLevels.length >= 5 : (state.mastery[id]?.masteryLevel ?? 0) >= 2;
}

export function isKnowledgeUnlocked(state: AppState, lesson: KnowledgePoint) {
  return (lesson.prerequisites ?? []).every((id) => isKnowledgeComplete(state, id));
}

export function nextLearningItems(state: AppState, subject: Subject, count: number) {
  const selected: string[] = [];
  const available = new Set(Object.keys(state.mastery).filter((id) => isKnowledgeComplete(state, id)));
  for (const lesson of [...curriculumPools[subject]].sort((a, b) => a.order - b.order)) {
    if (isKnowledgeComplete(state, lesson.id)) continue;
    if (!(lesson.prerequisites ?? []).every((id) => available.has(id) || selected.includes(id))) break;
    selected.push(lesson.id);
    if (selected.length >= count) break;
  }
  return selected;
}
