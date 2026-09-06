import { englishLessons } from "@/src/data/english/lessons";
import { hanziLessons } from "@/src/data/hanzi/lessons";
import { mathLessons } from "@/src/data/math/lessons";
import { pinyinLessons } from "@/src/data/pinyin/lessons";
import { poetryLessons } from "@/src/data/poetry/lessons";
import type { CoreSubject, EnglishLesson, GameOption, GameQuestion, HanziLesson, KnowledgePoint, MathLesson, PinyinLesson, PoetryLesson, Subject } from "@/src/models";

export interface LessonIntro { kind: "lesson"; id: string; knowledgePointId: string; subject: CoreSubject; eyebrow: string; title: string; image: string; speechText: string; note: string }
export interface GameStep { kind: "game"; id: string; question: GameQuestion }
export type AdventureStep = LessonIntro | GameStep;
export interface QuestQuestionLevel { kind: "question"; level: 1 | 2 | 3 | 4 | 5; title: string; emoji: string; question: GameQuestion }
export interface QuestRepeatLevel { kind: "repeat"; level: 1 | 2 | 3 | 4 | 5; title: string; emoji: string; text: string; lang: string }
export type QuestLevel = QuestQuestionLevel | QuestRepeatLevel;

function optionsFrom<T extends KnowledgePoint>(target: T, pool: T[], label: (item: T) => string, image: ((item: T) => string) | undefined, offset: number, count: number): GameOption[] {
  const others = pool.filter((item) => item.id !== target.id);
  const pivot = offset % Math.max(1, others.length);
  const rotated = [...others.slice(pivot), ...others.slice(0, pivot)];
  return [target, ...rotated.slice(0, count - 1)].map((item) => ({ id: `${item.id}-${offset}`, value: label(item), label: label(item), image: image?.(item) }));
}

function makeQuestion(subject: Subject, lessonId: string, level: 1 | 2 | 3 | 4 | 5, details: Omit<GameQuestion, "id" | "subject" | "knowledgePointId" | "questLevel">): GameQuestion {
  return { ...details, id: `${lessonId}-level-${level}`, subject, knowledgePointId: lessonId, questLevel: level };
}

function pinyinQuest(target: PinyinLesson): QuestLevel[] {
  const symbols = (level: number, count = 3) => optionsFrom(target, pinyinLessons, (item) => item.symbol, undefined, target.order + level, count);
  const words = optionsFrom(target, pinyinLessons, (item) => item.exampleWords[0].split(" ")[0], (item) => item.image, target.order + 4, 3);
  return [
    { kind: "question", level: 1, title: "听声找朋友", emoji: "👂", question: makeQuestion("pinyin", target.id, 1, { gameType: "listenChoose", promptText: "听一听，点出正确拼音", speechText: target.symbol, target: target.symbol, options: symbols(1, 2) }) },
    { kind: "question", level: 2, title: "看图认拼音", emoji: "🖼️", question: makeQuestion("pinyin", target.id, 2, { gameType: "pictureChoose", promptText: `${target.exampleWords[0]}和谁是朋友？`, speechText: `${target.exampleWords[0].split(" ")[0]}，${target.symbol}`, target: target.symbol, targetImage: target.image, options: symbols(2, 2) }) },
    { kind: "question", level: 3, title: "气球追踪", emoji: "🎈", question: makeQuestion("pinyin", target.id, 3, { gameType: "balloonPop", promptText: `捉住发“${target.symbol}”音的气球`, speechText: target.symbol, target: target.symbol, options: symbols(3) }) },
    { kind: "question", level: 4, title: "词语侦探", emoji: "🔎", question: makeQuestion("pinyin", target.id, 4, { gameType: "listenChoose", promptText: `哪个词里藏着“${target.symbol}”？`, speechText: `找一找，${target.exampleWords[0].split(" ")[0]}`, target: target.exampleWords[0].split(" ")[0], options: words }) },
    { kind: "question", level: 5, title: "拼音守门战", emoji: "🏰", question: makeQuestion("pinyin", target.id, 5, { gameType: "balloonPop", promptText: `最后一次找到“${target.symbol}”`, speechText: target.symbol, target: target.symbol, options: symbols(5) }) },
  ];
}

function numberOptions(value: number, level: number, count = 3): GameOption[] {
  const alternatives = [1, 2, 3, 4, 5].filter((item) => item !== value);
  const pivot = level % alternatives.length;
  const values = [value, ...alternatives.slice(pivot), ...alternatives.slice(0, pivot)];
  return values.slice(0, count).map((item) => ({ id: `number-${item}-${level}`, value: String(item), label: String(item) }));
}

function numericMathQuest(target: MathLesson): QuestLevel[] {
  const value = target.value ?? 1;
  const groupOptions = numberOptions(value, 3).map((item) => ({ ...item, label: "⭐".repeat(Number(item.value)), image: "🧺" }));
  const object = target.type === "quantity" ? "苹果" : "积木";
  return [
    { kind: "question", level: 1, title: "听数字", emoji: "👂", question: makeQuestion("math", target.id, 1, { gameType: "listenChoose", promptText: "听一听，是哪个数字？", speechText: String(value), target: String(value), options: numberOptions(value, 1, 2) }) },
    { kind: "question", level: 2, title: "数一数", emoji: target.image, question: makeQuestion("math", target.id, 2, { gameType: "quantityGame", promptText: `数一数，有几个${object}？`, speechText: `数一数，有几个${object}`, target: String(value), options: numberOptions(value, 2), quantity: value, sceneEmoji: target.image }) },
    { kind: "question", level: 3, title: "数量配对", emoji: "🧺", question: makeQuestion("math", target.id, 3, { gameType: "pictureChoose", promptText: `哪一篮正好有 ${value} 颗星？`, speechText: `哪一篮正好有${value}颗星`, target: String(value), options: groupOptions }) },
    { kind: "question", level: 4, title: "数字队伍", emoji: "🚂", question: makeQuestion("math", target.id, 4, { gameType: "listenChoose", promptText: `${Math.max(0, value - 1)}、__、${value + 1}，中间是谁？`, speechText: "数字队伍中间少了谁", target: String(value), options: numberOptions(value, 4) }) },
    { kind: "question", level: 5, title: "数字守门战", emoji: "🏰", question: makeQuestion("math", target.id, 5, { gameType: "balloonPop", promptText: `捉住数字 ${value}`, speechText: String(value), target: String(value), options: numberOptions(value, 5) }) },
  ];
}

function compareMathQuest(target: MathLesson): QuestLevel[] {
  const scenarios = target.id === "more_less" ? [
    { prompt: "哪边更多？", target: "4", options: [{ id: "two", value: "2", label: "⭐⭐" }, { id: "four", value: "4", label: "⭐⭐⭐⭐" }] },
    { prompt: "哪边更少？", target: "1", options: [{ id: "one", value: "1", label: "🍎" }, { id: "three", value: "3", label: "🍎🍎🍎" }] },
    { prompt: "很多星星应该选哪个词？", target: "多", options: [{ id: "many", value: "多", label: "多" }, { id: "few", value: "少", label: "少" }] },
    { prompt: "小鸟少的一边在哪里？", target: "2", options: [{ id: "birds2", value: "2", label: "🐦🐦" }, { id: "birds5", value: "5", label: "🐦🐦🐦🐦🐦" }] },
    { prompt: "终点挑战：哪边多？", target: "5", options: [{ id: "dots3", value: "3", label: "●●●" }, { id: "dots5", value: "5", label: "●●●●●" }] },
  ] : [
    { prompt: "哪个动物更大？", target: "大", options: [{ id: "elephant", value: "大", label: "大", image: "🐘" }, { id: "ant", value: "小", label: "小", image: "🐜" }] },
    { prompt: "哪个水果更小？", target: "小", options: [{ id: "melon", value: "大", label: "大", image: "🍉" }, { id: "berry", value: "小", label: "小", image: "🫐" }] },
    { prompt: "大房子应该选哪个词？", target: "大", options: [{ id: "big", value: "大", label: "大" }, { id: "small", value: "小", label: "小" }] },
    { prompt: "哪一辆车更小？", target: "小", options: [{ id: "bus", value: "大", label: "大巴", image: "🚌" }, { id: "car", value: "小", label: "小车", image: "🚗" }] },
    { prompt: "终点挑战：找到大的", target: "大", options: [{ id: "whale", value: "大", label: "鲸鱼", image: "🐋" }, { id: "fish", value: "小", label: "小鱼", image: "🐟" }] },
  ];
  return scenarios.map((scenario, index) => {
    const level = (index + 1) as 1 | 2 | 3 | 4 | 5;
    return { kind: "question" as const, level, title: ["看一看", "反过来想", "词语配对", "场景判断", "终点挑战"][index], emoji: ["👀", "🔄", "🧩", "🌳", "🏰"][index], question: makeQuestion("math", target.id, level, { gameType: index === 4 ? "balloonPop" : "pictureChoose", promptText: scenario.prompt, speechText: scenario.prompt, target: scenario.target, options: scenario.options }) };
  });
}

function hanziQuest(target: HanziLesson): QuestLevel[] {
  const chars = (level: number, count = 3) => optionsFrom(target, hanziLessons, (item) => item.character, undefined, target.order + level, count);
  return [
    { kind: "question", level: 1, title: "听音找字", emoji: "👂", question: makeQuestion("hanzi", target.id, 1, { gameType: "listenChoose", promptText: "听一听，找到这个字", speechText: target.character, target: target.character, options: chars(1, 2) }) },
    { kind: "question", level: 2, title: "看图认字", emoji: "🖼️", question: makeQuestion("hanzi", target.id, 2, { gameType: "pictureChoose", promptText: `${target.meaning}，是哪个字？`, speechText: target.meaning, target: target.character, targetImage: target.image, options: chars(2) }) },
    { kind: "question", level: 3, title: "读音配对", emoji: "🔊", question: makeQuestion("hanzi", target.id, 3, { gameType: "listenChoose", promptText: `“${target.character}”怎么读？`, speechText: `${target.character}，${target.pronunciation}`, target: target.pronunciation, options: optionsFrom(target, hanziLessons, (item) => item.pronunciation, undefined, target.order + 3, 3) }) },
    { kind: "question", level: 4, title: "意思侦探", emoji: "🔎", question: makeQuestion("hanzi", target.id, 4, { gameType: "pictureChoose", promptText: `“${target.character}”表示什么？`, speechText: `${target.character}表示什么`, target: target.meaning, options: optionsFrom(target, hanziLessons, (item) => item.meaning, (item) => item.image, target.order + 4, 3) }) },
    { kind: "question", level: 5, title: "汉字守门战", emoji: "🏰", question: makeQuestion("hanzi", target.id, 5, { gameType: "balloonPop", promptText: `捉住“${target.character}”`, speechText: target.character, target: target.character, options: chars(5) }) },
  ];
}

function englishQuest(target: EnglishLesson): QuestLevel[] {
  const words = (level: number, count = 3, withImage = false) => optionsFrom(target, englishLessons, (item) => item.word, withImage ? (item) => item.image : undefined, target.order + level, count);
  const firstLetter = target.word[0];
  const letterChoices = [firstLetter, String.fromCharCode(((firstLetter.charCodeAt(0) - 96) % 26) + 97), String.fromCharCode(((firstLetter.charCodeAt(0) - 95) % 26) + 97)].map((letter) => ({ id: `letter-${letter}`, value: letter, label: letter }));
  return [
    { kind: "question", level: 1, title: "听词找卡", emoji: "👂", question: makeQuestion("english", target.id, 1, { gameType: "listenChoose", promptText: "听一听，找到单词", speechText: target.word, target: target.word, options: words(1, 2) }) },
    { kind: "question", level: 2, title: "看图选词", emoji: "🖼️", question: makeQuestion("english", target.id, 2, { gameType: "pictureChoose", promptText: `${target.image} 是哪个单词？`, speechText: target.word, target: target.word, targetImage: target.image, options: words(2) }) },
    { kind: "repeat", level: 3, title: "勇敢开口", emoji: "🎤", text: target.word, lang: "en-US" },
    { kind: "question", level: 4, title: "字母拼图", emoji: "🧩", question: makeQuestion("english", target.id, 4, { gameType: "listenChoose", promptText: `${target.word} 的第一个字母是？`, speechText: `${target.word}, starts with ${firstLetter}`, target: firstLetter, options: letterChoices }) },
    { kind: "question", level: 5, title: "小镇守门战", emoji: "🏰", question: makeQuestion("english", target.id, 5, { gameType: "balloonPop", promptText: `最后一次找到 ${target.word}`, speechText: target.word, target: target.word, options: words(5, 3, true) }) },
  ];
}

function poetryQuest(target: PoetryLesson): QuestLevel[] {
  const lineOptions = target.lines.map((line, index) => ({ id: `${target.id}-line-${index}`, value: line, label: line }));
  return [
    { kind: "question", level: 1, title: "听诗找句", emoji: "👂", question: makeQuestion("poetry", target.id, 1, { gameType: "listenChoose", promptText: "刚才听到的是哪一句？", speechText: target.lines[0], target: target.lines[0], options: lineOptions.slice(0, 2) }) },
    { kind: "question", level: 2, title: "接下一句", emoji: "🪄", question: makeQuestion("poetry", target.id, 2, { gameType: "pictureChoose", promptText: `${target.lines[0]}，下一句是？`, speechText: `${target.lines[0]}，下一句是什么`, target: target.lines[1], targetImage: target.image, options: [lineOptions[1], lineOptions[2], lineOptions[3]] }) },
    { kind: "question", level: 3, title: "诗景配对", emoji: "🌙", question: makeQuestion("poetry", target.id, 3, { gameType: "pictureChoose", promptText: `${target.image} 藏在哪首诗里？`, speechText: `找到${target.title}`, target: target.title, targetImage: target.image, options: optionsFrom(target, poetryLessons, (item) => item.title, (item) => item.image, target.order + 2, 3) }) },
    { kind: "repeat", level: 4, title: "跟读诗句", emoji: "🎤", text: target.lines[2], lang: "zh-CN" },
    { kind: "question", level: 5, title: "诗园守门战", emoji: "🏰", question: makeQuestion("poetry", target.id, 5, { gameType: "balloonPop", promptText: "找到这首诗的最后一句", speechText: target.lines[3], target: target.lines[3], options: [lineOptions[3], lineOptions[1], lineOptions[2]] }) },
  ];
}

export function buildKnowledgeQuest(subject: Subject, id: string): QuestLevel[] {
  if (subject === "pinyin") return pinyinQuest(pinyinLessons.find((item) => item.id === id) ?? pinyinLessons[0]);
  if (subject === "math") { const target = mathLessons.find((item) => item.id === id) ?? mathLessons[0]; return target.type === "compare" ? compareMathQuest(target) : numericMathQuest(target); }
  if (subject === "hanzi") return hanziQuest(hanziLessons.find((item) => item.id === id) ?? hanziLessons[0]);
  if (subject === "english") return englishQuest(englishLessons.find((item) => item.id === id) ?? englishLessons[0]);
  return poetryQuest(poetryLessons.find((item) => item.id === id) ?? poetryLessons[0]);
}

function introFor(subject: CoreSubject, id: string): LessonIntro {
  if (subject === "pinyin") { const target = pinyinLessons.find((item) => item.id === id) ?? pinyinLessons[0]; return { kind: "lesson", id: `intro-${id}`, knowledgePointId: id, subject, eyebrow: "先认识，再闯关", title: target.symbol, image: target.image, speechText: target.symbol, note: target.exampleWords[0] }; }
  if (subject === "math") { const target = mathLessons.find((item) => item.id === id) ?? mathLessons[0]; const value = target.value; return { kind: "lesson", id: `intro-${id}`, knowledgePointId: id, subject, eyebrow: "先看懂，再闯关", title: value ? String(value) : target.title, image: value ? target.image.repeat(value) : target.image, speechText: value ? String(value) : target.title, note: value ? `${value} 个好朋友` : target.prompt }; }
  const target = hanziLessons.find((item) => item.id === id) ?? hanziLessons[0]; return { kind: "lesson", id: `intro-${id}`, knowledgePointId: id, subject, eyebrow: "先看图，再闯关", title: target.character, image: target.image, speechText: `${target.character}，${target.meaning}`, note: `${target.pronunciation} · ${target.meaning}` };
}

export function buildAdventureSteps(subject: CoreSubject, ids: string[], newIds: string[] = ids) {
  return ids.flatMap((id): AdventureStep[] => {
    const levels = buildKnowledgeQuest(subject, id).flatMap((level): GameStep[] => level.kind === "question" ? [{ kind: "game", id: level.question.id, question: level.question }] : []);
    if (!newIds.includes(id)) return [levels[2], levels[4]];
    return [introFor(subject, id), ...levels];
  });
}
