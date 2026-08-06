"use client";

import { useState } from "react";
import { ArrowRight, Brain, Lightbulb } from "lucide-react";
import { LOGIC_QUESTIONS } from "@/content/logic";

export function LogicChallenge({ onActivity }: { onActivity: () => void }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const question = LOGIC_QUESTIONS[questionIndex];
  const isCorrect = selected === question.answer;

  function choose(option: string) {
    if (isCorrect) return;
    setSelected(option);
    if (option === question.answer) onActivity();
  }

  function next() {
    setQuestionIndex((value) => (value + 1) % LOGIC_QUESTIONS.length);
    setSelected(null);
  }

  return (
    <section className="module-page logic-challenge" aria-labelledby="logic-heading">
      <header className="module-heading">
        <span className="module-kicker">看一看，想一想，找到小秘密</span>
        <h1 id="logic-heading">逻辑挑战</h1>
        <p>找规律、认图形、排顺序。答错也没关系，再想一次就好。</p>
      </header>

      <div className="game-card logic-card">
        <div className="logic-meta">
          <span><Brain size={20} />{question.type}</span>
          <span>第 {questionIndex + 1}/{LOGIC_QUESTIONS.length} 题</span>
        </div>
        <h2>{question.prompt}</h2>
        {question.visual && <VisualPattern items={question.visual} />}
        <div className="logic-options">
          {question.options.map((option, index) => (
            <button
              key={option}
              className={`${selected === option ? "selected" : ""} ${selected && option === question.answer ? "correct" : ""}`}
              data-testid="logic-option"
              onClick={() => choose(option)}
            >
              <span>{String.fromCharCode(65 + index)}</span>{option}
            </button>
          ))}
        </div>
        <div className={`logic-feedback ${selected ? (isCorrect ? "correct" : "wrong") : ""}`} aria-live="polite">
          <p><Lightbulb size={20} />{!selected ? "选一个答案吧" : isCorrect ? `答对啦！${question.hint}` : "再想一想，你一定能找到规律。"}</p>
          {isCorrect && <button className="primary-button" onClick={next}>下一题<ArrowRight size={20} /></button>}
        </div>
      </div>
    </section>
  );
}

function VisualPattern({ items }: { items: string[] }) {
  return (
    <div className="visual-pattern" aria-label="题目图形">
      {items.map((item, index) => <i className={`shape ${item}`} key={`${item}-${index}`} />)}
      <b>?</b>
    </div>
  );
}
