import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";
import { PROGRESS_KEY } from "@/lib/storage";

describe("宝贝学习乐园页面", () => {
  it("显示五个模块导航与欢迎首页", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: "今天想玩什么？" })).toBeInTheDocument();
    expect(screen.getAllByText("字母乐园").length).toBeGreaterThan(0);
    expect(screen.getAllByText("古诗花园").length).toBeGreaterThan(0);
    expect(screen.getAllByText("数字王国").length).toBeGreaterThan(0);
    expect(screen.getAllByText("逻辑挑战").length).toBeGreaterThan(0);
    expect(screen.getAllByText("闯关冒险").length).toBeGreaterThan(0);
  });

  it("恢复本地星星并可切换到字母乐园", async () => {
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({ stars: 12, adventureLevel: 1, completedLevels: [], badges: [] }),
    );
    const user = userEvent.setup();
    render(<Home />);
    expect(screen.getByLabelText("累计星星")).toHaveTextContent("12");
    await user.click(screen.getAllByRole("button", { name: "进入字母乐园" })[0]);
    expect(screen.getByRole("heading", { name: "字母乐园" })).toBeInTheDocument();
  });
});
