"use client";

import { useEffect, useState } from "react";
import { BookOpenText, Brain, ChevronRight, Crown, House, Languages, Medal, Rocket, Sparkles, Star, Trophy } from "lucide-react";
import { LetterLand } from "@/components/LetterLand";
import { PoemGarden } from "@/components/PoemGarden";
import { NumberKingdom } from "@/components/NumberKingdom";
import { LogicChallenge } from "@/components/LogicChallenge";
import { Adventure } from "@/components/Adventure";
import { AchievementWall } from "@/components/AchievementWall";
import { deriveBadges } from "@/lib/learning";
import { DEFAULT_PROGRESS, type ActivityKey, type LearningProgress, loadProgress, saveProgress } from "@/lib/storage";

type View = "home" | ActivityKey;

const NAV_ITEMS = [
  { id: "letters" as const, label: "字母乐园", short: "字母", icon: Languages, description: "ABC 发音与配对", tone: 0 },
  { id: "poems" as const, label: "古诗花园", short: "古诗", icon: BookOpenText, description: "8 首古诗跟读", tone: 1 },
  { id: "numbers" as const, label: "数字王国", short: "数字", icon: Crown, description: "认数字与算一算", tone: 2 },
  { id: "logic" as const, label: "逻辑挑战", short: "逻辑", icon: Brain, description: "规律图形和排序", tone: 3 },
  { id: "adventure" as const, label: "闯关冒险", short: "闯关", icon: Rocket, description: "综合挑战收星星", tone: 4 },
];

function initialProgress() {
  return typeof window === "undefined" ? DEFAULT_PROGRESS : loadProgress(window.localStorage);
}

export function AppShell() {
  const [view, setView] = useState<View>("home");
  const [progress, setProgress] = useState<LearningProgress>(initialProgress);

  useEffect(() => { saveProgress(progress, window.localStorage); }, [progress]);

  function openView(nextView: View) {
    setView(nextView);
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  function recordActivity(key: ActivityKey) {
    setProgress((current) => ({
      ...current,
      activityCounts: { ...current.activityCounts, [key]: current.activityCounts[key] + 1 },
    }));
  }

  function completeLevel(level: number, reward: number) {
    setProgress((current) => {
      const completedLevels = current.completedLevels.includes(level)
        ? current.completedLevels
        : [...current.completedLevels, level].sort((a, b) => a - b);
      const stars = current.stars + reward;
      return {
        ...current,
        stars,
        adventureLevel: Math.min(10, Math.max(current.adventureLevel, level + 1)),
        completedLevels,
        badges: deriveBadges(stars, completedLevels),
        activityCounts: { ...current.activityCounts, adventure: current.activityCounts.adventure + 1 },
      };
    });
  }

  return (
    <div className="app-shell">
      <aside className="desktop-sidebar">
        <button className="brand-button" onClick={() => openView("home")} aria-label="返回宝贝学习乐园首页">
          <span className="brand-mark"><Sparkles size={24} /></span>
          <span><strong>宝贝学习乐园</strong><small>每天进步一点点</small></span>
        </button>
        <nav aria-label="电脑端学习导航">
          <button className={`nav-item home ${view === "home" ? "active" : ""}`} onClick={() => openView("home")}>
            <House size={22} /><span>乐园首页</span>
          </button>
          <p className="nav-section-label">学习地图</p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={`nav-item candy-${item.tone} ${view === item.id ? "active" : ""}`} aria-label={`进入${item.label}`} onClick={() => openView(item.id)}>
                <span className="nav-icon"><Icon size={22} /></span>
                <span><strong>{item.label}</strong><small>{item.description}</small></span>
                <ChevronRight className="nav-chevron" size={18} />
              </button>
            );
          })}
        </nav>
        <div className="sidebar-reward">
          <div><Trophy size={28} /><span>冒险进度</span></div>
          <strong>{progress.completedLevels.length}<small>/10 关</small></strong>
          <div className="progress-track"><i style={{ width: `${progress.completedLevels.length * 10}%` }} /></div>
        </div>
      </aside>

      <div className="app-main">
        <header className="mobile-header">
          <button onClick={() => openView("home")} aria-label="返回乐园首页"><span className="brand-mark"><Sparkles size={20} /></span><strong>宝贝学习乐园</strong></button>
          <div className="star-counter" aria-label="手机端累计星星"><Star size={19} fill="currentColor" /><strong>{progress.stars}</strong></div>
        </header>
        <div className="top-reward-bar">
          <div className="welcome-chip"><span className="sun-dot" />嗨，小小探险家！</div>
          <div className="star-counter large" aria-label="累计星星"><Star size={22} fill="currentColor" /><strong>{progress.stars}</strong><span>颗星星</span></div>
        </div>
        <main id="main-content">
          {view === "home" && <HomeView progress={progress} onOpen={openView} />}
          {view === "letters" && <LetterLand onActivity={() => recordActivity("letters")} />}
          {view === "poems" && <PoemGarden onActivity={() => recordActivity("poems")} />}
          {view === "numbers" && <NumberKingdom onActivity={() => recordActivity("numbers")} />}
          {view === "logic" && <LogicChallenge onActivity={() => recordActivity("logic")} />}
          {view === "adventure" && <Adventure currentLevel={progress.adventureLevel} completedLevels={progress.completedLevels} onLevelComplete={completeLevel} />}
        </main>
      </div>

      <nav className="mobile-bottom-nav" aria-label="手机端学习导航">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return <button key={item.id} className={view === item.id ? "active" : ""} aria-label={`进入${item.label}`} onClick={() => openView(item.id)}><span className={`candy-${item.tone}`}><Icon size={22} /></span><small>{item.short}</small></button>;
        })}
      </nav>
    </div>
  );
}

function HomeView({ progress, onOpen }: { progress: LearningProgress; onOpen: (view: View) => void }) {
  const nextBadge = progress.stars < 5 ? 5 : progress.stars < 15 ? 15 : progress.stars < 30 ? 30 : null;
  return (
    <div className="home-view">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="hero-kicker"><Medal size={18} />今天也要闪闪发光</span>
          <h1>今天想玩什么？</h1>
          <p>选一个喜欢的小世界，动动脑、开口读、勇敢闯关！</p>
          <button className="hero-cta" onClick={() => onOpen("adventure")}><Rocket size={22} />继续第 {progress.adventureLevel} 关<ChevronRight size={20} /></button>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit-core"><Star size={46} fill="currentColor" /><span>{progress.stars}</span><small>颗星星</small></div>
          <i className="orbit-item one">A</i><i className="orbit-item two">3</i><i className="orbit-item three">诗</i>
        </div>
      </section>

      <section className="learning-section" aria-labelledby="learning-heading">
        <div className="section-title-row"><div><span className="eyebrow">五个快乐小世界</span><h2 id="learning-heading">开始今天的学习</h2></div><span className="mini-progress">已完成 {Object.values(progress.activityCounts).reduce((sum, count) => sum + count, 0)} 次活动</span></div>
        <div className="module-card-grid">
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const labels = ["听发音 · 玩配对", "看拼音 · 跟着读", "认数字 · 算一算", "找规律 · 排顺序", "答题 · 收星星"];
            return (
              <article className={`module-card candy-${item.tone}`} key={item.id}>
                <div className="module-card-top"><span><Icon size={28} /></span><b>0{index + 1}</b></div>
                <h3>{item.label}</h3><p>{labels[index]}</p>
                <div className="module-card-footer"><small>{progress.activityCounts[item.id]} 次练习</small><button aria-label={`进入${item.label}`} onClick={() => onOpen(item.id)}><ChevronRight size={22} /></button></div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="progress-banner">
        <div className="progress-badge"><Trophy size={32} /></div>
        <div><span className="eyebrow">我的成长</span><h2>{nextBadge ? `再得 ${nextBadge - progress.stars} 颗星，解锁新徽章` : "徽章墙已经全部点亮"}</h2></div>
        <div className="banner-stars"><Star size={22} fill="currentColor" /><strong>{progress.stars}</strong></div>
      </section>
      <AchievementWall unlocked={progress.badges} />
    </div>
  );
}
