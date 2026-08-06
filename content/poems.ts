export interface PoemLine {
  pinyin: string;
  text: string;
}

export interface Poem {
  title: string;
  author: string;
  dynasty: string;
  lines: PoemLine[];
}

export const POEMS: Poem[] = [
  {
    title: "静夜思",
    author: "李白",
    dynasty: "唐",
    lines: [
      { pinyin: "chuáng qián míng yuè guāng", text: "床前明月光" },
      { pinyin: "yí shì dì shàng shuāng", text: "疑是地上霜" },
      { pinyin: "jǔ tóu wàng míng yuè", text: "举头望明月" },
      { pinyin: "dī tóu sī gù xiāng", text: "低头思故乡" },
    ],
  },
  {
    title: "春晓",
    author: "孟浩然",
    dynasty: "唐",
    lines: [
      { pinyin: "chūn mián bù jué xiǎo", text: "春眠不觉晓" },
      { pinyin: "chù chù wén tí niǎo", text: "处处闻啼鸟" },
      { pinyin: "yè lái fēng yǔ shēng", text: "夜来风雨声" },
      { pinyin: "huā luò zhī duō shǎo", text: "花落知多少" },
    ],
  },
  {
    title: "咏鹅",
    author: "骆宾王",
    dynasty: "唐",
    lines: [
      { pinyin: "é é é", text: "鹅，鹅，鹅" },
      { pinyin: "qū xiàng xiàng tiān gē", text: "曲项向天歌" },
      { pinyin: "bái máo fú lǜ shuǐ", text: "白毛浮绿水" },
      { pinyin: "hóng zhǎng bō qīng bō", text: "红掌拨清波" },
    ],
  },
  {
    title: "悯农",
    author: "李绅",
    dynasty: "唐",
    lines: [
      { pinyin: "chú hé rì dāng wǔ", text: "锄禾日当午" },
      { pinyin: "hàn dī hé xià tǔ", text: "汗滴禾下土" },
      { pinyin: "shuí zhī pán zhōng cān", text: "谁知盘中餐" },
      { pinyin: "lì lì jiē xīn kǔ", text: "粒粒皆辛苦" },
    ],
  },
  {
    title: "江雪",
    author: "柳宗元",
    dynasty: "唐",
    lines: [
      { pinyin: "qiān shān niǎo fēi jué", text: "千山鸟飞绝" },
      { pinyin: "wàn jìng rén zōng miè", text: "万径人踪灭" },
      { pinyin: "gū zhōu suō lì wēng", text: "孤舟蓑笠翁" },
      { pinyin: "dú diào hán jiāng xuě", text: "独钓寒江雪" },
    ],
  },
  {
    title: "登鹳雀楼",
    author: "王之涣",
    dynasty: "唐",
    lines: [
      { pinyin: "bái rì yī shān jìn", text: "白日依山尽" },
      { pinyin: "huáng hé rù hǎi liú", text: "黄河入海流" },
      { pinyin: "yù qióng qiān lǐ mù", text: "欲穷千里目" },
      { pinyin: "gèng shàng yī céng lóu", text: "更上一层楼" },
    ],
  },
  {
    title: "池上",
    author: "白居易",
    dynasty: "唐",
    lines: [
      { pinyin: "xiǎo wá chēng xiǎo tǐng", text: "小娃撑小艇" },
      { pinyin: "tōu cǎi bái lián huí", text: "偷采白莲回" },
      { pinyin: "bù jiě cáng zōng jì", text: "不解藏踪迹" },
      { pinyin: "fú píng yí dào kāi", text: "浮萍一道开" },
    ],
  },
  {
    title: "画",
    author: "佚名",
    dynasty: "古诗",
    lines: [
      { pinyin: "yuǎn kàn shān yǒu sè", text: "远看山有色" },
      { pinyin: "jìn tīng shuǐ wú shēng", text: "近听水无声" },
      { pinyin: "chūn qù huā hái zài", text: "春去花还在" },
      { pinyin: "rén lái niǎo bù jīng", text: "人来鸟不惊" },
    ],
  },
];
