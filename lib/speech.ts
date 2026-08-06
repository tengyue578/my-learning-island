export function speakText(text: string, lang: "en-US" | "zh-CN"): boolean {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    return false;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = lang === "zh-CN" ? 0.78 : 0.72;
  utterance.pitch = 1.08;
  window.speechSynthesis.speak(utterance);
  return true;
}
