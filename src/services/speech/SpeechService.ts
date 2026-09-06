const preferredVoiceNames: Record<"zh" | "en", string[]> = {
  zh: ["xiaoyi", "xiaoxiao", "yaoyao", "huihui", "tingting", "晓伊", "晓晓", "瑶瑶", "婷婷"],
  en: ["ana", "jenny", "aria", "sonia", "samantha", "zira"],
};

export function chooseWarmVoice(voices: SpeechSynthesisVoice[], lang: string) {
  const family = lang.toLowerCase().startsWith("en") ? "en" : "zh";
  const locale = lang.toLowerCase();
  return [...voices]
    .filter((voice) => voice.lang.toLowerCase().startsWith(family))
    .sort((left, right) => scoreVoice(right, locale, family) - scoreVoice(left, locale, family))[0];
}

function scoreVoice(voice: SpeechSynthesisVoice, locale: string, family: "zh" | "en") {
  const name = voice.name.toLowerCase();
  let score = voice.lang.toLowerCase() === locale ? 80 : 50;
  if (voice.localService) score += 35;
  if (name.includes("natural") || name.includes("neural")) score += 15;
  const preferredIndex = preferredVoiceNames[family].findIndex((candidate) => name.includes(candidate.toLowerCase()));
  if (preferredIndex >= 0) score += 70 - preferredIndex * 4;
  return score;
}

export function warmSpeechProfile(text: string, lang: string) {
  const isChinese = lang.toLowerCase().startsWith("zh");
  const compactLength = text.replace(/\s/g, "").length;
  return {
    rate: isChinese ? (compactLength <= 4 ? 0.74 : 0.82) : (compactLength <= 8 ? 0.76 : 0.82),
    pitch: isChinese ? 1.03 : 1.02,
    volume: 0.96,
  };
}

function addNaturalPauses(text: string, lang: string) {
  if (!lang.toLowerCase().startsWith("zh")) return text.trim();
  return text.trim().replace(/([，、；：。！？])/g, "$1 ").replace(/\s+/g, " ").trim();
}

export class SpeechService {
  private speaking = false;
  private voices: SpeechSynthesisVoice[] = [];
  private prepared = false;

  private refreshVoices = () => {
    if (this.isSupported()) this.voices = window.speechSynthesis.getVoices();
  };

  isSupported() {
    return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
  }

  prepare() {
    if (!this.isSupported()) return false;
    this.refreshVoices();
    if (!this.prepared) {
      window.speechSynthesis.addEventListener("voiceschanged", this.refreshVoices);
      this.prepared = true;
    }
    return true;
  }

  speak(text: string, lang = "zh-CN") {
    if (!this.prepare()) return false;
    this.stop();
    const utterance = new SpeechSynthesisUtterance(addNaturalPauses(text, lang));
    const profile = warmSpeechProfile(text, lang);
    utterance.lang = lang;
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;
    utterance.volume = profile.volume;
    utterance.voice = chooseWarmVoice(this.voices, lang) ?? null;
    utterance.onstart = () => { this.speaking = true; };
    utterance.onend = () => { this.speaking = false; };
    utterance.onerror = () => { this.speaking = false; };
    window.speechSynthesis.speak(utterance);
    return true;
  }

  stop() {
    if (this.isSupported()) window.speechSynthesis.cancel();
    this.speaking = false;
  }

  isSpeaking() {
    return this.speaking;
  }
}

export const speechService = new SpeechService();
