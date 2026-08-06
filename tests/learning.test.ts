import { describe, expect, it } from "vitest";
import {
  createCountingQuestion,
  createMathQuestion,
  deriveBadges,
  starsForAttempt,
} from "@/lib/learning";

describe("数学出题", () => {
  it("生成的加减法操作数与答案都在 0 到 10，且减法不为负数", () => {
    for (let index = 0; index < 200; index += 1) {
      const question = createMathQuestion();
      expect(question.left).toBeGreaterThanOrEqual(0);
      expect(question.left).toBeLessThanOrEqual(10);
      expect(question.right).toBeGreaterThanOrEqual(0);
      expect(question.right).toBeLessThanOrEqual(10);
      expect(question.answer).toBeGreaterThanOrEqual(0);
      expect(question.answer).toBeLessThanOrEqual(10);
      if (question.operator === "−") {
        expect(question.left).toBeGreaterThanOrEqual(question.right);
      }
    }
  });

  it("提供四个不重复选项并包含正确答案", () => {
    const question = createMathQuestion(() => 0.42);
    expect(question.options).toHaveLength(4);
    expect(new Set(question.options).size).toBe(4);
    expect(question.options).toContain(question.answer);
  });

  it("数数题数量在 1 到 10 且选项不重复", () => {
    for (let index = 0; index < 50; index += 1) {
      const question = createCountingQuestion();
      expect(question.count).toBeGreaterThanOrEqual(1);
      expect(question.count).toBeLessThanOrEqual(10);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options).size).toBe(4);
      expect(question.options).toContain(question.count);
    }
  });
});

describe("闯关奖励", () => {
  it("按尝试次数给 3、2、1 颗星", () => {
    expect(starsForAttempt(1)).toBe(3);
    expect(starsForAttempt(2)).toBe(2);
    expect(starsForAttempt(3)).toBe(1);
    expect(starsForAttempt(9)).toBe(1);
  });

  it("根据累计星星和全通关状态解锁徽章", () => {
    expect(deriveBadges(4, [])).toEqual([]);
    expect(deriveBadges(5, [])).toEqual(["first-stars"]);
    expect(deriveBadges(15, [])).toEqual(["first-stars", "learning-hero"]);
    expect(deriveBadges(30, [])).toEqual([
      "first-stars",
      "learning-hero",
      "shining-master",
    ]);
    expect(deriveBadges(30, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toEqual([
      "first-stars",
      "learning-hero",
      "shining-master",
      "all-round-adventurer",
    ]);
  });
});
