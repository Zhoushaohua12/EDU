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

type Catalog = { source: string; books: CatalogBook[] };

type BankQuestion = {
  type: "single" | "fill" | "judge";
  prompt: string;
  answer: string;
  explanation: string;
  options?: string[];
};

type BankBook = {
  title: string;
  topics: string[];
  questions: BankQuestion[];
};

function loadCatalog(): Catalog {
  return JSON.parse(fs.readFileSync(path.resolve("data/textbooks.json"), "utf8")) as Catalog;
}

function loadTopics() {
  return JSON.parse(fs.readFileSync(path.resolve("data/topics.json"), "utf8")) as {
    topics: Record<string, string[]>;
  };
}

function loadBank() {
  return JSON.parse(fs.readFileSync(path.resolve("data/question-bank.json"), "utf8")) as {
    books: Record<string, BankBook>;
  };
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
    `2. 按下方章节课时逐课练习（单选 / 判断 / 填空）。`,
    `3. 结合电子教材例题与课文巩固后再提交自测。`,
    ``,
    `## 来源说明`,
    `教材 PDF 来自开源仓库 [${book.sourceRepo}](${source})。题库依据 PDF 目录与人教版课标知识点原创编写，不照搬课文原文。`,
  ].join("\n");
}

function chapterGuide(topic: string, book: CatalogBook) {
  return [
    `## 章节练习：${topic}`,
    `对应教材《${book.title}》。`,
    ``,
    `### 建议`,
    `1. 先阅读教材中本单元/章节内容。`,
    `2. 完成单选、判断、填空题。`,
    `3. 错题记录到笔记本，回看教材例题。`,
    ``,
    book.githubUrl ? `电子教材：[打开 PDF](${book.githubUrl})` : "",
  ].join("\n");
}

function questionCreates(questions: BankQuestion[]) {
  return questions.map((q, i) => ({
    type: q.type,
    prompt: q.prompt,
    options: q.options ? JSON.stringify(q.options) : q.type === "judge" ? JSON.stringify(["正确", "错误"]) : null,
    answer: q.answer,
    explanation: q.explanation,
    sortOrder: i + 1,
  }));
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
  const needed = new Map<
    string,
    { stage: "primary" | "middle"; grade: number; slug: string; name: string; sortOrder: number }
  >();

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

function splitQuestionsByTopic(topics: string[], questions: BankQuestion[]) {
  const overview = questions.slice(0, 2);
  const rest = questions.slice(2);
  const perTopic = Math.max(2, Math.ceil(rest.length / Math.max(topics.length, 1)));
  const chapters: { topic: string; questions: BankQuestion[] }[] = [];
  let cursor = 0;
  for (const topic of topics.slice(0, 8)) {
    const chunk = rest.slice(cursor, cursor + perTopic);
    cursor += perTopic;
    if (chunk.length === 0) break;
    chapters.push({ topic, questions: chunk });
  }
  if (cursor < rest.length && chapters.length) {
    chapters[chapters.length - 1].questions.push(...rest.slice(cursor));
  }
  return { overview, chapters };
}

async function seedFromCatalog(catalog: Catalog) {
  const topicsData = loadTopics();
  const bank = loadBank();

  await prisma.progress.deleteMany();
  await prisma.question.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.unit.deleteMany();

  let lessonCount = 0;
  let questionCount = 0;

  for (const book of catalog.books) {
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

    const key = `${book.stage}-${book.grade}-${book.subjectSlug}-${book.term}`;
    const unitTitle = `${book.termLabel} · ${book.edition}`;
    const sortOrder = book.term === "upper" ? 1 : book.term === "lower" ? 2 : 1;

    const unit = await prisma.unit.create({
      data: {
        subjectId: subject.id,
        title: unitTitle,
        sortOrder,
      },
    });

    const bankBook = bank.books[key];
    const topics = topicsData.topics[key] || bankBook?.topics || [`${book.termLabel}综合`];
    const allQuestions = bankBook?.questions || [];
    const { overview, chapters } = splitQuestionsByTopic(topics, allQuestions);

    await prisma.lesson.create({
      data: {
        unitId: unit.id,
        title: `电子教材 · ${book.title}`,
        summary: `打开 ChinaTextbook 中的《${book.title}》，并完成导读自测。`,
        guide: buildGuide(book, catalog.source),
        sourceUrl: book.githubUrl,
        sourceRawUrl: book.rawUrl,
        sourcePath: book.path,
        sourceRepo: book.sourceRepo,
        sortOrder: 1,
        questions: { create: questionCreates(overview.length ? overview : allQuestions.slice(0, 3)) },
      },
    });
    lessonCount += 1;
    questionCount += overview.length || Math.min(3, allQuestions.length);

    let chapterOrder = 2;
    for (const chapter of chapters) {
      await prisma.lesson.create({
        data: {
          unitId: unit.id,
          title: chapter.topic,
          summary: `《${book.title}》章节练习：${chapter.topic}`,
          guide: chapterGuide(chapter.topic, book),
          sourceUrl: book.githubUrl,
          sourceRawUrl: book.rawUrl,
          sourcePath: book.path,
          sourceRepo: book.sourceRepo,
          sortOrder: chapterOrder++,
          questions: { create: questionCreates(chapter.questions) },
        },
      });
      lessonCount += 1;
      questionCount += chapter.questions.length;
    }
  }

  console.log(`Seeded lessons=${lessonCount}, questions≈${questionCount}`);
}

async function main() {
  const catalog = loadCatalog();
  console.log(`Loading ${catalog.books.length} textbooks from ${catalog.source}`);
  await seedUsers();
  await upsertSubjectTree(catalog);
  await seedFromCatalog(catalog);
  const [lessons, questions] = await Promise.all([
    prisma.lesson.count(),
    prisma.question.count(),
  ]);
  console.log(`Seed completed. Lessons: ${lessons}, Questions: ${questions}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
