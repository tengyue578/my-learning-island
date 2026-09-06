import { ArrowLeft, LockKeyhole, Play, Trophy } from "lucide-react";
import { englishLessons } from "@/src/data/english/lessons";
import { hanziLessons } from "@/src/data/hanzi/lessons";
import { mathLessons } from "@/src/data/math/lessons";
import { pinyinLessons } from "@/src/data/pinyin/lessons";
import { poetryLessons } from "@/src/data/poetry/lessons";
import type { AppState, Subject } from "@/src/models";
import { isKnowledgeComplete, isKnowledgeUnlocked } from "@/src/services/learning/curriculum";

interface Props { subject: Subject; state: AppState; onHome: () => void; onQuest: (subject: Subject, id: string) => void }

export function ExplorePage({ subject, state, onHome, onQuest }: Props) {
  const config = subject === "pinyin"
    ? { title: "拼音乐园", emoji: "🎈", note: "先学单韵母，再认识声母", items: pinyinLessons.map((item) => ({ ...item, label: item.symbol, image: item.image })) }
    : subject === "math"
      ? { title: "数学王国", emoji: "🧱", note: "先理解数量，再认识数字和比较", items: mathLessons.map((item) => ({ ...item, label: item.title, image: item.image })) }
      : subject === "hanzi"
        ? { title: "汉字森林", emoji: "🌳", note: "从最常见的象形字一步步前进", items: hanziLessons.map((item) => ({ ...item, label: item.character, image: item.image })) }
        : subject === "english"
          ? { title: "英语小镇", emoji: "🌍", note: "先学身边的动物和水果，再学颜色与生活词", items: englishLessons.map((item) => ({ ...item, label: item.word, image: item.image })) }
          : { title: "古诗花园", emoji: "🌙", note: "从画面清楚、节奏简单的诗开始", items: poetryLessons.map((item) => ({ ...item, label: item.title, image: item.image })) };

  return <main className={`explore-page explore-${subject}`}>
    <div className="simple-page-nav"><button onClick={onHome}><ArrowLeft />返回小岛</button><strong>{config.emoji} {config.title}</strong></div>
    <section className="explore-card curriculum-card">
      <div className="explore-heading"><span>从简单到困难 · 一站一站解锁</span><h1>{config.note}</h1></div>
      <div className="curriculum-legend"><span><i className="open" />可以挑战</span><span><i className="done" />已经掌握</span><span><i />完成上一站后解锁</span></div>
      <div className="curriculum-road">{config.items.map((item, index) => {
        const unlocked = isKnowledgeUnlocked(state, item);
        const complete = isKnowledgeComplete(state, item.id);
        const completedLevels = state.questProgress[item.id]?.completedLevels.length ?? (complete ? 5 : 0);
        return <article key={item.id} className={`${unlocked ? "unlocked" : "locked"} ${complete ? "complete" : ""}`}>
          <div className="road-line" />
          <span className="road-number">{index + 1}</span>
          <button disabled={!unlocked} onClick={() => onQuest(subject, item.id)} aria-label={unlocked ? `${item.label}，开始五关挑战` : `${item.label}，尚未解锁`}>
            <span className="road-image">{item.image}</span><strong>{item.label}</strong>
            <div className="five-levels" aria-label={`已完成${completedLevels}关`}>{[1,2,3,4,5].map((level) => <i key={level} className={level <= completedLevels ? "done" : level === completedLevels + 1 && unlocked ? "current" : ""} />)}</div>
            <small>{complete ? <><Trophy />5 关完成</> : unlocked ? <><Play />从第 {Math.min(5, completedLevels + 1)} 关开始</> : <><LockKeyhole />先完成上一站</>}</small>
          </button>
        </article>;
      })}</div>
    </section>
  </main>;
}
