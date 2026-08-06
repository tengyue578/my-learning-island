"use client";

import { useMemo, useState } from "react";
import { Check, Puzzle, RotateCcw, Volume2 } from "lucide-react";
import { speakText } from "@/lib/speech";

const WORDS = [
  "Apple", "Ball", "Cat", "Dog", "Egg", "Fish", "Gift", "Hat", "Ice", "Juice",
  "Kite", "Lion", "Moon", "Nest", "Orange", "Pig", "Queen", "Rabbit", "Sun",
  "Tree", "Umbrella", "Van", "Water", "Box", "Yo-yo", "Zoo",
];

const LETTERS = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));

export function LetterLand({ onActivity }: { onActivity: () => void }) {
  const [mode, setMode] = useState<"learn" | "match">("learn");
  const [round, setRound] = useState(0);
  const [selectedUpper, setSelectedUpper] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [message, setMessage] = useState("先选一个大写字母");
  const [speechAvailable, setSpeechAvailable] = useState(true);

  const roundLetters = useMemo(() => {
    const start = (round * 4) % 24;
    return LETTERS.slice(start, start + 4);
  }, [round]);

  function readLetter(letter: string, word: string) {
    const didSpeak = speakText(`${letter}. ${word}.`, "en-US");
    setSpeechAvailable(didSpeak);
    onActivity();
  }

  function chooseLower(lower: string) {
    if (!selectedUpper) {
      setMessage("先点上面的大写字母哦");
      return;
    }
    if (selectedUpper.toLowerCase() === lower) {
      const nextMatched = [...matched, selectedUpper];
      setMatched(nextMatched);
      setMessage(nextMatched.length === roundLetters.length ? "全部配对成功，太棒啦！" : "配对成功！再来一个");
      setSelectedUpper(null);
      if (nextMatched.length === roundLetters.length) onActivity();
    } else {
      setMessage("再看一看，它们长得还不一样");
    }
  }

  function newRound() {
    setRound((value) => value + 1);
    setMatched([]);
    setSelectedUpper(null);
    setMessage("先选一个大写字母");
  }

  return (
    <section className="module-page letter-land" aria-labelledby="letter-heading">
      <header className="module-heading">
        <span className="module-kicker">ABC 一起开口说</span>
        <h1 id="letter-heading">字母乐园</h1>
        <p>点一点字母，听听它怎么读；再把大小写送回同一个家。</p>
      </header>

      <div className="segmented-control" aria-label="字母学习方式">
        <button className={mode === "learn" ? "active" : ""} onClick={() => setMode("learn")}>
          <Volume2 size={20} />认识字母
        </button>
        <button className={mode === "match" ? "active" : ""} onClick={() => setMode("match")}>
          <Puzzle size={20} />开始配对
        </button>
      </div>

      {mode === "learn" ? (
        <div className="alphabet-grid">
          {LETTERS.map((letter, index) => (
            <button
              key={letter}
              className={`letter-card candy-${index % 5}`}
              aria-label={`朗读字母 ${letter}`}
              onClick={() => readLetter(letter, WORDS[index])}
            >
              <span className="letter-pair"><strong>{letter}</strong><b>{letter.toLowerCase()}</b></span>
              <span>{WORDS[index]}</span>
              <Volume2 aria-hidden="true" size={18} />
            </button>
          ))}
        </div>
      ) : (
        <div className="game-card match-game">
          <div className="game-topline">
            <span className="progress-pill">已配对 {matched.length}/{roundLetters.length}</span>
            <button className="icon-text-button" onClick={newRound} aria-label="换一组字母">
              <RotateCcw size={20} />换一组
            </button>
          </div>
          <p className={`feedback ${message.includes("成功") || message.includes("太棒") ? "success" : ""}`} aria-live="polite">
            {message}
          </p>
          <div className="match-row" aria-label="大写字母">
            {roundLetters.map((letter, index) => (
              <button
                key={letter}
                className={`match-tile candy-${index % 5} ${selectedUpper === letter ? "selected" : ""} ${matched.includes(letter) ? "matched" : ""}`}
                disabled={matched.includes(letter)}
                onClick={() => { setSelectedUpper(letter); setMessage(`找到小写 ${letter.toLowerCase()}`); }}
              >
                {matched.includes(letter) ? <Check size={28} /> : letter}
              </button>
            ))}
          </div>
          <div className="match-divider" />
          <div className="match-row" aria-label="小写字母">
            {[...roundLetters].reverse().map((letter, index) => (
              <button
                key={letter}
                className={`match-tile candy-${(index + 2) % 5} ${matched.includes(letter) ? "matched" : ""}`}
                disabled={matched.includes(letter)}
                onClick={() => chooseLower(letter.toLowerCase())}
              >
                {matched.includes(letter) ? <Check size={28} /> : letter.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {!speechAvailable && <p className="notice">这个浏览器暂时不能朗读，但字母游戏仍然可以玩。</p>}
    </section>
  );
}
