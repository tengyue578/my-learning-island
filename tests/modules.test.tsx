import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LetterLand } from "@/components/LetterLand";
import { PoemGarden } from "@/components/PoemGarden";
import { NumberKingdom } from "@/components/NumberKingdom";
import { LogicChallenge } from "@/components/LogicChallenge";
import { Adventure } from "@/components/Adventure";

describe("学习模块", () => {
  it("字母乐园展示 26 个可朗读字母并可进入配对游戏", async () => {
    const user = userEvent.setup();
    render(<LetterLand onActivity={vi.fn()} />);
    expect(screen.getAllByRole("button", { name: /朗读字母/ })).toHaveLength(26);
    await user.click(screen.getByRole("button", { name: "开始配对" }));
    expect(screen.getByText("先选一个大写字母")).toBeInTheDocument();
  });

  it("古诗花园展示 8 首带拼音的古诗", () => {
    render(<PoemGarden onActivity={vi.fn()} />);
    expect(screen.getAllByTestId("poem-card")).toHaveLength(8);
    expect(screen.getByText("chuáng qián míng yuè guāng")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /朗读《/ })).toHaveLength(8);
  });

  it("数字王国展示 0 到 20，并提供算术和数数入口", () => {
    render(<NumberKingdom onActivity={vi.fn()} />);
    expect(screen.getAllByRole("button", { name: /朗读数字/ })).toHaveLength(21);
    expect(screen.getByRole("button", { name: "加减练习" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "数一数" })).toBeInTheDocument();
  });

  it("逻辑题每题提供 3 到 4 个选项", () => {
    render(<LogicChallenge onActivity={vi.fn()} />);
    const options = screen.getAllByTestId("logic-option");
    expect(options.length).toBeGreaterThanOrEqual(3);
    expect(options.length).toBeLessThanOrEqual(4);
  });

  it("闯关冒险展示 10 个关卡并锁住未到达的关卡", () => {
    render(
      <Adventure
        currentLevel={1}
        completedLevels={[]}
        onLevelComplete={vi.fn()}
      />,
    );
    expect(screen.getAllByTestId("adventure-level")).toHaveLength(10);
    expect(screen.getByRole("button", { name: "第 2 关，未解锁" })).toBeDisabled();
  });
});
