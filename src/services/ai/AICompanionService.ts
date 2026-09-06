export interface Message { role: "child" | "companion"; content: string }

export interface AIProvider {
  chat(messages: Message[]): Promise<string>;
}

const questions = [
  { text: "今天的心情像哪一种天气？", choices: ["晴天", "小雨", "彩虹"] },
  { text: "你想和哪位动物朋友玩？", choices: ["小猫", "小狗", "小鸟"] },
  { text: "选一种颜色送给小岛吧！", choices: ["黄色", "蓝色", "绿色"] },
] as const;

export class LocalAICompanionService implements AIProvider {
  askChildQuestion(index = 0) {
    return questions[index % questions.length];
  }

  respondToChild(content: string) {
    if (content.includes("晴")) return "晴天亮晶晶，愿你今天也暖洋洋！";
    if (content.includes("雨")) return "小雨会给花朵喝水，我陪你慢慢走。";
    if (content.includes("彩虹")) return "彩虹有好多颜色，像一座天空小桥！";
    if (content.includes("猫")) return "小猫软乎乎的，我们轻轻和它打招呼！";
    if (content.includes("狗")) return "小狗摇着尾巴，一定很想和你跑一跑！";
    if (content.includes("鸟")) return "小鸟会唱歌，我们也来听一听吧！";
    if (content.includes("黄")) return "黄色像小星星一样亮！";
    if (content.includes("蓝")) return "蓝色像安安静静的天空！";
    if (content.includes("绿")) return "绿色像小岛上刚长出的叶子！";
    return "我听到你啦！谢谢你说给我听。";
  }

  giveEncouragement() {
    return "你愿意开口表达，已经很棒啦！";
  }

  explainSimpleConcept(concept: string) {
    const explanations: Record<string, string> = {
      彩虹: "阳光遇到小水滴，就会变成好多漂亮的颜色。",
      月亮: "月亮不会自己发光，它把太阳的光轻轻送给我们。",
      颜色: "颜色让我们更容易认出身边不同的东西。",
    };
    return explanations[concept] ?? `${concept}是一个值得慢慢发现的小秘密。`;
  }

  async chat(messages: Message[]) {
    const latest = messages.at(-1)?.content ?? "";
    return this.respondToChild(latest);
  }
}

export const localAICompanion = new LocalAICompanionService();
