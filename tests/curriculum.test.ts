import { describe, expect, it } from "vitest";
import { curriculumPools, isKnowledgeUnlocked, nextLearningItems } from "@/src/services/learning/curriculum";
import { buildAdventureSteps, buildKnowledgeQuest } from "@/src/services/learning/questionGenerator";
import { recordLearning } from "@/src/services/learning/mastery";
import { createInitialState } from "@/src/services/storage/StorageService";
import type { LearningRecord, Subject } from "@/src/models";

describe("从简单到困难的课程", () => {
  it("五大学科的每个知识点都有五个不同关卡", () => {
    for (const subject of Object.keys(curriculumPools) as Subject[]) {
      for (const lesson of curriculumPools[subject]) {
        const levels = buildKnowledgeQuest(subject, lesson.id);
        expect(levels).toHaveLength(5);
        expect(new Set(levels.map((level) => level.title)).size).toBe(5);
        expect(levels.map((level) => level.level)).toEqual([1, 2, 3, 4, 5]);
        for (const level of levels) {
          if (level.kind === "question") expect(level.question.options.some((option) => option.value === level.question.target)).toBe(true);
        }
      }
    }
  });

  it("未完成前一知识点时不能解锁下一项", () => {
    let state = createInitialState();
    expect(isKnowledgeUnlocked(state, curriculumPools.pinyin[0])).toBe(true);
    expect(isKnowledgeUnlocked(state, curriculumPools.pinyin[1])).toBe(false);
    for (const level of [1, 2, 3, 4, 5] as const) {
      const record: LearningRecord = { id: `a-${level}`, knowledgePointId: "pinyin_a", subject: "pinyin", date: "2026-09-06", gameType: "listenChoose", correct: true, attempts: 1, duration: 1, starsEarned: 3, questLevel: level };
      state = recordLearning(state, record);
    }
    expect(isKnowledgeUnlocked(state, curriculumPools.pinyin[1])).toBe(true);
    expect(nextLearningItems(state, "pinyin", 1)).toEqual(["pinyin_o"]);
  });

  it("数量1的认识页和第一关都只朗读1", () => {
    const steps = buildAdventureSteps("math", ["quantity_1"]);
    expect(steps[0].kind).toBe("lesson");
    if (steps[0].kind === "lesson") expect(steps[0].speechText).toBe("1");
    const firstLevel = buildKnowledgeQuest("math", "quantity_1")[0];
    if (firstLevel.kind === "question") expect(firstLevel.question.speechText).toBe("1");
  });
});
