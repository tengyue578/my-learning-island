export interface LogicQuestion {
  type: "找规律" | "图形配对" | "排序";
  prompt: string;
  visual?: string[];
  options: string[];
  answer: string;
  hint: string;
}

export const LOGIC_QUESTIONS: LogicQuestion[] = [
  {
    type: "找规律",
    prompt: "接下来是什么颜色？",
    visual: ["pink", "blue", "pink", "blue"],
    options: ["粉色圆形", "蓝色圆形", "黄色圆形"],
    answer: "粉色圆形",
    hint: "粉色和蓝色轮流出现。",
  },
  {
    type: "图形配对",
    prompt: "哪一个和上面的图形形状一样？",
    visual: ["triangle"],
    options: ["圆形", "三角形", "正方形", "五角星"],
    answer: "三角形",
    hint: "数一数，它有三个角。",
  },
  {
    type: "排序",
    prompt: "哪一组是从小到大排好的？",
    options: ["1、3、5", "5、3、1", "3、1、5"],
    answer: "1、3、5",
    hint: "小数字在前，大数字在后。",
  },
  {
    type: "找规律",
    prompt: "小积木接下来是什么形状？",
    visual: ["circle", "circle", "square", "circle", "circle"],
    options: ["圆形", "正方形", "三角形"],
    answer: "正方形",
    hint: "两个圆形后面跟着一个正方形。",
  },
  {
    type: "排序",
    prompt: "哪一组从矮到高？",
    options: ["矮、中、高", "高、中、矮", "中、矮、高", "矮、高、中"],
    answer: "矮、中、高",
    hint: "先找最矮的，再找最高的。",
  },
  {
    type: "图形配对",
    prompt: "哪个图形没有角？",
    options: ["圆形", "三角形", "正方形"],
    answer: "圆形",
    hint: "沿着边摸一圈，圆形滑滑的。",
  },
];
