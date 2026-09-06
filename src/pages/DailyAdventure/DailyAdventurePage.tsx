"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Gift, Volume2 } from "lucide-react";
import type { CoreSubject, DailyPlan, GameQuestion, LearningRecord } from "@/src/models";
import { childMessages, randomPraise } from "@/src/data/messages/childMessages";
import { buildAdventureSteps } from "@/src/services/learning/questionGenerator";
import { GameRenderer } from "@/src/games/GameRenderer";

const subjectMeta: Record<CoreSubject, { name: string; emoji: string; color: string }> = {
  pinyin: { name: "拼音乐园", emoji: "🎈", color: "sky" },
  math: { name: "数学王国", emoji: "🧱", color: "sun" },
  hanzi: { name: "汉字森林", emoji: "🌳", color: "forest" },
};

interface Props {
  plan: DailyPlan;
  onHome: () => void;
  onSpeak: (text: string) => void;
  onStep: (subject: CoreSubject, step: number) => void;
  onRecord: (record: LearningRecord) => void;
  onSubjectComplete: (subject: CoreSubject) => void;
  onClaimChest: () => void;
  onRoom: () => void;
}

interface QuestionInteractionProps {
  question: GameQuestion;
  date: string;
  onSpeak: (text: string) => void;
  onRecord: (record: LearningRecord) => void;
  onAdvance: () => void;
}

function QuestionInteraction({ question, date, onSpeak, onRecord, onAdvance }: QuestionInteractionProps) {
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [resolved, setResolved] = useState(false);
  const startedAt = useRef(0);

  useEffect(() => {
    onSpeak(question.speechText);
  }, [onSpeak, question.id, question.speechText]);

  function finish(finalAttempts: number, correct: boolean) {
    const starsEarned = finalAttempts === 1 ? 3 : finalAttempts === 2 ? 2 : 1;
    onRecord({
      id: `${question.id}-${Date.now()}`,
      knowledgePointId: question.knowledgePointId,
      subject: question.subject,
      date,
      gameType: question.gameType,
      correct,
      attempts: finalAttempts,
      duration: Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)),
      starsEarned,
      questLevel: question.questLevel,
    });
    if (correct) window.setTimeout(onAdvance, 700);
    else window.setTimeout(() => {
      setAttempts(0);
      setFeedback("再挑战一次，你一定可以！");
      setResolved(false);
      startedAt.current = Date.now();
    }, 950);
  }

  function choose(value: string) {
    if (resolved) return;
    if (startedAt.current === 0) startedAt.current = Date.now();
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (value === question.target) {
      const praise = randomPraise();
      setFeedback(`${praise} +${nextAttempts === 1 ? 3 : nextAttempts === 2 ? 2 : 1}⭐`);
      setResolved(true);
      onSpeak(praise);
      finish(nextAttempts, true);
      return;
    }
    if (nextAttempts === 1) {
      setFeedback(childMessages.retry);
      onSpeak(childMessages.retry);
    } else if (nextAttempts === 2) {
      setFeedback(childMessages.hint);
      onSpeak(childMessages.hint);
    } else {
      setFeedback(childMessages.reveal);
      setResolved(true);
      onSpeak(childMessages.reveal);
      finish(nextAttempts, false);
    }
  }

  return <GameRenderer question={question} attempts={attempts} feedback={feedback} resolved={resolved} onChoose={choose} onSpeak={() => onSpeak(question.speechText)} />;
}

function LessonSpeech({ id, text, onSpeak }: { id: string; text: string; onSpeak: (text: string) => void }) {
  useEffect(() => {
    onSpeak(text);
  }, [id, onSpeak, text]);
  return null;
}

export function DailyAdventurePage({ plan, onHome, onSpeak, onStep, onRecord, onSubjectComplete, onClaimChest, onRoom }: Props) {
  const currentTask = plan.tasks[plan.activeTaskIndex] ?? plan.tasks.at(-1);
  const meta = currentTask ? subjectMeta[currentTask.subject] : subjectMeta.hanzi;
  const steps = currentTask ? buildAdventureSteps(currentTask.subject, currentTask.knowledgePointIds, currentTask.newKnowledgePointIds) : [];
  const step = steps[Math.min(currentTask?.stepIndex ?? 0, Math.max(0, steps.length - 1))];

  function advance() {
    if (!currentTask) return;
    if (currentTask.stepIndex >= steps.length - 1) onSubjectComplete(currentTask.subject);
    else onStep(currentTask.subject, currentTask.stepIndex + 1);
  }

  if (plan.dailyCompleted) {
    return (
      <main className="adventure-page completion-page">
        <section className="completion-card">
          <div className="confetti" aria-hidden="true">⭐ 🪙 ⭐</div>
          <span className="completion-star">🌟</span>
          <h1>今天的冒险完成啦！</h1>
          <p>{plan.tasks.length} 个地方都亮起来啦！</p>
          {!plan.chestClaimed ? (
            <button className="big-chest" onClick={onClaimChest}><Gift /><strong>打开超级宝箱</strong></button>
          ) : (
            <div className="chest-opened"><span>{plan.chestReward?.emoji ?? "🎁"}</span><strong>得到{plan.chestReward?.label ?? "一份惊喜"}！</strong></div>
          )}
          <div className="completion-actions">
            <button onClick={onHome}><ArrowLeft />返回小岛</button>
            {plan.chestClaimed && <button className="primary" onClick={onRoom}>去我的房间<ArrowRight /></button>}
          </div>
        </section>
      </main>
    );
  }

  if (!currentTask || !step) return null;
  const totalDone = plan.tasks.filter((task) => task.completed).length;

  return (
    <main className={`adventure-page tone-${meta.color}`}>
      <div className="adventure-shell">
        <div className="adventure-nav">
          <button onClick={onHome} aria-label="返回小岛"><ArrowLeft /></button>
          <div className="subject-title"><span>{meta.emoji}</span><strong>{meta.name}</strong></div>
          <div className="adventure-dots" aria-label={`已完成${totalDone}个冒险`}>
            {plan.tasks.map((task) => <i key={task.subject} className={task.completed ? "done" : task.subject === currentTask.subject ? "active" : ""} />)}
          </div>
        </div>

        <div className="step-path" aria-label="本次小游戏进度">
          {steps.map((item, index) => <i key={item.id} className={index < currentTask.stepIndex ? "done" : index === currentTask.stepIndex ? "active" : ""} />)}
        </div>

        {step.kind === "lesson" ? (
          <section className="lesson-card">
            <LessonSpeech id={step.id} text={step.speechText} onSpeak={onSpeak} />
            <span className="lesson-eyebrow">{step.eyebrow}</span>
            <div className="lesson-visual"><span>{step.image}</span></div>
            <h1>{step.title}</h1>
            <p>{step.note}</p>
            <button className="listen-again" onClick={() => onSpeak(step.speechText)}><Volume2 />再听一次</button>
            <button className="next-adventure" onClick={advance}>我认识啦！<ArrowRight /></button>
          </section>
        ) : (
          <QuestionInteraction key={step.id} question={step.question} date={plan.date} onSpeak={onSpeak} onRecord={onRecord} onAdvance={advance} />
        )}
      </div>
    </main>
  );
}
