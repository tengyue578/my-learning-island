import type { EnglishLesson } from "@/src/models";

const rows = [["apple", "🍎"], ["banana", "🍌"], ["cat", "🐱"], ["dog", "🐶"], ["bird", "🐦"], ["fish", "🐟"], ["red", "🔴"], ["blue", "🔵"], ["yellow", "🟡"], ["one", "1️⃣"], ["two", "2️⃣"], ["three", "3️⃣"], ["mom", "👩"], ["dad", "👨"], ["hello", "👋"], ["bye", "🙋"], ["sun", "☀️"], ["moon", "🌙"], ["car", "🚗"], ["ball", "⚽"]] as const;

export const englishLessons: EnglishLesson[] = rows.map(([word, image], index) => ({
  id: `english_${word}`, subject: "english", type: "word", title: word, word, image,
  difficulty: index < 6 ? 1 : 2, order: index + 1,
  prerequisites: index ? [`english_${rows[index - 1][0]}`] : [],
}));
