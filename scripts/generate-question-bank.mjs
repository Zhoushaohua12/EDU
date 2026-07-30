#!/usr/bin/env node
/**
 * Generate multi-type question bank from data/topics.json (PDF TOC + 课标章节).
 * Output: data/question-bank.json
 */
import fs from "node:fs";

const topicsFile = JSON.parse(fs.readFileSync("data/topics.json", "utf8"));
const catalog = JSON.parse(fs.readFileSync("data/textbooks.json", "utf8"));

function cleanTopic(t) {
  return String(t)
    .replace(/^第[一二三四五六七八九十\d]+[章节单元课]\s*/u, "")
    .replace(/^Unit\s*\d+\s*/i, "")
    .replace(/^\d+\s+/u, "")
    .trim();
}

/** @type {Record<string, (topic: string, book: any) => any[]>} */
const SUBJECT_GENERATORS = {
  math: mathQuestions,
  chinese: chineseQuestions,
  english: englishQuestions,
  physics: physicsQuestions,
  chemistry: chemistryQuestions,
  biology: biologyQuestions,
  history: historyQuestions,
  geography: geographyQuestions,
  morality: softQuestions("道德与法治"),
  science: softQuestions("科学"),
  art: softQuestions("美术"),
  music: softQuestions("音乐"),
  pe: softQuestions("体育与健康"),
};

function q(type, prompt, answer, explanation, options) {
  return {
    type,
    prompt,
    answer,
    explanation,
    ...(options ? { options } : {}),
  };
}

function mathQuestions(topic, book) {
  const t = cleanTopic(topic);
  const bank = [];
  if (/有理数|正数|负数|数轴/.test(t + topic)) {
    bank.push(
      q("single", "下列哪个数是负数？", "-3", "带负号且不为 0 的是负数。", ["0", "3", "-3", "+2"]),
      q("judge", "0 既不是正数也不是负数。", "正确", "0 是正负数的分界。"),
      q("fill", "数轴上原点表示的数是 ____。", "0", "原点对应 0。"),
      q("single", "−5 的相反数是？", "5", "互为相反数的两数和为 0。", ["-5", "5", "0", "1/5"]),
    );
  } else if (/整式|加减/.test(t + topic)) {
    bank.push(
      q("single", "同类项是指？", "所含字母相同且相同字母的指数也相同的项", "同类项可合并。", [
        "系数相同的项",
        "所含字母相同且相同字母的指数也相同的项",
        "次数相同的项",
        "任意两项",
      ]),
      q("fill", "合并同类项：3a + 5a = ____。", "8a", "系数相加，字母与指数不变。"),
      q("judge", "2x 与 2y 是同类项。", "错误", "字母不同，不是同类项。"),
    );
  } else if (/方程|一元一次|二元/.test(t + topic)) {
    bank.push(
      q("single", "方程 2x − 4 = 0 的解是？", "x=2", "移项得 2x=4，x=2。", ["x=0", "x=2", "x=-2", "x=4"]),
      q("fill", "解方程 x + 7 = 10，得 x = ____。", "3", "两边减 7。"),
      q("judge", "方程的解代入原方程能使等式成立。", "正确", "这是方程解的定义。"),
    );
  } else if (/几何|图形|角|平行|三角形|圆|相似|勾股/.test(t + topic)) {
    bank.push(
      q("single", "三角形内角和等于？", "180°", "平面三角形内角和为 180°。", ["90°", "180°", "270°", "360°"]),
      q("judge", "两点确定一条直线。", "正确", "直线公理。"),
      q("fill", "平角是 ____ 度。", "180", "平角为 180°。"),
    );
  } else if (/函数|一次函数|二次|反比例/.test(t + topic)) {
    bank.push(
      q("single", "一次函数 y = kx + b（k≠0）的图像是？", "一条直线", "一次函数图像为直线。", [
        "抛物线",
        "双曲线",
        "一条直线",
        "圆",
      ]),
      q("judge", "正比例函数是一次函数的特殊情况。", "正确", "b=0 时为正比例函数。"),
      q("fill", "函数 y = 2x 中，当 x=3 时，y=____。", "6", "代入得 6。"),
    );
  } else if (/分数|小数|百分|比|比例/.test(t + topic)) {
    bank.push(
      q("single", "把一个整体平均分成 5 份，取 2 份记作？", "2/5", "分子是取的份数，分母是总份数。", [
        "5/2",
        "2/5",
        "2.5",
        "1/5",
      ]),
      q("fill", "0.5 化为分数是 ____。", "1/2", "十分之五约分为二分之一。"),
      q("judge", "百分数可以带单位。", "错误", "百分数是比率，一般不带单位。"),
    );
  } else if (/乘|除|加减|进位|退位|运算|乘法|除法/.test(t + topic)) {
    bank.push(
      q("single", "7 × 8 = ?", "56", "七八五十六。", ["54", "56", "63", "48"]),
      q("fill", "9 + 6 = ____。", "15", "九加六等于十五。"),
      q("judge", "加法满足交换律。", "正确", "a+b=b+a。"),
    );
  } else {
    bank.push(
      q(
        "single",
        `关于「${t || topic}」，学习时应优先？`,
        "先理解概念再做变式练习",
        "概念清楚后练习更有效。",
        ["只背结论", "先理解概念再做变式练习", "只看答案", "跳过例题"],
      ),
      q("judge", `「${t || topic}」相关例题值得先模仿再独立完成。`, "正确", "例题示范通法。"),
      q("fill", `${book.grade}年级数学学习中，错题本主要用于整理____。`, "易错点", "复盘错因。"),
    );
  }
  // always add one calculation practice for primary
  if (book.stage === "primary" && book.grade <= 3) {
    bank.push(q("fill", "4 + 5 = ____。", "9", "合并计数。"));
  }
  return bank;
}

function chineseQuestions(topic, book) {
  const t = cleanTopic(topic) || topic;
  return [
    q(
      "single",
      `阅读「${t}」相关课文时，概括段意较稳妥的方法是？`,
      "抓住对象及其行为或特征",
      "对象+行为/特征更完整。",
      ["只抄一句原话", "抓住对象及其行为或特征", "只看插图", "只数自然段"],
    ),
    q("judge", "朗读时应注意停连与语气，帮助理解情感。", "正确", "朗读服务于理解。"),
    q("fill", "记叙文常见六要素包括时间、地点、人物、起因、经过和____。", "结果", "六要素完整叙事。"),
    q(
      "single",
      "文言文阅读第一步通常是？",
      "结合注释疏通大意",
      "先弄懂字词句再深入赏析。",
      ["直接翻译成作文", "结合注释疏通大意", "只背作者", "跳过注释"],
    ),
  ];
}

function englishQuestions(topic) {
  const t = cleanTopic(topic) || topic;
  const bank = [
    q("single", `"Hello" 常用于？`, "打招呼", "Hello 是问候语。", ["道别", "打招呼", "道歉", "点餐"]),
    q("fill", "完成：My name ____ Tom.（is/am/are）", "is", "第三人称单数用 is。"),
    q("judge", "English 作为学科名，首字母通常大写。", "正确", "专有/学科名习惯大写。"),
  ];
  if (/colour|color/i.test(t)) {
    bank.push(q("single", `"red" 的中文是？`, "红色", "red 表示红色。", ["蓝色", "红色", "绿色", "黄色"]));
  } else if (/animal/i.test(t)) {
    bank.push(q("fill", `"cat" 的中文是____。`, "猫", "cat 即猫。"));
  } else if (/family|friend|home|school/i.test(t)) {
    bank.push(q("single", `"father" 的意思是？`, "爸爸/父亲", "family 成员词汇。", ["妈妈", "爸爸/父亲", "老师", "同学"]));
  } else if (/food|eat|dinner|noodle|banana/i.test(t)) {
    bank.push(q("judge", `"apple" 是一种水果。`, "正确", "apple 是苹果。"));
  } else if (/time|weekend|day|season/i.test(t)) {
    bank.push(q("fill", "一周有 ____ 天。（填阿拉伯数字）", "7", "一周七天。"));
  } else {
    bank.push(q("single", `本单元主题「${t}」学习时，应先掌握？`, "核心单词与句型", "词汇句型是表达基础。", ["超纲语法", "核心单词与句型", "只抄课文", "不听录音"]));
  }
  return bank;
}

function physicsQuestions(topic) {
  const t = cleanTopic(topic) || topic;
  const bank = [];
  if (/机械运动|参照|速度|长度|时间/.test(t + topic)) {
    bank.push(
      q("single", "描述物体运动时必须先明确？", "参照物", "运动是相对的。", ["质量", "参照物", "温度", " dens ity"]),
      q("judge", "坐在行驶汽车中的人，以车厢为参照物通常认为是静止的。", "正确", "相对车厢位置不变。"),
      q("fill", "国际单位制中，长度的基本单位是____。", "米", "符号 m。"),
    );
  } else if (/声|噪声/.test(t + topic)) {
    bank.push(
      q("single", "声音由物体的什么产生？", "振动", "振动发声。", ["发光", "振动", "熔化", "导电"]),
      q("judge", "声音可以在真空中传播。", "错误", "真空不能传声。"),
    );
  } else if (/物态|温度|熔化|汽化|升华/.test(t + topic)) {
    bank.push(
      q("single", "物质从固态变为液态叫做？", "熔化", "熔化吸热。", ["凝固", "熔化", "升华", "凝华"]),
      q("fill", "冰水混合物的温度是____℃。", "0", "标准大气压下为 0℃。"),
    );
  } else if (/光|透镜/.test(t + topic)) {
    bank.push(
      q("single", "光在同种均匀介质中沿什么传播？", "直线", "光的直线传播。", ["曲线", "直线", "折线", "任意路径"]),
      q("judge", "平面镜成像是虚像。", "正确", "平面镜成正立虚像。"),
    );
  } else if (/力|压强|浮力|功|机械/.test(t + topic)) {
    bank.push(
      q("single", "力的单位是？", "牛顿", "符号 N。", ["千克", "牛顿", "帕斯卡", "焦耳"]),
      q("judge", "惯性是物体保持原有运动状态的性质。", "正确", "一切物体都有惯性。"),
    );
  } else if (/电|电路|电阻|欧姆|磁/.test(t + topic)) {
    bank.push(
      q("single", "电路中提供电能的装置通常是？", "电源", "电源供电。", ["开关", "电源", "导线", "灯泡"]),
      q("fill", "欧姆定律中 I = U / ____。", "R", "电流等于电压除以电阻。"),
    );
  } else {
    bank.push(
      q("single", `学习「${t}」时，实验前应先？`, "明确目的并检查器材", "安全与有效实验。", ["直接通电", "明确目的并检查器材", "省略记录", "只看结论"]),
      q("judge", "物理量都有单位，比较时要注意统一单位。", "正确", "单位统一才能比较。"),
    );
  }
  return bank;
}

function chemistryQuestions(topic) {
  const t = cleanTopic(topic) || topic;
  const bank = [];
  if (/走进化学|变化|物理变化|化学变化/.test(t + topic)) {
    bank.push(
      q("single", "有新物质生成的变化是？", "化学变化", "化学变化有新物质。", ["物理变化", "化学变化", "状态变化即可", "体积变化"]),
      q("judge", "水结成冰是化学变化。", "错误", "只是状态变化，无新物质。"),
    );
  } else if (/空气|氧气|氮气|二氧化碳/.test(t + topic)) {
    bank.push(
      q("single", "空气中含量最多的气体是？", "氮气", "氮气约占 78%。", ["氧气", "氮气", "二氧化碳", "稀有气体"]),
      q("fill", "氧气的化学式是____。", "O2", "双原子分子。"),
    );
  } else if (/分子|原子|离子|元素|构成/.test(t + topic)) {
    bank.push(
      q("single", "保持物质化学性质的最小粒子通常是？", "分子", "分子保持化学性质。", ["原子", "分子", "质子", "电子"]),
      q("judge", "原子是化学变化中的最小粒子。", "正确", "化学变化中原子重新组合。"),
    );
  } else if (/水|净化|硬水/.test(t + topic)) {
    bank.push(
      q("single", "水的化学式是？", "H2O", "一个水分子含两氢一氧。", ["HO", "H2O", "H2O2", "O2"]),
      q("judge", "蒸馏可以降低水的硬度。", "正确", "蒸馏得到较纯净的水。"),
    );
  } else if (/方程|质量守恒/.test(t + topic)) {
    bank.push(
      q("single", "化学方程式必须遵循？", "质量守恒定律", "反应前后质量守恒。", ["惯性定律", "质量守恒定律", "欧姆定律", "杠杆原理"]),
      q("fill", "配平的核心是使左右两边各____的原子个数相等。", "元素", "原子守恒。"),
    );
  } else if (/酸|碱|盐|溶液|金属|燃料/.test(t + topic)) {
    bank.push(
      q("single", "盐酸能使紫色石蕊试液变成？", "红色", "酸使石蕊变红。", ["蓝色", "红色", "无色", "绿色"]),
      q("judge", "溶液一定是混合物。", "正确", "溶液由溶质和溶剂组成。"),
    );
  } else {
    bank.push(
      q("single", `学习「${t}」时，实验室操作首先要注意？`, "安全规范", "化学实验安全第一。", ["速度", "安全规范", "只求结果", "不用护目镜"]),
      q("judge", "化学式中元素符号首字母大写。", "正确", "书写规范要求。"),
    );
  }
  return bank;
}

function biologyQuestions(topic) {
  const t = cleanTopic(topic) || topic;
  return [
    q(
      "single",
      /光合|植物|绿色/.test(t + topic)
        ? "光合作用的主要场所是？"
        : /细胞|结构/.test(t + topic)
          ? "植物细胞有而动物细胞通常没有的结构是？"
          : "生物与非生物的重要区别之一是？",
      /光合|植物|绿色/.test(t + topic)
        ? "叶绿体"
        : /细胞|结构/.test(t + topic)
          ? "细胞壁（及叶绿体等）"
          : "能进行新陈代谢",
      "结合本单元核心概念判断。",
      /光合|植物|绿色/.test(t + topic)
        ? ["线粒体", "叶绿体", "液泡", "细胞核"]
        : /细胞|结构/.test(t + topic)
          ? ["细胞膜", "细胞核", "细胞壁（及叶绿体等）", "细胞质"]
          : ["有质量", "能进行新陈代谢", "有颜色", "占空间"],
    ),
    q("judge", "细胞是生物体结构和功能的基本单位。", "正确", "细胞学说要点。"),
    q("fill", "绿色植物光合作用需要光、二氧化碳和____。", "水", "光合作用原料。"),
  ];
}

function historyQuestions(topic) {
  const t = cleanTopic(topic) || topic;
  return [
    q(
      "single",
      /北京人|早期人类|史前/.test(t + topic)
        ? "北京人遗址位于？"
        : /秦|汉|统一/.test(t + topic)
          ? "中国历史上第一个统一的中央集权国家是？"
          : "研究早期历史时，下列属于实物史料的是？",
      /北京人|早期人类|史前/.test(t + topic)
        ? "北京周口店"
        : /秦|汉|统一/.test(t + topic)
          ? "秦朝"
          : "考古出土文物",
      "结合教材单元史实。",
      /北京人|早期人类|史前/.test(t + topic)
        ? ["西安半坡", "北京周口店", "殷墟", "河姆渡"]
        : /秦|汉|统一/.test(t + topic)
          ? ["夏朝", "商朝", "秦朝", "周朝"]
          : ["神话故事", "考古出土文物", "后人小说", "口头传言"],
    ),
    q("judge", "历史学习应区分传说与考古实证。", "正确", "史学研究重视证据。"),
    q("fill", "公元纪年中，公元前与公元后之间没有____年。", "0", "不存在公元 0 年。"),
  ];
}

function geographyQuestions(topic) {
  const t = cleanTopic(topic) || topic;
  return [
    q(
      "single",
      /地球|地球仪|经纬|地图/.test(t + topic)
        ? "赤道是一条特殊的？"
        : /气候|天气/.test(t + topic)
          ? "描述天气常用的要素不包括？"
          : "七大洲中面积最大的是？",
      /地球|地球仪|经纬|地图/.test(t + topic)
        ? "纬线"
        : /气候|天气/.test(t + topic)
          ? "人口数量"
          : "亚洲",
      "结合本单元地理概念。",
      /地球|地球仪|经纬|地图/.test(t + topic)
        ? ["经线", "纬线", "等高线", "时区线"]
        : /气候|天气/.test(t + topic)
          ? ["气温", "降水", "风力", "人口数量"]
          : ["非洲", "亚洲", "欧洲", "南极洲"],
    ),
    q("judge", "在地图上，比例尺越大表示内容越详细。", "正确", "大比例尺地图更详细。"),
    q("fill", "地球表面海洋面积约占全球的____%。（约数，填 70 或 71）", "71", "海陆比例约七三开。"),
  ];
}

function softQuestions(subjectName) {
  return (topic) => {
    const t = cleanTopic(topic) || topic;
    return [
      q(
        "single",
        `学习${subjectName}「${t}」时，更合适的态度是？`,
        "认真观察、积极参与并总结方法",
        "过程与方法并重。",
        ["只看热闹", "认真观察、积极参与并总结方法", "完全不动手", "只背名词"],
      ),
      q("judge", `${subjectName}学习既要掌握知识，也要养成良好习惯与安全意识。`, "正确", "素养目标。"),
      q("fill", `本主题「${t}」练习后，建议用错题本记录____。`, "易错点", "复盘提升。"),
    ];
  };
}

function dedupe(questions) {
  const seen = new Set();
  const out = [];
  for (const item of questions) {
    const key = `${item.type}|${item.prompt}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

const bank = {};
let total = 0;

for (const book of catalog.books) {
  const key = `${book.stage}-${book.grade}-${book.subjectSlug}-${book.term}`;
  const topicList = topicsFile.topics[key] || [`${book.termLabel}综合`];
  const gen = SUBJECT_GENERATORS[book.subjectSlug] || softQuestions(book.subjectName);
  const questions = [];

  // book-level warmups
  questions.push(
    q(
      "single",
      `开始学习《${book.title}》时，较好的第一步是？`,
      "先浏览目录明确单元安排",
      "建立整册地图再深入。",
      ["直接做最难题", "先浏览目录明确单元安排", "只看封面", "跳过目录"],
    ),
    q("judge", "电子教材可用于预习、复习，但不能替代课堂思考。", "正确", "教材是工具，思考是关键。"),
  );

  for (const topic of topicList.slice(0, 8)) {
    questions.push(...gen(topic, book));
  }

  const unique = dedupe(questions).slice(0, 24);
  bank[key] = {
    title: book.title,
    subject: book.subjectSlug,
    grade: book.grade,
    term: book.term,
    topics: topicList,
    questions: unique,
  };
  total += unique.length;
}

const out = {
  generatedAt: new Date().toISOString(),
  source: "ChinaTextbook PDF chapters + 人教版课标知识点原创练习",
  bookCount: Object.keys(bank).length,
  questionCount: total,
  books: bank,
};

fs.writeFileSync("data/question-bank.json", JSON.stringify(out, null, 2));
console.log(`Wrote ${total} questions across ${out.bookCount} books`);
