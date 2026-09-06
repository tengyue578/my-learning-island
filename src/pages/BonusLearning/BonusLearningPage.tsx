"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Volume2 } from "lucide-react";
import { englishLessons } from "@/src/data/english/lessons";
import { poetryLessons } from "@/src/data/poetry/lessons";
import { GameRenderer } from "@/src/games/GameRenderer";
import { RepeatAfterMe } from "@/src/games/RepeatAfterMe";
import type { GameQuestion, LearningRecord } from "@/src/models";

type BonusSubject = "english" | "poetry";
type Stage = "intro" | "repeat" | "choice" | "complete";

interface Props {
  subject: BonusSubject;
  date: string;
  onHome: () => void;
  onSpeak: (text: string, lang?: string) => void;
  onRecord: (record: LearningRecord) => void;
}

function englishQuestion(index: number): GameQuestion {
  const target = englishLessons[index % englishLessons.length];
  const distractors = [englishLessons[(index + 1) % englishLessons.length], englishLessons[(index + 2) % englishLessons.length]];
  return {
    id: `${target.id}_picture`, subject: "english", gameType: "pictureChoose", promptText: `哪个是 ${target.word}？`, speechText: `Which one is ${target.word}?`,
    target: target.word, targetImage: target.image, knowledgePointId: target.id,
    options: [target, ...distractors].map((item) => ({ id: item.id, label: item.word, image: item.image, value: item.word })),
  };
}

export function BonusLearningPage({ subject, date, onHome, onSpeak, onRecord }: Props) {
  const [itemIndex, setItemIndex] = useState(0);
  const [stage, setStage] = useState<Stage>("intro");
  const [lineIndex, setLineIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [resolved, setResolved] = useState(false);
  const startedAt = useRef(0);
  const english = englishLessons[itemIndex % englishLessons.length];
  const poem = poetryLessons[itemIndex % poetryLessons.length];
  const question = useMemo(() => englishQuestion(itemIndex), [itemIndex]);

  function addRecord(gameType: LearningRecord["gameType"], correct: boolean, recordAttempts: number, stars: number, duration = 1) {
    const item = subject === "english" ? english : poem;
    onRecord({ id: `${item.id}-${gameType}-${Date.now()}`, knowledgePointId: item.id, subject, date, gameType, correct, attempts: recordAttempts, duration: Math.max(1, Math.round(duration / 1000)), starsEarned: stars });
  }

  function finishRepeat(result: { heard: boolean; skipped: boolean; duration: number }) {
    addRecord("repeatAfterMe", result.heard, 1, result.heard ? 2 : 1, result.duration);
    if (subject === "english") {
      startedAt.current = Date.now();
      setStage("choice");
    }
    else if (lineIndex === 0) setLineIndex(1);
    else setStage("complete");
  }

  function choose(value: string) {
    if (resolved) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (value === question.target) {
      setResolved(true);
      setFeedback(`太棒啦！ +${nextAttempts === 1 ? 2 : 1}⭐`);
      onSpeak("太棒啦！");
      addRecord("pictureChoose", true, nextAttempts, nextAttempts === 1 ? 2 : 1, Date.now() - startedAt.current);
      window.setTimeout(() => setStage("complete"), 750);
    } else if (nextAttempts < 3) {
      setFeedback(nextAttempts === 1 ? "再看一看图片吧" : "闪闪的卡片在帮你");
      onSpeak("没关系，再试一次吧！");
    } else {
      setResolved(true);
      setFeedback(`一起记住：${english.word} 是 ${english.image}`);
      addRecord("pictureChoose", false, nextAttempts, 1, Date.now() - startedAt.current);
      window.setTimeout(() => setStage("complete"), 1100);
    }
  }

  function nextItem() {
    setItemIndex((value) => value + 1);
    setStage("intro");
    setLineIndex(0);
    setAttempts(0);
    setFeedback("");
    setResolved(false);
    startedAt.current = Date.now();
  }

  if (stage === "complete") return (
    <main className={`bonus-page bonus-${subject}`}>
      <section className="bonus-complete">
        <span>{subject === "english" ? "🌟" : "✨"}</span><h1>彩蛋点亮啦！</h1>
        <p>{subject === "english" ? `你认识了 ${english.word}` : `你跟读了《${poem.title}》`}</p>
        <div><button onClick={onHome}><ArrowLeft />返回小岛</button><button className="primary" onClick={nextItem}>再玩一个<ArrowRight /></button></div>
      </section>
    </main>
  );

  if (stage === "choice") return (
    <main className="bonus-page bonus-english"><div className="bonus-shell"><BonusNav subject={subject} onHome={onHome} />
      <GameRenderer question={question} attempts={attempts} feedback={feedback} resolved={resolved} onChoose={choose} onSpeak={() => onSpeak(question.speechText, "en-US")} />
    </div></main>
  );

  if (stage === "repeat") {
    const repeatText = subject === "english" ? english.word : poem.lines[lineIndex];
    return <main className={`bonus-page bonus-${subject}`}><div className="bonus-shell"><BonusNav subject={subject} onHome={onHome} />
      <RepeatAfterMe key={`${itemIndex}-${lineIndex}`} text={repeatText} lang={subject === "english" ? "en-US" : "zh-CN"} onSpeak={onSpeak} onComplete={finishRepeat} />
    </div></main>;
  }

  return (
    <main className={`bonus-page bonus-${subject}`}><div className="bonus-shell"><BonusNav subject={subject} onHome={onHome} />
      {subject === "english" ? <section className="bonus-intro english-card"><span className="bonus-label">今日英语彩蛋</span><div className="bonus-visual">{english.image}</div><h1>{english.word}</h1><button className="listen-again" onClick={() => onSpeak(english.word, "en-US")}><Volume2 />听一听</button><button className="next-adventure" onClick={() => setStage("repeat")}>跟我说<ArrowRight /></button></section>
        : <section className="bonus-intro poetry-card"><span className="bonus-label">月光古诗花园</span><div className="poem-heading"><span>{poem.image}</span><div><h1>{poem.title}</h1><p>{poem.author}</p></div></div><div className="poem-lines">{poem.lines.map((line) => <button key={line} onClick={() => onSpeak(line)}>{line}<Volume2 /></button>)}</div><button className="next-adventure" onClick={() => setStage("repeat")}>跟读前两句<ArrowRight /></button></section>}
    </div></main>
  );
}

function BonusNav({ subject, onHome }: { subject: BonusSubject; onHome: () => void }) {
  return <div className="simple-page-nav"><button onClick={onHome}><ArrowLeft />返回小岛</button><strong>{subject === "english" ? "🌍 英语小镇" : "🌙 古诗花园"}</strong></div>;
}
