export type Subject = "pinyin" | "math" | "hanzi" | "english" | "poetry";

export type CoreSubject = "pinyin" | "math" | "hanzi";

export type GameType = "listenChoose" | "pictureChoose" | "balloonPop" | "quantityGame" | "repeatAfterMe";

export interface KnowledgePoint {
  id: string;
  subject: Subject;
  type: string;
  title: string;
  difficulty: number;
  order: number;
  prerequisites?: string[];
}

export interface PinyinLesson extends KnowledgePoint {
  subject: "pinyin";
  symbol: string;
  displayName: string;
  audio?: string;
  exampleWords: string[];
  image: string;
}

export interface MathLesson extends KnowledgePoint {
  subject: "math";
  value?: number;
  image: string;
  prompt: string;
}

export interface HanziLesson extends KnowledgePoint {
  subject: "hanzi";
  character: string;
  pronunciation: string;
  meaning: string;
  category: string;
  image: string;
  audio?: string;
  examples: string[];
}

export interface EnglishLesson extends KnowledgePoint {
  subject: "english";
  word: string;
  image: string;
}

export interface PoetryLesson extends KnowledgePoint {
  subject: "poetry";
  author: string;
  lines: string[];
  image: string;
}

export interface GameOption {
  id: string;
  label: string;
  image?: string;
  value: string;
}

export interface GameQuestion {
  id: string;
  subject: Subject;
  gameType: GameType;
  promptText: string;
  speechText: string;
  target: string;
  targetImage?: string;
  options: GameOption[];
  knowledgePointId: string;
  quantity?: number;
  sceneEmoji?: string;
  questLevel?: 1 | 2 | 3 | 4 | 5;
}

export interface LearningRecord {
  id: string;
  knowledgePointId: string;
  subject: Subject;
  date: string;
  gameType: GameType;
  correct: boolean;
  attempts: number;
  duration: number;
  starsEarned: number;
  questLevel?: 1 | 2 | 3 | 4 | 5;
}

export interface KnowledgeQuestProgress {
  knowledgePointId: string;
  unlockedLevel: 1 | 2 | 3 | 4 | 5;
  completedLevels: number[];
  bestStars: Record<number, number>;
}

export interface MasteryRecord {
  knowledgePointId: string;
  firstLearnedAt?: string;
  lastReviewedAt?: string;
  totalAttempts: number;
  correctAttempts: number;
  consecutiveCorrect: number;
  masteryLevel: 0 | 1 | 2 | 3 | 4;
  reviewIntervalDays: number;
  nextReviewAt?: string;
  lastResultCorrect?: boolean;
}

export interface DailyTask {
  subject: CoreSubject;
  knowledgePointIds: string[];
  newKnowledgePointIds: string[];
  reviewKnowledgePointIds: string[];
  completed: boolean;
  stepIndex: number;
  rewardClaimed: boolean;
}

export interface DailyPlan {
  date: string;
  dayNumber: number;
  tasks: DailyTask[];
  activeTaskIndex: number;
  dailyCompleted: boolean;
  chestClaimed: boolean;
  chestReward?: ChestRewardResult;
}

export type ChestRewardType = "coin" | "furniture" | "sticker";

export interface ChestRewardResult {
  type: ChestRewardType;
  itemId?: string;
  amount?: number;
  label: string;
  emoji: string;
}

export type RoomSlot = "bed" | "desk" | "floor" | "corner" | "pet" | "wall";

export interface FurnitureItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  slot: RoomSlot;
  description: string;
}

export interface RoomState {
  unlockedItems: string[];
  equippedItems: Partial<Record<RoomSlot, string>>;
}

export interface LearningSettings {
  dailyMinutes: number;
  enabledSubjects: Subject[];
  newKnowledgePerDay: Record<CoreSubject, number>;
}

export interface AppState {
  version: 3;
  installDate: string;
  profile: { nickname: string; onboardingComplete: boolean };
  rewards: { stars: number; coins: number };
  records: LearningRecord[];
  mastery: Record<string, MasteryRecord>;
  questProgress: Record<string, KnowledgeQuestProgress>;
  dailyPlans: Record<string, DailyPlan>;
  room: RoomState;
  settings: LearningSettings;
}

export type ViewName = "home" | "adventure" | "parent" | "room" | "explore" | "quest" | "bonus" | "companion";
