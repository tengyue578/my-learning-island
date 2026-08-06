"use client";

import { useState } from "react";
import { Calculator, CircleDot, Hash, RefreshCw, Volume2 } from "lucide-react";
import { createCountingQuestion, createMathQuestion } from "@/lib/learning";
import { speakText } from "@/lib/speech";

type Mode = "recognize" | "math" | "count";

export function NumberKingdom({ onActivity }: { onActivity: () => void }) {
  const [mode, setMode] = useState<Mode>("recognize");
  const [mathQuestion, setMathQuestion] = useState(() => createMathQuestion());
  const [countQuestion, setCountQuestion] = useState(() => createCountingQuestion());
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");

  function answer(value: number, correct: number) {
    if (feedback === "correct") return;
    if (value === correct) {
      setFeedback("correct");
      onActivity();
    } else {
      setFeedback("wrong");
    }
  }

  function nextMath() {
    setMathQuestion(createMathQuestion());
    setFeedback("idle");
  }

  function nextCount() {
    setCountQuestion(createCountingQuestion());
    setFeedback("idle");
  }

  return (
    <section className="module-page number-kingdom" aria-labelledby="number-heading">
      <header className="module-heading">
        <span className="module-kicker">从 0 数到 20，数字都是好朋友</span>
        <h1 id="number-heading">数字王国</h1>
        <p>认识数字、算一算、数一数，每次只做一个小挑战。</p>
      </header>

      <div className="segmented-control three" aria-label="数字学习方式">
        <button className={mode === "recognize" ? "active" : ""} onClick={() => { setMode("recognize"); setFeedback("idle"); }}>
          <Hash size={20} />认识数字
        </button>
        <button className={mode === "math" ? "active" : ""} onClick={() => { setMode("math"); setFeedback("idle"); }}>
          <Calculator size={20} />加减练习
        </button>
        <button className={mode === "count" ? "active" : ""} onClick={() => { setMode("count"); setFeedback("idle"); }}>
          <CircleDot size={20} />数一数
        </button>
      </div>

      {mode === "recognize" && (
        <div className="number-grid">
          {Array.from({ length: 21 }, (_, number) => (
            <button
              key={number}
              className={`number-card candy-${number % 5}`}
              aria-label={`朗读数字 ${number}`}
              onClick={() => { speakText(String(number), "zh-CN"); onActivity(); }}
            >
              <strong>{number}</strong>
              <span className="mini-dots" aria-hidden="true">
                {Array.from({ length: Math.min(number, 5) }, (_, index) => <i key={index} />)}
              </span>
              <Volume2 size={18} />
            </button>
          ))}
        </div>
      )}

      {mode === "math" && (
        <div className="game-card quiz-card">
          <span className="game-label">10 以内加减法</span>
          <div className="equation" aria-label="算式">
            <span>{mathQuestion.left}</span><b>{mathQuestion.operator}</b><span>{mathQuestion.right}</span><b>=</b><span className="answer-blank">?</span>
          </div>
          <div className="answer-grid">
            {mathQuestion.options.map((option) => (
              <button key={option} onClick={() => answer(option, mathQuestion.answer)}>{option}</button>
            ))}
          </div>
          <QuizFeedback feedback={feedback} onNext={nextMath} />
        </div>
      )}

      {mode === "count" && (
        <div className="game-card quiz-card">
          <span className="game-label">数数小挑战</span>
          <p className="quiz-prompt">这里有几个彩色圆点？</p>
          <div className="counting-board" aria-label={`${countQuestion.count} 个圆点`}>
            {Array.from({ length: countQuestion.count }, (_, index) => (
              <i className={`count-dot candy-${index % 5}`} key={index} />
            ))}
          </div>
          <div className="answer-grid">
            {countQuestion.options.map((option) => (
              <button key={option} onClick={() => answer(option, countQuestion.answer)}>{option}</button>
            ))}
          </div>
          <QuizFeedback feedback={feedback} onNext={nextCount} />
        </div>
      )}
    </section>
  );
}

function QuizFeedback({ feedback, onNext }: { feedback: "idle" | "correct" | "wrong"; onNext: () => void }) {
  return (
    <div className={`quiz-feedback ${feedback}`} aria-live="polite">
      <p>{feedback === "correct" ? "答对啦！你真会动脑筋" : feedback === "wrong" ? "差一点，再试一次" : "选一个你觉得对的答案"}</p>
      {feedback === "correct" && (
        <button className="primary-button" onClick={onNext}><RefreshCw size={20} />下一题</button>
      )}
    </div>
  );
}
