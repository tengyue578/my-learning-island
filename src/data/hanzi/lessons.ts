import type { HanziLesson } from "@/src/models";

const rows = [
  ["山", "shān", "高高的山", "⛰️"], ["水", "shuǐ", "清清的水", "💧"], ["火", "huǒ", "暖暖的火", "🔥"],
  ["日", "rì", "天上的太阳", "☀️"], ["月", "yuè", "夜晚的月亮", "🌙"], ["大", "dà", "很大", "🐘"],
  ["小", "xiǎo", "很小", "🐜"], ["上", "shàng", "在上面", "⬆️"], ["下", "xià", "在下面", "⬇️"],
  ["人", "rén", "一个人", "🧍"], ["口", "kǒu", "小嘴巴", "👄"], ["手", "shǒu", "小小手", "✋"],
  ["天", "tiān", "蓝蓝的天", "🌤️"], ["云", "yún", "白白的云", "☁️"], ["雨", "yǔ", "下雨啦", "🌧️"],
  ["爸", "bà", "爸爸", "👨"], ["妈", "mā", "妈妈", "👩"], ["我", "wǒ", "我自己", "🙋"],
  ["家", "jiā", "我的家", "🏠"], ["门", "mén", "一扇门", "🚪"],
] as const;

export const hanziLessons: HanziLesson[] = rows.map(([character, pronunciation, meaning, image], index) => ({
  id: `hanzi_${character}`,
  subject: "hanzi",
  type: "basic_character",
  title: character,
  character,
  pronunciation,
  meaning,
  category: "启蒙汉字",
  image,
  examples: [meaning],
  difficulty: index < 7 ? 1 : 2,
  order: index + 1,
  prerequisites: index ? [`hanzi_${rows[index - 1][0]}`] : [],
}));
