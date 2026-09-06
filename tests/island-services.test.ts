import { describe, expect, it } from "vitest";
import { createDailyPlan } from "@/src/services/dailyPlan/dailyPlan";
import { addDays, recordLearning, selectReviewItems } from "@/src/services/learning/mastery";
import { applyChestReward, drawChestReward } from "@/src/services/rewards/chest";
import { buyFurniture, equipFurniture } from "@/src/services/rewards/room";
import { createInitialState, normalizeState } from "@/src/services/storage/StorageService";
import type { LearningRecord, MasteryRecord } from "@/src/models";

function learningRecord(date: string, overrides: Partial<LearningRecord> = {}): LearningRecord {
  return {
    id: `record-${date}`,
    knowledgePointId: "pinyin_a",
    subject: "pinyin",
    date,
    gameType: "listenChoose",
    correct: true,
    attempts: 1,
    duration: 5,
    starsEarned: 3,
    ...overrides,
  };
}

describe("掌握度与自动复习", () => {
  it("按 1、3、7、14 天逐步安排复习", () => {
    let state = createInitialState();
    state = recordLearning(state, learningRecord("2026-01-01"));
    expect(state.mastery.pinyin_a.masteryLevel).toBe(1);
    expect(state.mastery.pinyin_a.nextReviewAt).toBe("2026-01-02");

    state = recordLearning(state, learningRecord("2026-01-02"));
    expect(state.mastery.pinyin_a.masteryLevel).toBe(2);
    expect(state.mastery.pinyin_a.nextReviewAt).toBe("2026-01-05");

    state = recordLearning(state, learningRecord("2026-01-05"));
    state = recordLearning(state, learningRecord("2026-01-05", { id: "record-4" }));
    expect(state.mastery.pinyin_a.masteryLevel).toBe(4);
    expect(state.mastery.pinyin_a.nextReviewAt).toBe("2026-01-19");
  });

  it("优先选择到期知识和最近薄弱知识", () => {
    const state = createInitialState();
    const due: MasteryRecord = { knowledgePointId: "pinyin_a", totalAttempts: 3, correctAttempts: 1, consecutiveCorrect: 0, masteryLevel: 1, reviewIntervalDays: 1, nextReviewAt: "2026-01-02", lastReviewedAt: "2026-01-01", lastResultCorrect: false };
    state.mastery.pinyin_a = due;
    state.records = [learningRecord("2026-01-01", { correct: false, attempts: 3 })];
    expect(selectReviewItems(state, "pinyin", "2026-01-02", 4)).toContain("pinyin_a");
  });

  it("第一周之后的计划组合复习和少量新知识", () => {
    const state = createInitialState();
    state.installDate = "2026-01-01";
    state.mastery.pinyin_a = { knowledgePointId: "pinyin_a", totalAttempts: 3, correctAttempts: 2, consecutiveCorrect: 2, masteryLevel: 2, reviewIntervalDays: 3, nextReviewAt: "2026-01-08", lastReviewedAt: "2026-01-05", lastResultCorrect: true };
    const plan = createDailyPlan(state, "2026-01-08");
    const pinyin = plan.tasks.find((task) => task.subject === "pinyin");
    expect(pinyin?.reviewKnowledgePointIds).toContain("pinyin_a");
    expect(pinyin?.newKnowledgePointIds).toEqual(["pinyin_o"]);
  });

  it("日期计算跨月保持正确", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
  });
});

describe("宝箱与房间", () => {
  it("按权重抽取并应用金币奖励", () => {
    const reward = drawChestReward(() => 0);
    const applied = applyChestReward(createInitialState(), reward);
    expect(reward.type).toBe("coin");
    expect(applied.state.rewards.coins).toBe(30);
  });

  it("金币足够时购买并自动摆放家具", () => {
    const state = { ...createInitialState(), rewards: { stars: 0, coins: 100 } };
    const purchased = buyFurniture(state, "rug-stars");
    expect(purchased.ok).toBe(true);
    expect(purchased.state.rewards.coins).toBe(55);
    expect(purchased.state.room.equippedItems.floor).toBe("rug-stars");
    const equipped = equipFurniture(purchased.state, "rug-stars");
    expect(equipped.ok).toBe(true);
  });

  it("金币不足时不修改房间", () => {
    const state = createInitialState();
    expect(buyFurniture(state, "cat-friend").state).toBe(state);
  });
});

describe("旧数据迁移", () => {
  it("保留奖励并补齐复习、房间和设置字段", () => {
    const migrated = normalizeState({
      version: 1,
      installDate: "2026-01-01",
      profile: { nickname: "朵朵", onboardingComplete: true },
      rewards: { stars: 8, coins: 12 },
      records: [],
      mastery: { pinyin_a: { knowledgePointId: "pinyin_a", totalAttempts: 2, correctAttempts: 1, consecutiveCorrect: 1, masteryLevel: 1 } },
      dailyPlans: {},
      room: { unlockedItems: ["bed", "desk", "dino-sticker"], activeItem: "bed" },
      settings: { dailyMinutes: 30, enabledSubjects: ["pinyin", "math", "hanzi"] },
    });
    expect(migrated.version).toBe(3);
    expect(migrated.rewards).toEqual({ stars: 8, coins: 12 });
    expect(migrated.room.unlockedItems).toContain("dino-poster");
    expect(migrated.settings.newKnowledgePerDay.hanzi).toBe(2);
    expect(migrated.mastery.pinyin_a.reviewIntervalDays).toBe(1);
    expect(migrated.questProgress).toEqual({});
  });
});
