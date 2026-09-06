import type { MathLesson } from "@/src/models";

export const mathLessons: MathLesson[] = [
  ...[1, 2, 3, 4, 5].map((value, index): MathLesson => ({
    id: `quantity_${value}`, subject: "math", type: "quantity", title: `数量${value}`,
    value, image: "🍎", prompt: "有几个苹果？", difficulty: 1, order: index + 1,
    prerequisites: index ? [`quantity_${value - 1}`] : [],
  })),
  ...[1, 2, 3, 4, 5].map((value, index): MathLesson => ({
    id: `number_${value}`, subject: "math", type: "number", title: `数字${value}`,
    value, image: "🧱", prompt: `找到数字${value}`, difficulty: 2, order: index + 6,
    prerequisites: value === 1 ? ["quantity_5"] : [`number_${value - 1}`],
  })),
  { id: "more_less", subject: "math", type: "compare", title: "多和少", image: "⚖️", prompt: "哪边更多？", difficulty: 2, order: 11, prerequisites: ["number_5"] },
  { id: "big_small", subject: "math", type: "compare", title: "大和小", image: "🐘", prompt: "哪个更大？", difficulty: 2, order: 12, prerequisites: ["more_less"] },
];
