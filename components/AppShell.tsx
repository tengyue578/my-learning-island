"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppState, CoreSubject, LearningRecord, LearningSettings, Subject, ViewName } from "@/src/models";
import { childMessages } from "@/src/data/messages/childMessages";
import { speechService } from "@/src/services/speech/SpeechService";
import { createInitialState, importStateFile, loadState, localDateKey, resetState, saveState } from "@/src/services/storage/StorageService";
import { ensureTodayPlan } from "@/src/services/dailyPlan/dailyPlan";
import { recordLearning } from "@/src/services/learning/mastery";
import { applyChestReward, drawChestReward } from "@/src/services/rewards/chest";
import { buyFurniture } from "@/src/services/rewards/room";
import { TopBar } from "@/src/components/common/TopBar";
import { HomePage } from "@/src/pages/Home/HomePage";
import { DailyAdventurePage } from "@/src/pages/DailyAdventure/DailyAdventurePage";
import { ExplorePage } from "@/src/pages/Explore/ExplorePage";
import { ParentCenterPage } from "@/src/pages/ParentCenter/ParentCenterPage";
import { RoomPage } from "@/src/pages/MyRoom/RoomPage";
import { BonusLearningPage } from "@/src/pages/BonusLearning/BonusLearningPage";
import { CompanionPage } from "@/src/pages/Companion/CompanionPage";
import { KnowledgeQuestPage } from "@/src/pages/KnowledgeQuest/KnowledgeQuestPage";

interface WebMcpContext {
  registerTool(tool: {
    name: string;
    title: string;
    description: string;
    inputSchema: Record<string, unknown>;
    annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
    execute(input: unknown): unknown;
  }, options?: { signal: AbortSignal }): void | Promise<void>;
}

type ModelDocument = Document & { modelContext?: WebMcpContext };

function initialState() {
  return ensureTodayPlan(createInitialState());
}

export function AppShell() {
  const [state, setState] = useState<AppState>(initialState);
  const [view, setView] = useState<ViewName>("home");
  const [exploreSubject, setExploreSubject] = useState<Subject>("pinyin");
  const [quest, setQuest] = useState<{ subject: Subject; id: string }>({ subject: "pinyin", id: "pinyin_a" });
  const [bonusSubject, setBonusSubject] = useState<"english" | "poetry">("english");
  const [message, setMessage] = useState<string>(childMessages.welcome);
  const [hydrated, setHydrated] = useState(false);
  const parentTapCount = useRef(0);
  const stateRef = useRef(state);
  const date = localDateKey();
  const debug = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "true";
  const plan = useMemo(() => state.dailyPlans[date], [state.dailyPlans, date]);

  useEffect(() => {
    const stored = ensureTodayPlan(loadState());
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setState(stored);
      stateRef.current = stored;
      setHydrated(true);
      const route = window.location.hash.slice(1) as ViewName;
      if (["home", "adventure", "parent", "room", "explore", "quest", "bonus", "companion"].includes(route)) setView(route);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    stateRef.current = state;
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  useEffect(() => {
    speechService.prepare();
  }, []);

  useEffect(() => {
    const onHash = () => {
      const route = window.location.hash.slice(1) as ViewName;
      if (["home", "adventure", "parent", "room", "explore", "quest", "bonus", "companion"].includes(route)) setView(route);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const context = (document as ModelDocument).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: "read_learning_progress",
      title: "读取学习进度",
      description: "读取今天的冒险完成情况和累计奖励，不修改数据。",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute() {
        const current = stateRef.current;
        const today = current.dailyPlans[localDateKey()];
        return { completedTasks: today?.tasks.filter((task) => task.completed).length ?? 0, dailyCompleted: today?.dailyCompleted ?? false, rewards: current.rewards };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    void Promise.resolve(context.registerTool({
      name: "start_daily_adventure",
      title: "开始今日冒险",
      description: "打开孩子今天尚未完成的学习冒险。",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute() {
        setView("adventure");
        window.location.hash = "adventure";
        return { opened: true };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  function navigate(next: ViewName) {
    setView(next);
    window.location.hash = next;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const speak = useCallback((text: string, lang?: string) => {
    setMessage(text);
    if (!speechService.speak(text, lang)) setMessage(childMessages.unsupportedSpeech);
  }, []);

  function openAdventure() {
    setState((current) => {
      const currentPlan = current.dailyPlans[date];
      if (!currentPlan || currentPlan.dailyCompleted) return current;
      const firstIncomplete = currentPlan.tasks.findIndex((task) => !task.completed);
      if (firstIncomplete < 0 || firstIncomplete === currentPlan.activeTaskIndex) return current;
      return { ...current, dailyPlans: { ...current.dailyPlans, [date]: { ...currentPlan, activeTaskIndex: firstIncomplete } } };
    });
    speak(plan?.dailyCompleted ? childMessages.allDone : childMessages.start);
    navigate("adventure");
  }

  function openExplore(subject: Subject) {
    setExploreSubject(subject);
    navigate("explore");
    const names: Record<Subject, string> = { pinyin: "拼音乐园", math: "数学王国", hanzi: "汉字森林", english: "英语小镇", poetry: "古诗花园" };
    speak(`欢迎来到${names[subject]}！`);
  }

  function openBonus(subject: "english" | "poetry") {
    setBonusSubject(subject);
    openExplore(subject);
  }

  function openQuest(subject: Subject, id: string) {
    setQuest({ subject, id });
    navigate("quest");
  }

  function updateStep(subject: CoreSubject, stepIndex: number) {
    setState((current) => {
      const currentPlan = current.dailyPlans[date];
      const tasks = currentPlan.tasks.map((task) => task.subject === subject ? { ...task, stepIndex } : task);
      return { ...current, dailyPlans: { ...current.dailyPlans, [date]: { ...currentPlan, tasks } } };
    });
  }

  function completeSubject(subject: CoreSubject) {
    setState((current) => {
      const currentPlan = current.dailyPlans[date];
      const taskIndex = currentPlan.tasks.findIndex((task) => task.subject === subject);
      const alreadyDone = currentPlan.tasks[taskIndex]?.completed;
      if (alreadyDone) return current;
      const tasks = currentPlan.tasks.map((task) => task.subject === subject ? { ...task, completed: true, rewardClaimed: true } : task);
      const allDone = tasks.every((task) => task.completed);
      const nextTask = Math.min(tasks.length - 1, taskIndex + 1);
      return {
        ...current,
        rewards: { ...current.rewards, coins: current.rewards.coins + 20 + (allDone ? 50 : 0) },
        dailyPlans: { ...current.dailyPlans, [date]: { ...currentPlan, tasks, activeTaskIndex: nextTask, dailyCompleted: allDone } },
      };
    });
    speak(subject === "hanzi" ? childMessages.allDone : childMessages.subjectDone);
  }

  function addRecord(record: LearningRecord) {
    setState((current) => recordLearning(current, record));
  }

  function claimChest() {
    const reward = drawChestReward();
    let rewardMessage = "宝箱打开啦！";
    setState((current) => {
      const currentPlan = current.dailyPlans[date];
      if (!currentPlan?.dailyCompleted || currentPlan.chestClaimed) return current;
      const awarded = applyChestReward(current, reward);
      rewardMessage = `宝箱打开啦！得到${awarded.result.label}！`;
      const awardedPlan = awarded.state.dailyPlans[date];
      return {
        ...awarded.state,
        dailyPlans: { ...awarded.state.dailyPlans, [date]: { ...awardedPlan, chestClaimed: true, chestReward: awarded.result } },
      };
    });
    queueMicrotask(() => speak(rewardMessage));
  }

  function handleRoomItem(itemId: string) {
    let resultMessage = "放好啦！";
    setState((current) => {
      const result = buyFurniture(current, itemId);
      resultMessage = result.message;
      return result.state;
    });
    queueMicrotask(() => speak(resultMessage));
  }

  function updateSettings(settings: LearningSettings) {
    setState((current) => ({ ...current, settings }));
  }

  async function importBackup(file: File) {
    try {
      const imported = ensureTodayPlan(await importStateFile(file));
      setState(imported);
      return { ok: true, message: "备份恢复成功，学习记录已经回来啦。" };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "备份恢复失败，请重新选择。" };
    }
  }

  function parentTap() {
    parentTapCount.current += 1;
    if (parentTapCount.current >= 5) {
      parentTapCount.current = 0;
      navigate("parent");
    }
  }

  function resetAll() {
    if (!window.confirm("确定清空全部学习数据吗？")) return;
    const fresh = ensureTodayPlan(resetState());
    setState(fresh);
    navigate("home");
  }

  if (!plan) return <div className="loading-island"><span>⭐</span><strong>小岛正在醒来…</strong></div>;

  return (
    <div className={`island-app ${hydrated ? "ready" : ""}`}>
      {view !== "parent" && <TopBar stars={state.rewards.stars} coins={state.rewards.coins} chestReady={plan.dailyCompleted && !plan.chestClaimed} onHome={() => navigate("home")} onChest={() => plan.dailyCompleted ? navigate("adventure") : speak("完成三个冒险，宝箱就会亮起来！")} onParentTap={parentTap} />}
      {view === "home" && <HomePage plan={plan} message={message} enabledSubjects={state.settings.enabledSubjects} onSpeak={speak} onAdventure={openAdventure} onExplore={openExplore} onBonus={openBonus} onCompanion={() => navigate("companion")} onRoom={() => navigate("room")} onChest={() => navigate("adventure")} />}
      {view === "adventure" && <DailyAdventurePage plan={plan} onHome={() => navigate("home")} onSpeak={speak} onStep={updateStep} onRecord={addRecord} onSubjectComplete={completeSubject} onClaimChest={claimChest} onRoom={() => navigate("room")} />}
      {view === "explore" && <ExplorePage subject={exploreSubject} state={state} onHome={() => navigate("home")} onQuest={openQuest} />}
      {view === "quest" && <KnowledgeQuestPage state={state} subject={quest.subject} knowledgePointId={quest.id} date={date} onBack={() => navigate("explore")} onSpeak={speak} onRecord={addRecord} />}
      {view === "room" && <RoomPage state={state} message={message} onHome={() => navigate("home")} onItem={handleRoomItem} />}
      {view === "bonus" && <BonusLearningPage subject={bonusSubject} date={date} onHome={() => navigate("home")} onSpeak={speak} onRecord={addRecord} />}
      {view === "companion" && <CompanionPage onHome={() => navigate("home")} onSpeak={speak} />}
      {view === "parent" && <ParentCenterPage state={state} plan={plan} debug={debug} onHome={() => navigate("home")} onReset={resetAll} onAddCoins={() => setState((current) => ({ ...current, rewards: { ...current.rewards, coins: current.rewards.coins + 100 } }))} onSettings={updateSettings} onNickname={(nickname) => setState((current) => ({ ...current, profile: { ...current.profile, nickname } }))} onImport={importBackup} />}
    </div>
  );
}
