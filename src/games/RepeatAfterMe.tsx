"use client";

import { useState } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { microphoneService, type VoiceActivityReason } from "@/src/services/speech/MicrophoneService";

interface RepeatResult { heard: boolean; skipped: boolean; duration: number }

interface Props {
  text: string;
  lang?: string;
  onSpeak: (text: string, lang?: string) => void;
  onComplete: (result: RepeatResult) => void;
}

type Status = "idle" | "listening" | "success" | VoiceActivityReason;

const statusText: Record<Status, string> = {
  idle: "点一下麦克风，再说给我听",
  listening: "我在听……",
  success: "我听到你啦！",
  silent: "声音轻轻的，再试一次吧",
  denied: "麦克风没有打开，也可以先跳过",
  unsupported: "这个浏览器暂时不能用麦克风",
  error: "麦克风刚才打了个喷嚏，再试一次吧",
};

export function RepeatAfterMe({ text, lang = "zh-CN", onSpeak, onComplete }: Props) {
  const [status, setStatus] = useState<Status>("idle");

  async function listen() {
    if (status === "listening" || status === "success") return;
    setStatus("listening");
    const result = await microphoneService.listenForVoice();
    if (result.hasVoice) {
      setStatus("success");
      onComplete({ heard: true, skipped: false, duration: result.duration });
      return;
    }
    setStatus(result.reason ?? "silent");
  }

  function skip() {
    microphoneService.stop();
    onComplete({ heard: false, skipped: true, duration: 0 });
  }

  return (
    <section className={`repeat-card repeat-${status}`} aria-label="跟读小游戏">
      <span className="repeat-eyebrow">听一听 · 说一说</span>
      <h2>{text}</h2>
      <button className="repeat-listen" onClick={() => onSpeak(text, lang)}><Volume2 />先听一遍</button>
      <button className="repeat-mic" onClick={() => void listen()} disabled={status === "listening" || status === "success"} aria-label={status === "listening" ? "正在听" : "开始跟读"}>
        {status === "denied" || status === "unsupported" ? <MicOff /> : <Mic />}
      </button>
      <p aria-live="polite">{statusText[status]}</p>
      {status !== "success" && status !== "listening" && <button className="repeat-skip" onClick={skip}>先跳过</button>}
    </section>
  );
}
