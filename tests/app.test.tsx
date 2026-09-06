import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import Home from "@/app/page";
import { ensureTodayPlan } from "@/src/services/dailyPlan/dailyPlan";
import { createInitialState, STORAGE_KEY } from "@/src/services/storage/StorageService";

describe("我的学习小岛", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  it("显示学习地图与今日冒险入口", () => {
    render(<Home />);
    expect(screen.getByRole("region", { name: "学习小岛地图" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /开始今天的冒险/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /拼音乐园/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /数学王国/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /汉字森林/ })).toBeInTheDocument();
  });

  it("点击今日冒险进入拼音学习", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(screen.getByRole("button", { name: /开始今天的冒险/ }));
    expect(await screen.findByRole("heading", { name: "a" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /我认识啦/ })).toBeInTheDocument();
  });

  it("从本地恢复奖励并打开自由探索", async () => {
    const stored = ensureTodayPlan({ ...createInitialState(), rewards: { stars: 12, coins: 35 } });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    const user = userEvent.setup();
    render(<Home />);
    await waitFor(() => expect(screen.getByLabelText("我的奖励")).toHaveTextContent("12"));
    await user.click(screen.getByRole("button", { name: /拼音乐园/ }));
    expect(await screen.findByRole("heading", { name: "先学单韵母，再认识声母" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /a，开始五关挑战/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /o，尚未解锁/ })).toBeDisabled();
  });

  it("开启后可完成英语知识点的五关挑战", async () => {
    const stored = ensureTodayPlan({ ...createInitialState(), settings: { ...createInitialState().settings, enabledSubjects: ["pinyin", "math", "hanzi", "english"] } });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    const user = userEvent.setup();
    render(<Home />);
    await user.click(await screen.findByRole("button", { name: /英语小镇/ }));
    await user.click(await screen.findByRole("button", { name: /apple，开始五关挑战/ }));
    expect(await screen.findByText("5 关挑战")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "apple" }));
    await user.click(screen.getByRole("button", { name: "apple" }));
    await user.click(await screen.findByRole("button", { name: "先跳过" }));
    await user.click(screen.getByRole("button", { name: "a" }));
    await user.click(screen.getByRole("button", { name: /🍎.*apple/ }));
    expect(await screen.findByRole("heading", { name: "apple闯关成功！" })).toBeInTheDocument();
  });

  it("点击小星星进入本地互动伙伴", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(screen.getByRole("button", { name: "和小星星聊聊" }));
    expect(await screen.findByRole("heading", { name: /今天的心情/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "晴天" }));
    expect(screen.getByText(/暖洋洋/)).toBeInTheDocument();
  });

  it("今日冒险按五个不同关卡学完拼音后才进入数学", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(screen.getByRole("button", { name: /开始今天的冒险/ }));

    const advanceAfter = async (name: string | RegExp) => {
      await user.click(screen.getByRole("button", { name }));
      await act(async () => { await new Promise((resolve) => window.setTimeout(resolve, 720)); });
    };

    await user.click(await screen.findByRole("button", { name: /我认识啦/ }));
    await advanceAfter("a");
    await advanceAfter("a");
    await advanceAfter("a");
    await advanceAfter(/👩.*阿姨/);
    await advanceAfter("a");
    expect(await screen.findByRole("heading", { name: "1" })).toBeInTheDocument();
    expect(screen.getByText("1 个好朋友")).toBeInTheDocument();
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as { records?: unknown[] };
      expect(saved.records?.length).toBe(5);
    });
  }, 12_000);
});
