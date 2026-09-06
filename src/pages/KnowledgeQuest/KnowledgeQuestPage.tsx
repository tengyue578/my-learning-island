"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { GameRenderer } from "@/src/games/GameRenderer";
import { RepeatAfterMe } from "@/src/games/RepeatAfterMe";
import type { AppState, GameQuestion, LearningRecord, Subject } from "@/src/models";
import { curriculumPools } from "@/src/services/learning/curriculum";
import { buildKnowledgeQuest } from "@/src/services/learning/questionGenerator";

const subjectMeta: Record<Subject, { name: string; emoji: string }> = {
  pinyin: { name: "拼音乐园", emoji: "🎈" }, math: { name: "数学王国", emoji: "🧱" }, hanzi: { name: "汉字森林", emoji: "🌳" }, english: { name: "英语小镇", emoji: "🌍" }, poetry: { name: "古诗花园", emoji: "🌙" },
};

interface Props {
  state: AppState;
  subject: Subject;
  knowledgePointId: string;
  date: string;
  onBack: () => void;
  onSpeak: (text: string, lang?: string) => void;
  onRecord: (record: LearningRecord) => void;
}

export function KnowledgeQuestPage({ state, subject, knowledgePointId, date, onBack, onSpeak, onRecord }: Props) {
  const progress = state.questProgress[knowledgePointId];
  const levels = buildKnowledgeQuest(subject, knowledgePointId);
  const lesson = curriculumPools[subject].find((item) => item.id === knowledgePointId) ?? curriculumPools[subject][0];
  const firstOpen = Math.min(5, progress?.unlockedLevel ?? 1) as 1 | 2 | 3 | 4 | 5;
  const [currentLevel, setCurrentLevel] = useState<1 | 2 | 3 | 4 | 5>(firstOpen);
  const [sessionComplete, setSessionComplete] = useState((progress?.completedLevels.length ?? 0) >= 5);
  const current = levels[currentLevel - 1];
  const meta = subjectMeta[subject];

  function finishLevel(record: LearningRecord) {
    onRecord(record);
    if (!record.correct) return;
    if (currentLevel === 5) setSessionComplete(true);
    else setCurrentLevel((currentLevel + 1) as 1 | 2 | 3 | 4 | 5);
  }

  function replay() {
    setCurrentLevel(1);
    setSessionComplete(false);
  }

  return <main className={`quest-page quest-${subject}`}><div className="quest-shell">
    <div className="simple-page-nav"><button onClick={onBack}><ArrowLeft />课程地图</button><strong>{meta.emoji} {meta.name}</strong></div>
    <section className="quest-heading"><div><span>知识点冒险</span><h1>{lesson.title}</h1></div><div className="quest-badge"><Trophy />5 关挑战</div></section>
    <nav className="quest-path" aria-label="五关进度">{levels.map((level) => {
      const completed = progress?.completedLevels.includes(level.level) || (sessionComplete && level.level <= currentLevel);
      const unlocked = level.level <= (progress?.unlockedLevel ?? 1) || level.level <= currentLevel;
      return <button key={level.level} disabled={!unlocked} className={`${completed ? "done" : ""} ${currentLevel === level.level && !sessionComplete ? "active" : ""}`} onClick={() => unlocked && setCurrentLevel(level.level)}><i>{completed ? "✓" : level.emoji}</i><strong>第 {level.level} 关</strong><small>{level.title}</small></button>;
    })}</nav>

    {sessionComplete ? <section className="quest-victory"><span>🏆</span><h2>{lesson.title}闯关成功！</h2><p>从认识到应用，5 个不同挑战全部完成。</p><div><button onClick={onBack}><ArrowLeft />学习下一个</button><button className="primary" onClick={replay}><RotateCcw />再闯一次</button></div></section>
      : current.kind === "repeat" ? <RepeatAfterMe key={`${knowledgePointId}-${currentLevel}`} text={current.text} lang={current.lang} onSpeak={onSpeak} onComplete={(result) => finishLevel({ id: `${knowledgePointId}-level-${currentLevel}-${Date.now()}`, knowledgePointId, subject, date, gameType: "repeatAfterMe", correct: true, attempts: result.skipped ? 2 : 1, duration: Math.max(1, Math.round(result.duration / 1000)), starsEarned: result.heard ? 3 : 1, questLevel: currentLevel })} />
        : <QuestQuestion key={current.question.id} question={current.question} date={date} onSpeak={onSpeak} onFinish={finishLevel} />}
  </div></main>;
}

function QuestQuestion({ question, date, onSpeak, onFinish }: { question: GameQuestion; date: string; onSpeak: (text: string, lang?: string) => void; onFinish: (record: LearningRecord) => void }) {
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [resolved, setResolved] = useState(false);
  const startedAt = useRef(0);
  const lang = question.subject === "english" ? "en-US" : "zh-CN";

  useEffect(() => {
    onSpeak(question.speechText, lang);
  }, [lang, onSpeak, question.id, question.speechText]);

  function record(correct: boolean, finalAttempts: number) {
    onFinish({ id: `${question.id}-${Date.now()}`, knowledgePointId: question.knowledgePointId, subject: question.subject, date, gameType: question.gameType, correct, attempts: finalAttempts, duration: Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)), starsEarned: correct ? finalAttempts === 1 ? 3 : finalAttempts === 2 ? 2 : 1 : 0, questLevel: question.questLevel });
  }

  function choose(value: string) {
    if (resolved) return;
    if (!startedAt.current) startedAt.current = Date.now();
    const next = attempts + 1;
    setAttempts(next);
    if (value === question.target) {
      setResolved(true);
      setFeedback(next === 1 ? "一次成功！得到 3 颗星" : "挑战成功！继续前进");
      onSpeak("挑战成功，继续前进！");
      record(true, next);
    } else if (next < 3) {
      setFeedback(next === 1 ? "再观察一下，不着急" : "发光的选项在给你提示");
      onSpeak("再看一看，你可以的！");
    } else {
      setResolved(true);
      setFeedback("看到答案了吗？马上再挑战一次！");
      record(false, next);
      window.setTimeout(() => { setAttempts(0); setFeedback("这一次一定能找到！"); setResolved(false); startedAt.current = Date.now(); }, 950);
    }
  }

  return <GameRenderer question={question} attempts={attempts} feedback={feedback} resolved={resolved} onChoose={choose} onSpeak={() => onSpeak(question.speechText, lang)} />;
}
