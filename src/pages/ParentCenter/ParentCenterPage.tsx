"use client";

import { useState } from "react";
import { ArrowLeft, BookOpen, CalendarDays, Clock, Download, RotateCcw, Settings, Sparkles, Upload } from "lucide-react";
import type { AppState, CoreSubject, DailyPlan, LearningSettings, Subject } from "@/src/models";
import { getWeakKnowledge } from "@/src/services/learning/mastery";
import { exportState, localDateKey } from "@/src/services/storage/StorageService";

const subjectNames: Record<Subject, string> = { pinyin: "拼音", math: "数学", hanzi: "汉字", english: "英语", poetry: "古诗" };

function displayKnowledge(id: string) {
  return id.replace("pinyin_", "").replace("quantity_", "数量").replace("number_", "数字").replace("hanzi_", "").replace("english_", "").replace("poetry_", "").replace("more_less", "多和少").replace("big_small", "大和小");
}

function recentDateKeys(days: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - index - 1));
    return localDateKey(date);
  });
}

interface ImportResult { ok: boolean; message: string }

interface Props {
  state: AppState;
  plan: DailyPlan;
  debug: boolean;
  onHome: () => void;
  onReset: () => void;
  onAddCoins: () => void;
  onSettings: (settings: LearningSettings) => void;
  onNickname: (nickname: string) => void;
  onImport: (file: File) => Promise<ImportResult>;
}

export function ParentCenterPage({ state, plan, debug, onHome, onReset, onAddCoins, onSettings, onNickname, onImport }: Props) {
  const [tab, setTab] = useState<Subject>("pinyin");
  const [backupMessage, setBackupMessage] = useState("");
  const todayRecords = state.records.filter((record) => record.date === plan.date);
  const seconds = todayRecords.reduce((sum, record) => sum + record.duration, 0);
  const learned = plan.tasks.map((task) => ({ subject: task.subject, items: task.knowledgePointIds.map(displayKnowledge) }));
  const weak = getWeakKnowledge(state, plan.date, undefined, 5);
  const week = recentDateKeys(7);
  const mastery = Object.values(state.mastery)
    .filter((item) => item.knowledgePointId.startsWith(tab === "math" ? "quantity_" : `${tab}_`) || (tab === "math" && (item.knowledgePointId.startsWith("number_") || ["more_less", "big_small"].includes(item.knowledgePointId))))
    .sort((a, b) => displayKnowledge(a.knowledgePointId).localeCompare(displayKnowledge(b.knowledgePointId), "zh-CN"));

  function changeSetting(next: Partial<LearningSettings>) {
    onSettings({ ...state.settings, ...next });
  }

  function toggleSubject(subject: CoreSubject) {
    const active = state.settings.enabledSubjects.includes(subject);
    const next = active ? state.settings.enabledSubjects.filter((item) => item !== subject) : [...state.settings.enabledSubjects, subject];
    if (!next.some((item) => ["pinyin", "math", "hanzi"].includes(item))) return;
    changeSetting({ enabledSubjects: next });
  }

  function toggleBonus(subject: "english" | "poetry") {
    const active = state.settings.enabledSubjects.includes(subject);
    changeSetting({ enabledSubjects: active ? state.settings.enabledSubjects.filter((item) => item !== subject) : [...state.settings.enabledSubjects, subject] });
  }

  async function pickBackup(file?: File) {
    if (!file) return;
    const result = await onImport(file);
    setBackupMessage(result.message);
  }

  return (
    <main className="parent-page">
      <div className="parent-wrap">
        <div className="parent-heading">
          <button onClick={onHome}><ArrowLeft />返回小岛</button>
          <div><span>仅家长可见</span><h1>家长中心</h1></div>
          <div className="backup-actions">
            <button onClick={() => exportState(state)}><Download />导出数据</button>
            <label><Upload />导入备份<input type="file" accept="application/json,.json" onChange={(event) => void pickBackup(event.target.files?.[0])} /></label>
          </div>
        </div>
        {backupMessage && <p className="backup-message" aria-live="polite">{backupMessage}</p>}

        <section className="parent-stats">
          <article><Clock /><span>今天学习</span><strong>{todayRecords.length ? Math.max(1, Math.round(seconds / 60)) : 0} 分钟</strong></article>
          <article><BookOpen /><span>今日完成</span><strong>{plan.tasks.filter((task) => task.completed).length} / {plan.tasks.length}</strong></article>
          <article><Sparkles /><span>累计奖励</span><strong>{state.rewards.stars} 星 · {state.rewards.coins} 币</strong></article>
        </section>

        <section className="parent-panel week-panel">
          <div className="panel-title"><div><CalendarDays /><h2>最近 7 天</h2></div><span>完成一天，点亮一颗星</span></div>
          <div className="week-strip">{week.map((date) => {
            const item = state.dailyPlans[date];
            return <div key={date} className={item?.dailyCompleted ? "complete" : date === plan.date ? "today" : ""}><span>{date.slice(5).replace("-", "/")}</span><strong>{item?.dailyCompleted ? "⭐" : item ? `${item.tasks.filter((task) => task.completed).length}/${item.tasks.length}` : "·"}</strong></div>;
          })}</div>
        </section>

        <div className="parent-columns">
          <section className="parent-panel"><h2>今天学了什么</h2><div className="learned-list">{learned.map((group) => <div key={group.subject}><strong>{subjectNames[group.subject]}</strong><span>{group.items.join("、")}</span></div>)}</div></section>
          <section className="parent-panel"><h2>需要多见面</h2>{weak.length ? <div className="weak-list">{weak.map((item) => <span key={item.knowledgePointId}>{displayKnowledge(item.knowledgePointId)}<small>等级 {item.masteryLevel}</small></span>)}</div> : <p className="empty-note">完成几次冒险后，这里会出现建议。</p>}</section>
        </div>

        <section className="parent-panel mastery-panel">
          <div className="mastery-tabs">{(["pinyin", "math", "hanzi", "english", "poetry"] as Subject[]).map((subject) => <button key={subject} className={tab === subject ? "active" : ""} onClick={() => setTab(subject)}>{subjectNames[subject]}</button>)}</div>
          <div className="mastery-list">{mastery.length ? mastery.map((item) => <div key={item.knowledgePointId}><span>{displayKnowledge(item.knowledgePointId)}</span><i>{[0,1,2,3].map((level) => <b key={level} className={level < item.masteryLevel ? "filled" : ""} />)}</i><small>{item.nextReviewAt ? `${item.nextReviewAt.slice(5).replace("-", "/")} 复习` : "初次认识"}</small></div>) : <p className="empty-note">还没有学习记录。</p>}</div>
        </section>

        <section className="parent-panel settings-panel">
          <div className="panel-title"><div><Settings /><h2>学习设置</h2></div><span>修改后从明天的计划开始生效</span></div>
          <div className="settings-grid">
            <label><span>孩子昵称</span><input value={state.profile.nickname} maxLength={12} onChange={(event) => onNickname(event.target.value)} /></label>
            <label><span>每日大约时间</span><select value={state.settings.dailyMinutes} onChange={(event) => changeSetting({ dailyMinutes: Number(event.target.value) })}><option value={20}>20 分钟</option><option value={30}>30 分钟</option><option value={40}>40 分钟</option></select></label>
          </div>
          <div className="subject-settings">
            {(["pinyin", "math", "hanzi"] as CoreSubject[]).map((subject) => <div key={subject}><label><input type="checkbox" checked={state.settings.enabledSubjects.includes(subject)} onChange={() => toggleSubject(subject)} /><strong>{subjectNames[subject]}</strong></label><select aria-label={`${subjectNames[subject]}每天新知识`} value={state.settings.newKnowledgePerDay[subject]} onChange={(event) => changeSetting({ newKnowledgePerDay: { ...state.settings.newKnowledgePerDay, [subject]: Number(event.target.value) } })}><option value={1}>每天 1 个新知识</option><option value={2}>每天 2 个新知识</option>{subject === "hanzi" && <option value={3}>每天 3 个新知识</option>}</select></div>)}
            {(["english", "poetry"] as const).map((subject) => <div key={subject}><label><input type="checkbox" checked={state.settings.enabledSubjects.includes(subject)} onChange={() => toggleBonus(subject)} /><strong>{subjectNames[subject]}彩蛋</strong></label><span className="bonus-setting-note">开启后无需完成主线即可进入</span></div>)}
          </div>
        </section>

        {debug && <section className="parent-panel debug-panel"><h2>开发模式</h2><div><button onClick={onAddCoins}>增加 100 金币</button><button onClick={onReset}><RotateCcw />重置全部数据</button></div></section>}
      </div>
    </main>
  );
}
