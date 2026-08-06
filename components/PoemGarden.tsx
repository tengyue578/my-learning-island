"use client";

import { useState } from "react";
import { BookOpen, Pause, Volume2 } from "lucide-react";
import { POEMS } from "@/content/poems";
import { speakText } from "@/lib/speech";

export function PoemGarden({ onActivity }: { onActivity: () => void }) {
  const [reading, setReading] = useState<string | null>(null);
  const [speechAvailable, setSpeechAvailable] = useState(true);

  function readPoem(index: number) {
    const poem = POEMS[index];
    const text = `${poem.title}，${poem.dynasty}，${poem.author}。${poem.lines.map((line) => line.text).join("，")}。`;
    const didSpeak = speakText(text, "zh-CN");
    setSpeechAvailable(didSpeak);
    setReading(didSpeak ? poem.title : null);
    onActivity();
  }

  function stopReading() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setReading(null);
  }

  return (
    <section className="module-page poem-garden" aria-labelledby="poem-heading">
      <header className="module-heading">
        <span className="module-kicker">一字一句，读出小小诗意</span>
        <h1 id="poem-heading">古诗花园</h1>
        <p>先看拼音，再读诗句。点小喇叭，可以跟着慢慢念。</p>
      </header>

      <div className="poem-grid">
        {POEMS.map((poem, index) => (
          <article className={`poem-card candy-${index % 5}`} key={poem.title} data-testid="poem-card">
            <div className="poem-title-row">
              <div className="poem-number"><BookOpen size={22} /><span>{String(index + 1).padStart(2, "0")}</span></div>
              <div>
                <h2>{poem.title}</h2>
                <p>{poem.dynasty} · {poem.author}</p>
              </div>
            </div>
            <div className="poem-lines">
              {poem.lines.map((line) => (
                <div className="poem-line" key={line.text}>
                  <span>{line.pinyin}</span>
                  <strong>{line.text}</strong>
                </div>
              ))}
            </div>
            <button
              className="primary-button poem-read"
              aria-label={`朗读《${poem.title}》`}
              onClick={() => reading === poem.title ? stopReading() : readPoem(index)}
            >
              {reading === poem.title ? <Pause size={20} /> : <Volume2 size={20} />}
              {reading === poem.title ? "暂停朗读" : "听一听"}
            </button>
          </article>
        ))}
      </div>
      {!speechAvailable && <p className="notice">这个浏览器暂时不能朗读，和家人一起读也很棒。</p>}
    </section>
  );
}
