import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  MIDDLE_GRADES,
  MIDDLE_SUBJECTS,
  PRIMARY_GRADES,
  PRIMARY_SUBJECTS,
} from "../src/lib/curriculum";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

type SampleLesson = {
  title: string;
  summary: string;
  guide: string;
  questions: {
    type: "single" | "fill";
    prompt: string;
    options?: string[];
    answer: string;
    explanation: string;
  }[];
};

const SAMPLE_CONTENT: Record<string, { unitTitle: string; lessons: SampleLesson[] }> = {
  "primary-1-chinese": {
    unitTitle: "识字与朗读入门",
    lessons: [
      {
        title: "认识常用汉字",
        summary: "通过生活场景认识基础汉字，建立音形义联系。",
        guide:
          "## 学习目标\n- 认识常见汉字的字形结构\n- 能在生活场景中认读\n\n## 导学要点\n1. 先看整体轮廓，再分清部件。\n2. 结合图片与词语记忆，不要孤立背字。\n3. 读准声调，边指边读。\n\n## 小练习建议\n每天认读 8–10 个字，并口头组一个词。",
        questions: [
          {
            type: "single",
            prompt: "“日”字通常表示什么？",
            options: ["太阳 / 白天", "月亮", "树木", "河流"],
            answer: "太阳 / 白天",
            explanation: "“日”象形为太阳，也可表示白天。",
          },
          {
            type: "fill",
            prompt: "“山水”两个字合起来，常用来形容什么景色？（两字）",
            answer: "自然",
            explanation: "山水常指自然风光；也可答“风景”，本课参考答案取“自然”。",
          },
        ],
      },
    ],
  },
  "primary-1-math": {
    unitTitle: "10 以内加减",
    lessons: [
      {
        title: "认识加减法",
        summary: "用实物操作理解加法合并与减法拿走。",
        guide:
          "## 学习目标\n- 理解加法是合并，减法是拿走\n- 熟练 10 以内加减\n\n## 导学要点\n1. 用小棒或豆子操作，再说算式。\n2. 加法可交换：3+2 与 2+3 结果相同。\n3. 减法注意被减数与减数顺序。",
        questions: [
          {
            type: "single",
            prompt: "3 + 4 = ?",
            options: ["6", "7", "8", "5"],
            answer: "7",
            explanation: "3 与 4 合并得到 7。",
          },
          {
            type: "fill",
            prompt: "9 − 5 = ?",
            answer: "4",
            explanation: "从 9 拿走 5，还剩 4。",
          },
        ],
      },
    ],
  },
  "primary-3-english": {
    unitTitle: "My School",
    lessons: [
      {
        title: "Classroom words",
        summary: "学习教室常用英语单词与简单句型。",
        guide:
          "## Learning goals\n- Name classroom objects\n- Use “This is …” / “That is …”\n\n## Tips\n1. Look, say, and point.\n2. Practice with a partner: “What is this?”",
        questions: [
          {
            type: "single",
            prompt: "“book” 的中文意思是？",
            options: ["铅笔", "书", "书包", "橡皮"],
            answer: "书",
            explanation: "book 表示书。",
          },
          {
            type: "fill",
            prompt: "完成句子：This is a _____ .（桌子，英文单词）",
            answer: "desk",
            explanation: "教室里的桌子常用 desk。",
          },
        ],
      },
    ],
  },
  "primary-5-math": {
    unitTitle: "分数初步",
    lessons: [
      {
        title: "认识分数的意义",
        summary: "理解把一个整体平均分成若干份。",
        guide:
          "## 学习目标\n- 理解分数表示平均分\n- 会读写简单分数\n\n## 导学要点\n1. 强调“平均分”，不平均不能写成该分数。\n2. 分子表示取了几份，分母表示分成几份。",
        questions: [
          {
            type: "single",
            prompt: "把一块蛋糕平均分成 4 份，取其中 1 份，记作？",
            options: ["1/3", "1/4", "4/1", "2/4"],
            answer: "1/4",
            explanation: "平均分成 4 份取 1 份，写作 1/4。",
          },
        ],
      },
    ],
  },
  "middle-7-chinese": {
    unitTitle: "现代文阅读方法",
    lessons: [
      {
        title: "抓住关键词句",
        summary: "学习通过关键词把握段落主旨。",
        guide:
          "## 学习目标\n- 会圈画关键词句\n- 能用自己的话概括段意\n\n## 导学要点\n1. 先通读，再精读。\n2. 注意反复出现的词语与转折词。\n3. 概括段意：对象 + 做什么 / 怎么样。",
        questions: [
          {
            type: "single",
            prompt: "概括段意时，最稳妥的结构是？",
            options: ["只抄原句", "对象 + 行为/特征", "只写感受", "只写标题"],
            answer: "对象 + 行为/特征",
            explanation: "抓住陈述对象及其行为或特征，概括更准确。",
          },
        ],
      },
    ],
  },
  "middle-7-math": {
    unitTitle: "有理数",
    lessons: [
      {
        title: "正数、负数与数轴",
        summary: "理解正负数意义，并在数轴上表示。",
        guide:
          "## 学习目标\n- 理解正数与负数的现实意义\n- 会在数轴上表示有理数\n\n## 导学要点\n1. 零既不是正数也不是负数。\n2. 数轴三要素：原点、正方向、单位长度。",
        questions: [
          {
            type: "single",
            prompt: "下列哪个数是负数？",
            options: ["0", "3", "-2", "+5"],
            answer: "-2",
            explanation: "带负号且不为零的是负数。",
          },
          {
            type: "fill",
            prompt: "数轴上，原点表示的数是？",
            answer: "0",
            explanation: "原点对应 0。",
          },
        ],
      },
    ],
  },
  "middle-8-physics": {
    unitTitle: "机械运动",
    lessons: [
      {
        title: "参照物与运动",
        summary: "理解物体运动或静止取决于所选参照物。",
        guide:
          "## 学习目标\n- 理解机械运动含义\n- 会选择参照物判断运动状态\n\n## 导学要点\n1. 运动是相对的。\n2. 描述运动前先明确参照物。",
        questions: [
          {
            type: "single",
            prompt: "坐在行驶汽车里的乘客，若以车厢为参照物，通常认为他是？",
            options: ["运动的", "静止的", "加速的", "无法判断"],
            answer: "静止的",
            explanation: "相对车厢位置不变，可认为静止。",
          },
        ],
      },
    ],
  },
  "middle-9-chemistry": {
    unitTitle: "化学用语入门",
    lessons: [
      {
        title: "元素符号与化学式",
        summary: "认识常见元素符号，理解化学式含义。",
        guide:
          "## 学习目标\n- 记住常见元素符号书写规则\n- 理解化学式表示的意义\n\n## 导学要点\n1. 元素符号首字母大写，第二个字母小写。\n2. 化学式既表示物质，也表示组成。",
        questions: [
          {
            type: "single",
            prompt: "氧元素的元素符号是？",
            options: ["O", "o", "Ox", "氧"],
            answer: "O",
            explanation: "氧的元素符号是 O。",
          },
        ],
      },
    ],
  },
  "middle-7-history": {
    unitTitle: "早期国家与文明",
    lessons: [
      {
        title: "从传说到信史",
        summary: "区分传说与考古实证，理解早期文明研究路径。",
        guide:
          "## 学习目标\n- 区分神话传说与历史记载\n- 了解考古对早期历史的作用\n\n## 导学要点\n1. 传说可提供线索，需与证据互证。\n2. 文物、遗址是重要史料。",
        questions: [
          {
            type: "single",
            prompt: "研究早期历史时，下列哪项属于实物史料？",
            options: ["神话故事", "考古出土文物", "后人小说", "口头传言"],
            answer: "考古出土文物",
            explanation: "出土文物属于实物史料。",
          },
        ],
      },
    ],
  },
  "middle-7-geography": {
    unitTitle: "地球与地图",
    lessons: [
      {
        title: "经纬网与定位",
        summary: "认识经线纬线，学会用经纬网定位。",
        guide:
          "## 学习目标\n- 区分经线与纬线\n- 会读简单经纬度\n\n## 导学要点\n1. 纬线指示东西，经线指示南北。\n2. 定位需要经度与纬度配合。",
        questions: [
          {
            type: "single",
            prompt: "赤道是一条特殊的？",
            options: ["经线", "纬线", "等高线", "时区线"],
            answer: "纬线",
            explanation: "赤道是纬度 0° 的纬线。",
          },
        ],
      },
    ],
  },
  "middle-7-morality": {
    unitTitle: "成长的节拍",
    lessons: [
      {
        title: "认识自我与同伴",
        summary: "学会客观认识自己，尊重同伴差异。",
        guide:
          "## 学习目标\n- 学会多角度看自己\n- 理解尊重与合作\n\n## 导学要点\n1. 优点与不足都是自我的一部分。\n2. 同学之间差异可以成为互补。",
        questions: [
          {
            type: "single",
            prompt: "与同伴发生分歧时，更合适的做法是？",
            options: ["立刻指责", "冷静沟通、倾听", "冷战不理", "公开嘲讽"],
            answer: "冷静沟通、倾听",
            explanation: "倾听与沟通有助于化解分歧。",
          },
        ],
      },
    ],
  },
  "middle-8-english": {
    unitTitle: "Reading strategies",
    lessons: [
      {
        title: "Skimming for main idea",
        summary: "练习略读抓主旨的阅读策略。",
        guide:
          "## Goals\n- Skim titles and first sentences\n- Find the main idea quickly\n\n## Tips\nDon’t stop at every new word on the first pass.",
        questions: [
          {
            type: "single",
            prompt: "Skimming 主要帮助我们做什么？",
            options: ["逐词翻译", "快速把握大意", "只看语法", "抄写全文"],
            answer: "快速把握大意",
            explanation: "略读用于快速抓住文章大意。",
          },
        ],
      },
    ],
  },
};

async function upsertSubjectTree() {
  for (const grade of PRIMARY_GRADES) {
    for (const subject of PRIMARY_SUBJECTS) {
      await prisma.subject.upsert({
        where: {
          stage_grade_slug: { stage: "primary", grade, slug: subject.slug },
        },
        update: { name: subject.name, sortOrder: subject.sortOrder },
        create: {
          stage: "primary",
          grade,
          slug: subject.slug,
          name: subject.name,
          sortOrder: subject.sortOrder,
        },
      });
    }
  }

  for (const grade of MIDDLE_GRADES) {
    for (const subject of MIDDLE_SUBJECTS) {
      // Chemistry typically from grade 9 in many schools; still show entry for 8–9.
      if (subject.slug === "chemistry" && grade < 9) continue;
      if (subject.slug === "physics" && grade < 8) continue;

      await prisma.subject.upsert({
        where: {
          stage_grade_slug: { stage: "middle", grade, slug: subject.slug },
        },
        update: { name: subject.name, sortOrder: subject.sortOrder },
        create: {
          stage: "middle",
          grade,
          slug: subject.slug,
          name: subject.name,
          sortOrder: subject.sortOrder,
        },
      });
    }
  }
}

async function seedSampleLessons() {
  for (const [key, content] of Object.entries(SAMPLE_CONTENT)) {
    const [stage, gradeStr, slug] = key.split("-") as ["primary" | "middle", string, string];
    const grade = Number(gradeStr);
    const subject = await prisma.subject.findUnique({
      where: { stage_grade_slug: { stage, grade, slug } },
    });
    if (!subject) continue;

    const existing = await prisma.unit.findFirst({
      where: { subjectId: subject.id, title: content.unitTitle },
    });
    if (existing) continue;

    await prisma.unit.create({
      data: {
        subjectId: subject.id,
        title: content.unitTitle,
        sortOrder: 1,
        lessons: {
          create: content.lessons.map((lesson, lessonIndex) => ({
            title: lesson.title,
            summary: lesson.summary,
            guide: lesson.guide,
            sortOrder: lessonIndex + 1,
            questions: {
              create: lesson.questions.map((q, qi) => ({
                type: q.type,
                prompt: q.prompt,
                options: q.options ? JSON.stringify(q.options) : null,
                answer: q.answer,
                explanation: q.explanation,
                sortOrder: qi + 1,
              })),
            },
          })),
        },
      },
    });
  }

  // Placeholder units for subjects without deep samples so browsing feels complete.
  const allSubjects = await prisma.subject.findMany({ include: { units: true } });
  for (const subject of allSubjects) {
    if (subject.units.length > 0) continue;
    await prisma.unit.create({
      data: {
        subjectId: subject.id,
        title: "同步导学（样例即将扩充）",
        sortOrder: 1,
        lessons: {
          create: {
            title: `${subject.name}学习方法导读`,
            summary: `人教版${subject.grade}年级${subject.name}学习路径说明与预习建议。`,
            guide: `## 本课说明\n这是${subject.grade}年级${subject.name}的导学样例页。\n\n## 建议学法\n1. 先看目录，明确单元目标。\n2. 带着问题预习，标记不懂处。\n3. 课后用错题本整理易错点。\n\n> 正式练习内容将持续扩充，欢迎管理员在后台添加课时与题目。`,
            sortOrder: 1,
            questions: {
              create: [
                {
                  type: "single",
                  prompt: "预习时更有效的做法是？",
                  options: JSON.stringify([
                    "只看答案",
                    "先标疑难点再听讲",
                    "完全不看课本",
                    "只抄标题",
                  ]),
                  answer: "先标疑难点再听讲",
                  explanation: "带着问题听讲，吸收效率更高。",
                  sortOrder: 1,
                },
              ],
            },
          },
        },
      },
    });
  }
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@kejing.local" },
    update: {},
    create: {
      email: "admin@kejing.local",
      name: "管理员",
      passwordHash,
      role: "admin",
    },
  });

  const studentHash = await bcrypt.hash("student123", 10);
  await prisma.user.upsert({
    where: { email: "student@kejing.local" },
    update: {},
    create: {
      email: "student@kejing.local",
      name: "示例学生",
      passwordHash: studentHash,
      role: "student",
    },
  });
}

async function main() {
  await seedUsers();
  await upsertSubjectTree();
  await seedSampleLessons();
  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
