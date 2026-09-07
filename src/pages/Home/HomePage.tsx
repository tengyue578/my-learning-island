import { Gift, Volume2 } from "lucide-react";
import type { CoreSubject, DailyPlan, Subject } from "@/src/models";

const places = [
  { id: "pinyin", emoji: "🎈", title: "拼音乐园", className: "place-pinyin", enabled: true },
  { id: "math", emoji: "🧱", title: "数学王国", className: "place-math", enabled: true },
  { id: "hanzi", emoji: "🌳", title: "汉字森林", className: "place-hanzi", enabled: true },
  { id: "english", emoji: "🌍", title: "英语小镇", className: "place-english", enabled: true },
  { id: "poetry", emoji: "🌙", title: "古诗花园", className: "place-poetry", enabled: true },
  { id: "room", emoji: "🏠", title: "我的房间", className: "place-room", enabled: true },
] as const;

interface Props {
  plan: DailyPlan;
  message: string;
  enabledSubjects: Subject[];
  onSpeak: (text: string, lang?: string) => void;
  onAdventure: () => void;
  onExplore: (subject: CoreSubject) => void;
  onBonus: (subject: "english" | "poetry") => void;
  onCompanion: () => void;
  onRoom: () => void;
  onChest: () => void;
}

export function HomePage({ plan, message, enabledSubjects, onSpeak, onAdventure, onExplore, onBonus, onCompanion, onRoom, onChest }: Props) {
  const completed = plan.tasks.filter((task) => task.completed).length;
  const adventureText = plan.dailyCompleted ? "今天的冒险完成啦！" : completed ? "继续今天的冒险" : "开始今天的冒险";

  function openPlace(id: typeof places[number]["id"], enabled: boolean, title: string) {
    if (id === "room") return onRoom();
    if (enabled && (id === "pinyin" || id === "math" || id === "hanzi")) return onExplore(id);
    if ((id === "english" || id === "poetry") && (plan.dailyCompleted || enabledSubjects.includes(id))) return onBonus(id);
    onSpeak(`${title}正在准备惊喜！`);
  }

  return (
    <main className="home-page">
      <section className="island-stage" aria-label="学习小岛地图">
        {/* The generated map is decorative product artwork, not content fetched from a remote image host. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="./assets/images/learning-island-hero.png" alt="漂浮在云朵上的学习小岛" />
        <div className="map-shade" />
        <div className="companion-card">
          <button className="companion" onClick={onCompanion} aria-label="和小星星聊聊">⭐</button>
          <div><span>小星星</span><strong>{message}</strong></div>
          <button className="speak-button" onClick={() => onSpeak(message)} aria-label="播放提示"><Volume2 /></button>
        </div>
        {places.map((place) => {
          const lockedBonus = (place.id === "english" || place.id === "poetry") && !plan.dailyCompleted && !enabledSubjects.includes(place.id);
          return <button key={place.id} className={`map-place ${place.className} ${lockedBonus ? "locked" : ""}`} onClick={() => openPlace(place.id, place.enabled, place.title)}>
            <span>{place.emoji}</span><strong>{place.title}</strong>{(place.id === "english" || place.id === "poetry") && <small>{lockedBonus ? "完成主线解锁" : "彩蛋"}</small>}
          </button>;
        })}
        <button className="adventure-button" onClick={plan.dailyCompleted && !plan.chestClaimed ? onChest : onAdventure}>
          <span>{plan.dailyCompleted && !plan.chestClaimed ? "🎁" : "🚀"}</span>
          <strong>{plan.dailyCompleted && !plan.chestClaimed ? "打开今日超级宝箱" : adventureText}</strong>
          <small>{plan.dailyCompleted ? "自由玩一玩吧" : `${completed} / ${plan.tasks.length} 个冒险`}</small>
        </button>
        {plan.dailyCompleted && !plan.chestClaimed && <button className="floating-chest" onClick={onChest} aria-label="打开今日超级宝箱"><Gift /></button>}
      </section>
    </main>
  );
}
