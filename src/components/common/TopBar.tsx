import { Gift, LockKeyhole } from "lucide-react";

interface Props {
  stars: number;
  coins: number;
  chestReady: boolean;
  onHome: () => void;
  onChest: () => void;
  onParentTap: () => void;
}

export function TopBar({ stars, coins, chestReady, onHome, onChest, onParentTap }: Props) {
  return (
    <header className="island-header">
      <button className="brand" onClick={onHome} aria-label="返回学习小岛"><span>⭐</span><strong>我的学习小岛</strong></button>
      <div className="rewards" aria-label="我的奖励">
        <span>⭐ <b>{stars}</b></span><span>🪙 <b>{coins}</b></span>
        <button className={chestReady ? "chest-ready" : ""} onClick={onChest} aria-label="今日宝箱"><Gift /></button>
        <button className="parent-top-entry" onClick={onParentTap} aria-label="家长入口"><LockKeyhole /></button>
      </div>
    </header>
  );
}
