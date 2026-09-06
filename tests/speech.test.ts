import { describe, expect, it } from "vitest";
import { chooseWarmVoice, warmSpeechProfile } from "@/src/services/speech/SpeechService";

function voice(name: string, lang: string, localService = true) {
  return { name, lang, localService, default: false, voiceURI: name } as SpeechSynthesisVoice;
}

describe("温柔系统语音", () => {
  it("中文优先选择本地温柔童声", () => {
    const selected = chooseWarmVoice([
      voice("Generic Chinese", "zh-CN"),
      voice("Microsoft Xiaoyi", "zh-CN"),
      voice("English Voice", "en-US"),
    ], "zh-CN");
    expect(selected?.name).toBe("Microsoft Xiaoyi");
  });

  it("英文独立选择自然英文声音", () => {
    const selected = chooseWarmVoice([
      voice("Microsoft Xiaoxiao", "zh-CN"),
      voice("Microsoft Jenny Natural", "en-US", false),
      voice("Generic English", "en-US"),
    ], "en-US");
    expect(selected?.name).toBe("Microsoft Jenny Natural");
  });

  it("短知识点读得更慢且不使用夸张高音", () => {
    const short = warmSpeechProfile("山", "zh-CN");
    const sentence = warmSpeechProfile("欢迎来到我的学习小岛", "zh-CN");
    expect(short.rate).toBeLessThan(sentence.rate);
    expect(short.pitch).toBeLessThanOrEqual(1.03);
    expect(short.volume).toBeLessThan(1);
  });
});
