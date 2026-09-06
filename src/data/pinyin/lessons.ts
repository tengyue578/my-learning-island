import type { PinyinLesson } from "@/src/models";

const symbols = ["a", "o", "e", "i", "u", "ü", "b", "p", "m", "f"] as const;
const images = ["阿姨 👩", "公鸡 🐓", "白鹅 🪿", "衣服 👕", "乌鸦 🐦", "小鱼 🐟", "菠萝 🍍", "山坡 ⛰️", "摸一摸 ✋", "大佛 🗿"];

export const pinyinLessons: PinyinLesson[] = symbols.map((symbol, index) => ({
  id: `pinyin_${symbol}`,
  subject: "pinyin",
  type: index < 6 ? "single_vowel" : "initial",
  title: symbol,
  symbol,
  displayName: symbol,
  exampleWords: [images[index]],
  image: images[index].split(" ").at(-1) ?? "🎈",
  difficulty: index < 3 ? 1 : 2,
  order: index + 1,
  prerequisites: index ? [`pinyin_${symbols[index - 1]}`] : [],
}));
