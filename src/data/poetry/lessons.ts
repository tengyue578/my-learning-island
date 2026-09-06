import type { PoetryLesson } from "@/src/models";

export const poetryLessons: PoetryLesson[] = [
  { id: "poetry_jingyesi", subject: "poetry", type: "poem", title: "静夜思", author: "李白", lines: ["床前明月光", "疑是地上霜", "举头望明月", "低头思故乡"], image: "🌙", difficulty: 1, order: 1, prerequisites: [] },
  { id: "poetry_yonge", subject: "poetry", type: "poem", title: "咏鹅", author: "骆宾王", lines: ["鹅鹅鹅", "曲项向天歌", "白毛浮绿水", "红掌拨清波"], image: "🪿", difficulty: 1, order: 2, prerequisites: ["poetry_jingyesi"] },
  { id: "poetry_chunxiao", subject: "poetry", type: "poem", title: "春晓", author: "孟浩然", lines: ["春眠不觉晓", "处处闻啼鸟", "夜来风雨声", "花落知多少"], image: "🌸", difficulty: 2, order: 3, prerequisites: ["poetry_yonge"] },
  { id: "poetry_minnong", subject: "poetry", type: "poem", title: "悯农", author: "李绅", lines: ["锄禾日当午", "汗滴禾下土", "谁知盘中餐", "粒粒皆辛苦"], image: "🌾", difficulty: 2, order: 4, prerequisites: ["poetry_chunxiao"] },
  { id: "poetry_dengguanquelou", subject: "poetry", type: "poem", title: "登鹳雀楼", author: "王之涣", lines: ["白日依山尽", "黄河入海流", "欲穷千里目", "更上一层楼"], image: "🏯", difficulty: 2, order: 5, prerequisites: ["poetry_minnong"] },
];
