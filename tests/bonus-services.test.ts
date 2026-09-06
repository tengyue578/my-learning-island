import { describe, expect, it } from "vitest";
import { LocalAICompanionService } from "@/src/services/ai/AICompanionService";
import { MicrophoneService } from "@/src/services/speech/MicrophoneService";
import { createInitialState, normalizeState } from "@/src/services/storage/StorageService";

describe("本地小星星伙伴", () => {
  it("只返回简短、安全的本地预设内容", async () => {
    const companion = new LocalAICompanionService();
    expect(companion.askChildQuestion().choices).toHaveLength(3);
    expect(await companion.chat([{ role: "child", content: "我喜欢小猫" }])).toContain("小猫");
    expect(companion.explainSimpleConcept("月亮")).toContain("太阳");
  });
});

describe("麦克风降级", () => {
  it("浏览器不支持时友好返回而不是抛错", async () => {
    const service = new MicrophoneService();
    const result = await service.listenForVoice(10);
    expect(result.hasVoice).toBe(false);
    expect(result.reason).toBe("unsupported");
  });
});

describe("彩蛋记录", () => {
  it("导入时保留英语跟读记录", () => {
    const state = createInitialState();
    state.records.push({ id: "english-1", knowledgePointId: "english_apple", subject: "english", date: "2026-09-06", gameType: "repeatAfterMe", correct: true, attempts: 1, duration: 2, starsEarned: 2 });
    expect(normalizeState(state).records[0]).toMatchObject({ subject: "english", gameType: "repeatAfterMe" });
  });
});
