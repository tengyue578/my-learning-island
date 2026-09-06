import type { FurnitureItem } from "@/src/models";

export const furnitureItems: FurnitureItem[] = [
  { id: "bed-basic", name: "云朵小床", emoji: "🛏️", price: 0, slot: "bed", description: "软软的小床" },
  { id: "desk-basic", name: "木头书桌", emoji: "📚", price: 0, slot: "desk", description: "放着喜欢的书" },
  { id: "rug-stars", name: "星星地毯", emoji: "⭐", price: 45, slot: "floor", description: "踩上去亮晶晶" },
  { id: "rug-rainbow", name: "彩虹地毯", emoji: "🌈", price: 70, slot: "floor", description: "房间里有彩虹" },
  { id: "plant-green", name: "小绿植", emoji: "🪴", price: 35, slot: "corner", description: "每天绿油油" },
  { id: "aquarium", name: "小鱼缸", emoji: "🐠", price: 95, slot: "corner", description: "小鱼游呀游" },
  { id: "cat-friend", name: "小猫伙伴", emoji: "🐈", price: 120, slot: "pet", description: "喵！一起玩" },
  { id: "dog-friend", name: "小狗伙伴", emoji: "🐕", price: 120, slot: "pet", description: "摇摇小尾巴" },
  { id: "dino-poster", name: "恐龙贴纸", emoji: "🦕", price: 65, slot: "wall", description: "勇敢的小恐龙" },
  { id: "night-light", name: "星空灯", emoji: "🌟", price: 80, slot: "wall", description: "晚上也闪亮" },
];

export function findFurniture(id: string) {
  return furnitureItems.find((item) => item.id === id);
}
