export const childMessages = {
  welcome: "你来啦！一起去冒险吧！",
  start: "我们先去拼音乐园吧！",
  listen: "听一听，选一个！",
  look: "看一看，选一个！",
  found: ["找到啦！", "真棒！", "你发现啦！"],
  retry: "好像不是这个，再看看。",
  hint: "小星星来帮你！",
  reveal: "原来它在这里呀！",
  continue: "我们继续！",
  subjectDone: "这次冒险完成啦！",
  allDone: "今天的冒险完成啦！",
  unsupportedSpeech: "我先用文字陪你玩！",
} as const;

export function randomPraise() {
  return childMessages.found[Math.floor(Math.random() * childMessages.found.length)];
}
