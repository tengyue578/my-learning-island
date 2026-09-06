import { chestRewards, type ChestRewardConfig } from "@/src/data/rewards/chestRewards";
import { findFurniture } from "@/src/data/room/furniture";
import type { AppState, ChestRewardResult } from "@/src/models";

export function drawChestReward(random = Math.random): ChestRewardConfig {
  const total = chestRewards.reduce((sum, reward) => sum + reward.weight, 0);
  let ticket = random() * total;
  for (const reward of chestRewards) {
    ticket -= reward.weight;
    if (ticket < 0) return reward;
  }
  return chestRewards[0];
}

export function applyChestReward(state: AppState, reward: ChestRewardConfig) {
  const result: ChestRewardResult = { type: reward.type, itemId: reward.itemId, amount: reward.amount, label: reward.label, emoji: reward.emoji };
  if (reward.type === "coin") {
    return { state: { ...state, rewards: { ...state.rewards, coins: state.rewards.coins + (reward.amount ?? 0) } }, result };
  }
  if (!reward.itemId) return { state, result };
  if (state.room.unlockedItems.includes(reward.itemId)) {
    const duplicateCoins = 25;
    return {
      state: { ...state, rewards: { ...state.rewards, coins: state.rewards.coins + duplicateCoins } },
      result: { type: "coin" as const, amount: duplicateCoins, label: `已经有啦，变成 ${duplicateCoins} 金币`, emoji: "🪙" },
    };
  }
  const item = findFurniture(reward.itemId);
  return {
    state: {
      ...state,
      room: {
        ...state.room,
        unlockedItems: [...state.room.unlockedItems, reward.itemId],
        equippedItems: item ? { ...state.room.equippedItems, [item.slot]: item.id } : state.room.equippedItems,
      },
    },
    result,
  };
}
