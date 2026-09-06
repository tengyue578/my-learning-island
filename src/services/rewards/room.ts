import { findFurniture } from "@/src/data/room/furniture";
import type { AppState } from "@/src/models";

export type RoomActionResult = { state: AppState; message: string; ok: boolean };

export function buyFurniture(state: AppState, itemId: string): RoomActionResult {
  const item = findFurniture(itemId);
  if (!item) return { state, message: "没有找到这件家具。", ok: false };
  if (state.room.unlockedItems.includes(itemId)) return equipFurniture(state, itemId);
  if (state.rewards.coins < item.price) return { state, message: "再收集一些金币吧！", ok: false };
  return {
    state: {
      ...state,
      rewards: { ...state.rewards, coins: state.rewards.coins - item.price },
      room: {
        unlockedItems: [...state.room.unlockedItems, item.id],
        equippedItems: { ...state.room.equippedItems, [item.slot]: item.id },
      },
    },
    message: `${item.name}放好啦！`,
    ok: true,
  };
}

export function equipFurniture(state: AppState, itemId: string): RoomActionResult {
  const item = findFurniture(itemId);
  if (!item || !state.room.unlockedItems.includes(itemId)) return { state, message: "先把它带回家吧！", ok: false };
  return {
    state: { ...state, room: { ...state.room, equippedItems: { ...state.room.equippedItems, [item.slot]: item.id } } },
    message: `${item.name}换好啦！`,
    ok: true,
  };
}
