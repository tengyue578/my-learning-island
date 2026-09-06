"use client";

import { useState } from "react";
import { ArrowLeft, Mic, Volume2 } from "lucide-react";
import { localAICompanion } from "@/src/services/ai/AICompanionService";
import { microphoneService } from "@/src/services/speech/MicrophoneService";

interface Props { onHome: () => void; onSpeak: (text: string, lang?: string) => void }

export function CompanionPage({ onHome, onSpeak }: Props) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [reply, setReply] = useState("我准备好听你说啦！");
  const [listening, setListening] = useState(false);
  const prompt = localAICompanion.askChildQuestion(questionIndex);

  function choose(choice: string) {
    const response = localAICompanion.respondToChild(choice);
    setReply(response);
    onSpeak(response);
  }

  async function listen() {
    setListening(true);
    const result = await microphoneService.listenForVoice();
    setListening(false);
    const response = result.hasVoice ? localAICompanion.giveEncouragement() : result.reason === "denied" ? "麦克风没有打开，点下面的答案也可以告诉我。" : "我还没听清，再靠近一点试试吧。";
    setReply(response);
    onSpeak(response);
  }

  function nextQuestion() {
    setQuestionIndex((value) => value + 1);
    setReply("我还想听听你的想法！");
  }

  return <main className="companion-page"><div className="bonus-shell"><div className="simple-page-nav"><button onClick={onHome}><ArrowLeft />返回小岛</button><strong>⭐ 和小星星聊聊</strong></div>
    <section className="companion-room"><div className="companion-avatar">⭐</div><div className="companion-bubble"><span>小星星</span><h1>{prompt.text}</h1></div>
      <div className="companion-choices">{prompt.choices.map((choice) => <button key={choice} onClick={() => choose(choice)}>{choice}</button>)}</div>
      <button className="companion-mic" onClick={() => void listen()} disabled={listening}><Mic />{listening ? "我在听……" : "说给小星星听"}</button>
      <div className="companion-reply" aria-live="polite"><p>{reply}</p><button onClick={() => onSpeak(reply)} aria-label="再听一次"><Volume2 /></button></div>
      <button className="companion-next" onClick={nextQuestion}>换一个问题</button><small>内容来自本地预设，不连接网络；麦克风声音不会保存。</small>
    </section></div></main>;
}
