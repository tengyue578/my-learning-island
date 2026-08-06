import { describe, expect, it } from "vitest";
import {
  DEFAULT_PROGRESS,
  PROGRESS_KEY,
  loadProgress,
  saveProgress,
} from "@/lib/storage";

describe("学习进度持久化", () => {
  it("没有数据时返回完整默认进度", () => {
    expect(loadProgress(localStorage)).toEqual(DEFAULT_PROGRESS);
  });

  it("合并旧数据并忽略不合法字段", () => {
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({
        stars: 8,
        adventureLevel: 99,
        completedLevels: [1, 2, 2, 20, "3"],
        badges: ["first-stars", 7],
        activityCounts: { letters: 4 },
      }),
    );

    expect(loadProgress(localStorage)).toEqual({
      stars: 8,
      adventureLevel: 10,
      completedLevels: [1, 2],
      badges: ["first-stars"],
      activityCounts: {
        letters: 4,
        poems: 0,
        numbers: 0,
        logic: 0,
        adventure: 0,
      },
    });
  });

  it("损坏数据或存储不可用时安全回退", () => {
    localStorage.setItem(PROGRESS_KEY, "{broken");
    expect(loadProgress(localStorage)).toEqual(DEFAULT_PROGRESS);

    const unavailable = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(loadProgress(unavailable)).toEqual(DEFAULT_PROGRESS);
    expect(() => saveProgress(DEFAULT_PROGRESS, unavailable)).not.toThrow();
  });
});
