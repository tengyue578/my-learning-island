export type MathOperator = "+" | "−";

export interface ChoiceQuestion {
  answer: number;
  options: number[];
}

export interface MathQuestion extends ChoiceQuestion {
  left: number;
  right: number;
  operator: MathOperator;
}

export interface CountingQuestion extends ChoiceQuestion {
  count: number;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  threshold?: number;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: "first-stars",
    name: "启程小星",
    description: "累计获得 5 颗星",
    threshold: 5,
  },
  {
    id: "learning-hero",
    name: "学习达人",
    description: "累计获得 15 颗星",
    threshold: 15,
  },
  {
    id: "shining-master",
    name: "闪亮高手",
    description: "累计获得 30 颗星",
    threshold: 30,
  },
  {
    id: "all-round-adventurer",
    name: "全能冒险家",
    description: "完成全部 10 个关卡",
  },
];

function randomInteger(min: number, max: number, random: () => number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

export function shuffleOptions<T>(items: T[], random = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function numberOptions(answer: number, min: number, max: number, random: () => number) {
  const candidates = Array.from({ length: max - min + 1 }, (_, index) => min + index)
    .filter((value) => value !== answer)
    .sort((a, b) => Math.abs(a - answer) - Math.abs(b - answer) || a - b);
  return shuffleOptions([answer, ...candidates.slice(0, 3)], random);
}

export function createMathQuestion(random = Math.random): MathQuestion {
  const operator: MathOperator = random() < 0.5 ? "+" : "−";
  let left: number;
  let right: number;
  let answer: number;

  if (operator === "+") {
    answer = randomInteger(0, 10, random);
    left = randomInteger(0, answer, random);
    right = answer - left;
  } else {
    left = randomInteger(0, 10, random);
    right = randomInteger(0, left, random);
    answer = left - right;
  }

  return {
    left,
    right,
    operator,
    answer,
    options: numberOptions(answer, 0, 10, random),
  };
}

export function createCountingQuestion(random = Math.random): CountingQuestion {
  const count = randomInteger(1, 10, random);
  return {
    count,
    answer: count,
    options: numberOptions(count, 1, 10, random),
  };
}

export function starsForAttempt(attempt: number): number {
  if (attempt <= 1) return 3;
  if (attempt === 2) return 2;
  return 1;
}

export function deriveBadges(stars: number, completedLevels: number[]): string[] {
  const badges = BADGES.filter((badge) =>
    badge.threshold ? stars >= badge.threshold : false,
  ).map((badge) => badge.id);

  const uniqueCompleted = new Set(completedLevels.filter((level) => level >= 1 && level <= 10));
  if (uniqueCompleted.size === 10) {
    badges.push("all-round-adventurer");
  }
  return badges;
}
