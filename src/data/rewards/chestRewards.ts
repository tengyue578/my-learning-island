import type { ChestRewardType } from "@/src/models";

export interface ChestRewardConfig {
  type: ChestRewardType;
  itemId?: string;
  amount?: number;
  weight: number;
  label: string;
  emoji: string;
}

export const chestRewards: ChestRewardConfig[] = [
  { type: "coin", amount: 30, weight: 38, label: "30 枚金币", emoji: "🪙" },
  { type: "coin", amount: 50, weight: 18, label: "50 枚金币", emoji: "💰" },
  { type: "furniture", itemId: "plant-green", weight: 14, label: "小绿植", emoji: "🪴" },
  { type: "furniture", itemId: "rug-stars", weight: 12, label: "星星地毯", emoji: "⭐" },
  { type: "furniture", itemId: "aquarium", weight: 6, label: "小鱼缸", emoji: "🐠" },
  { type: "sticker", itemId: "dino-poster", weight: 12, label: "恐龙贴纸", emoji: "🦕" },
];
