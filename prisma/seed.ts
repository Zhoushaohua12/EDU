import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  MIDDLE_GRADES,
  MIDDLE_SUBJECTS,
  PRIMARY_GRADES,
  PRIMARY_SUBJECTS,
  gradeLabel,
  subjectAllowed,
} from "../src/lib/curriculum";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

type CatalogBook = {
  stage: "primary" | "middle";
  grade: number;
  subjectSlug: string;
  subjectName: string;
  term: "upper" | "lower" | "full";
  termLabel: string;
  title: string;
  path: string;
  edition: string;
  githubUrl: string;
  rawUrl: string;
  sourceRepo: string;
};

type Catalog = {
  source: string;
  books: CatalogBook[];
};

function loadCatalog(): Catalog {
  const file = path.resolve(process.cwd(), "data/textbooks.json");
  return JSON.parse(fs.readFileSync(file, "utf8")) as Catalog;
}

function practiceFor(subjectSlug: string, grade: number, termLabel: string) {
  const common = [
    {
      type: "single" as const,
      prompt: `学习${gradeLabel(grade)}${termLabel}时，更有效的预习方式是？`,
      options: ["只看答案不看教材", "先通读目录再标出疑难点", "完全不打开课本", "只抄封面信息"],
      answer: "先通读目录再标出疑难点",
      explanation: "带着问题阅读教材，听课与自学效率更高。",
    },
  ];

  if (subjectSlug === "math") {
    common.push({
      type: "single" as const,
      prompt: "做数学习题时，发现不会的题应优先？",
      options: ["直接跳过以后也不看", "先回顾课本例题再尝试", "只记最终答案", "放弃本单元"],
      answer: "先回顾课本例题再尝试",
      explanation: "例题承载了本课核心方法，是解题的第一依据。",
    });
  } else if (subjectSlug === "chinese") {
    common.push({
      type: "single" as const,
      prompt: "语文阅读时，抓住段意较稳妥的做法是？",
      options: ["只抄一句原话", "找出陈述对象及其行为/特征", "只看插图", "只背生字表"],
      answer: "找出陈述对象及其行为/特征",
      explanation: "对象 + 行为/特征，概括更完整。",
    });
  } else if (subjectSlug === "english") {
    common.push({
      type: "single" as const,
      prompt: "英语单词记忆较有效的方法是？",
      options: ["只看中文不读音", "结合课文语境朗读拼写", "只抄一遍立刻丢掉", "只用拼音代替"],
      answer: "结合课文语境朗读拼写",
      explanation: "音、形、义结合，并放回语境中记忆更牢固。",
    });
  }

  return common;
}

function buildGuide(book: CatalogBook, source: string) {
  return [
    `## 电子教材`,
    `本课对接 ${book.edition}《${book.title}》。`,
    ``,
    `- 在 GitHub 打开：${book.githubUrl}`,
    `- 直接下载/预览：${book.rawUrl}`,
    `- 仓库路径：\`${book.path}\``,
    ``,
    `## 学习建议`,
    `1. 先浏览目录，明确本册章节安排。`,
    `2. 按单元精读正文与例题/课文，标记不懂处。`,
    `3. 完成课后练习后，回到本页提交导学自测。`,
    ``,
    `## 来源说明`,
    `教材 PDF 来自开源仓库 [${book.sourceRepo}](${source})。课径提供目录导航、导学与练习，请遵守当地法律法规与版权要求合理使用。`,
  ].join("\n");
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

async function upsertSubjectTree(catalog: Catalog) {
  const needed = new Map<string, { stage: "primary" | "middle"; grade: number; slug: string; name: string; sortOrder: number }>();

  for (const grade of PRIMARY_GRADES) {
    for (const subject of PRIMARY_SUBJECTS) {
      if (!subjectAllowed("primary", grade, subject.slug)) continue;
      needed.set(`primary:${grade}:${subject.slug}`, {
        stage: "primary",
        grade,
        slug: subject.slug,
        name: subject.name,
        sortOrder: subject.sortOrder,
      });
    }
  }
  for (const grade of MIDDLE_GRADES) {
    for (const subject of MIDDLE_SUBJECTS) {
      if (!subjectAllowed("middle", grade, subject.slug)) continue;
      needed.set(`middle:${grade}:${subject.slug}`, {
        stage: "middle",
        grade,
        slug: subject.slug,
        name: subject.name,
        sortOrder: subject.sortOrder,
      });
    }
  }

  // Ensure subjects that appear in catalog exist even if not in default lists
  for (const book of catalog.books) {
    const key = `${book.stage}:${book.grade}:${book.subjectSlug}`;
    if (!needed.has(key)) {
      needed.set(key, {
        stage: book.stage,
        grade: book.grade,
        slug: book.subjectSlug,
        name: book.subjectName,
        sortOrder: 50,
      });
    }
  }

  for (const subject of needed.values()) {
    await prisma.subject.upsert({
      where: {
        stage_grade_slug: {
          stage: subject.stage,
          grade: subject.grade,
          slug: subject.slug,
        },
      },
      update: { name: subject.name, sortOrder: subject.sortOrder },
      create: subject,
    });
  }
}

async function seedFromCatalog(catalog: Catalog) {
  // Replace curriculum content while keeping users/progress cleaned via cascade on lessons
  await prisma.progress.deleteMany();
  await prisma.question.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.unit.deleteMany();

  for (const book of catalog.books) {
    if (!subjectAllowed(book.stage, book.grade, book.subjectSlug)) {
      // still import PE/science etc. that we allow via catalog
    }

    const subject = await prisma.subject.findUnique({
      where: {
        stage_grade_slug: {
          stage: book.stage,
          grade: book.grade,
          slug: book.subjectSlug,
        },
      },
    });
    if (!subject) continue;

    const unitTitle = `${book.termLabel} · ${book.edition}`;
    const sortOrder = book.term === "upper" ? 1 : book.term === "lower" ? 2 : 1;

    const unit = await prisma.unit.create({
      data: {
        subjectId: subject.id,
        title: unitTitle,
        sortOrder,
      },
    });

    const questions = practiceFor(book.subjectSlug, book.grade, book.termLabel);

    await prisma.lesson.create({
      data: {
        unitId: unit.id,
        title: book.title,
        summary: `人教/统编电子教材《${book.title}》，来源 ChinaTextbook。`,
        guide: buildGuide(book, catalog.source),
        sourceUrl: book.githubUrl,
        sourceRawUrl: book.rawUrl,
        sourcePath: book.path,
        sourceRepo: book.sourceRepo,
        sortOrder: 1,
        questions: {
          create: questions.map((q, i) => ({
            type: q.type,
            prompt: q.prompt,
            options: q.options ? JSON.stringify(q.options) : null,
            answer: q.answer,
            explanation: q.explanation,
            sortOrder: i + 1,
          })),
        },
      },
    });
  }
}

async function main() {
  const catalog = loadCatalog();
  console.log(`Loading ${catalog.books.length} textbooks from ${catalog.source}`);
  await seedUsers();
  await upsertSubjectTree(catalog);
  await seedFromCatalog(catalog);
  const counts = await prisma.lesson.count();
  console.log(`Seed completed. Lessons: ${counts}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
