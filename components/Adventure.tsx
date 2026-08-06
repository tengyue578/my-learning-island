"use client";

import { useState } from "react";
import { Check, LockKeyhole, Map, Star, Trophy } from "lucide-react";
import { starsForAttempt } from "@/lib/learning";

interface AdventureQuestion {
  category: string;
  prompt: string;
  options: string[];
  answer: string;
}

const ADVENTURE_QUESTIONS: AdventureQuestion[] = [
  { category: "字母", prompt: "大写 A 的小写朋友是谁？", options: ["a", "b", "d"], answer: "a" },
  { category: "数字", prompt: "数字 3 后面是谁？", options: ["2", "4", "5"], answer: "4" },
  { category: "算一算", prompt: "2 + 3 等于几？", options: ["4", "5", "6"], answer: "5" },
  { category: "古诗", prompt: "“鹅，鹅，鹅”的下一句是什么？", options: ["曲项向天歌", "低头思故乡", "春眠不觉晓"], answer: "曲项向天歌" },
  { category: "找规律", prompt: "粉、蓝、粉、蓝，接下来是什么？", options: ["粉", "蓝", "黄"], answer: "粉" },
  { category: "字母", prompt: "哪个是大写字母 M？", options: ["m", "M", "n", "W"], answer: "M" },
  { category: "数一数", prompt: "两只小手一共有几根手指？", options: ["5", "8", "10"], answer: "10" },
  { category: "算一算", prompt: "8 − 3 等于几？", options: ["4", "5", "6", "7"], answer: "5" },
  { category: "古诗", prompt: "“白日依山尽”来自哪首诗？", options: ["登鹳雀楼", "静夜思", "池上"], answer: "登鹳雀楼" },
  { category: "排序", prompt: "哪一组是从小到大？", options: ["1、2、5", "5、2、1", "2、1、5"], answer: "1、2、5" },
];

interface AdventureProps {
  currentLevel: number;
  completedLevels: number[];
  onLevelComplete: (level: number, reward: number) => void;
}

export function Adventure({ currentLevel, completedLevels, onLevelComplete }: AdventureProps) {
  const [selectedLevel, setSelectedLevel] = useState(currentLevel);
  const [attempts, setAttempts] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const question = ADVENTURE_QUESTIONS[selectedLevel - 1];
  const isCorrect = selected === question.answer;
  const isCompleted = completedLevels.includes(selectedLevel);

  function choose(option: string) {
    if (isCorrect) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setSelected(option);
    if (option === question.answer) {
      onLevelComplete(selectedLevel, isCompleted ? 0 : starsForAttempt(nextAttempts));
    }
  }

  function openLevel(level: number) {
    setSelectedLevel(level);
    setAttempts(0);
    setSelected(null);
  }

  return (
    <section className="module-page adventure" aria-labelledby="adventure-heading">
      <header className="module-heading">
        <span className="module-kicker">带上勇气，沿着星星地图出发</span>
        <h1 id="adventure-heading">闯关冒险</h1>
        <p>每关都是一个小挑战。第一次答对，可以收集 3 颗星！</p>
      </header>

      <div className="adventure-layout">
        <div className="adventure-map" aria-label="闯关地图">
          <div className="map-heading"><Map size={22} /><strong>星星路线</strong><span>{completedLevels.length}/10</span></div>
          <div className="level-grid">
            {ADVENTURE_QUESTIONS.map((_, index) => {
              const level = index + 1;
              const locked = level > currentLevel && !completedLevels.includes(level);
              const done = completedLevels.includes(level);
              return (
                <button
                  key={level}
                  data-testid="adventure-level"
                  className={`${selectedLevel === level ? "active" : ""} ${done ? "done" : ""}`}
                  disabled={locked}
                  aria-label={`第 ${level} 关，${locked ? "未解锁" : done ? "已完成" : "可挑战"}`}
                  onClick={() => openLevel(level)}
                >
                  {locked ? <LockKeyhole size={18} /> : done ? <Check size={18} /> : <span>{level}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="game-card adventure-question">
          <div className="adventure-topline">
            <span>第 {selectedLevel} 关</span>
            <span className="category-pill">{question.category}</span>
          </div>
          <h2>{question.prompt}</h2>
          <div className="adventure-options">
            {question.options.map((option) => (
              <button
                key={option}
                className={`${selected === option ? "selected" : ""} ${selected && option === question.answer ? "correct" : ""}`}
                onClick={() => choose(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className={`adventure-feedback ${selected ? (isCorrect ? "correct" : "wrong") : ""}`} aria-live="polite">
            {!selected && <p><Star size={20} />认真看题，选出答案</p>}
            {selected && !isCorrect && <p>没关系，再试一次，星星还在等你。</p>}
            {isCorrect && (
              <div>
                <Trophy size={34} />
                <p>{isCompleted ? "复习成功！这一关你已经会啦。" : `闯关成功！获得 ${starsForAttempt(attempts)} 颗星`}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
