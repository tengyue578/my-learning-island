"use client";

import { Volume2 } from "lucide-react";
import type { GameOption, GameQuestion } from "@/src/models";

interface Props {
  question: GameQuestion;
  attempts: number;
  feedback: string;
  resolved: boolean;
  onChoose: (value: string) => void;
  onSpeak: () => void;
}

function OptionButton({ option, className = "", hint, onChoose, disabled }: { option: GameOption; className?: string; hint: boolean; onChoose: (value: string) => void; disabled: boolean }) {
  return (
    <button className={`${className} ${hint ? "hinted" : ""}`} onClick={() => onChoose(option.value)} disabled={disabled}>
      {option.image && <span className="option-image">{option.image}</span>}
      <strong>{option.label}</strong>
    </button>
  );
}

export function GameRenderer({ question, attempts, feedback, resolved, onChoose, onSpeak }: Props) {
  const showHint = attempts >= 2;
  return (
    <section className={`game-surface game-${question.gameType}`} aria-label={question.promptText}>
      <div className="game-prompt-row">
        <div><span>小星星说</span><h2>{question.promptText}</h2></div>
        <button onClick={onSpeak} aria-label="再听一次"><Volume2 /></button>
      </div>

      {question.gameType === "quantityGame" && (
        <div className="quantity-scene" aria-label={`${question.quantity ?? 1}个苹果`}>
          {Array.from({ length: question.quantity ?? 1 }, (_, index) => <span key={index}>{question.sceneEmoji ?? "🍎"}</span>)}
        </div>
      )}

      {question.gameType === "pictureChoose" && question.targetImage && (
        <div className="picture-clue"><span>{question.targetImage}</span></div>
      )}

      <div className={question.gameType === "balloonPop" ? "balloon-options" : "choice-options"}>
        {question.options.map((option, index) => (
          <OptionButton key={option.id} option={option} className={question.gameType === "balloonPop" ? `balloon balloon-${index + 1}` : "choice-card"} hint={showHint && option.value === question.target} onChoose={onChoose} disabled={resolved} />
        ))}
      </div>

      <div className={`child-feedback ${resolved ? "success" : feedback ? "gentle" : ""}`} aria-live="polite">
        <span>{resolved ? "⭐" : feedback ? "💛" : "👀"}</span><strong>{feedback || "找找看！"}</strong>
      </div>
    </section>
  );
}
