#!/usr/bin/env node
/**
 * Rebuild data/textbooks.json from Zhoushaohua12/ChinaTextbook GitHub tree.
 * Usage: node scripts/build-textbook-catalog.mjs
 */
import fs from "node:fs";
import path from "node:path";

const OWNER = "Zhoushaohua12";
const REPO = "ChinaTextbook";
const BRANCH = "master";
const OUT = path.resolve("data/textbooks.json");

const GRADE_WORDS = {
  一年级: 1,
  二年级: 2,
  三年级: 3,
  四年级: 4,
  五年级: 5,
  六年级: 6,
  七年级: 7,
  八年级: 8,
  九年级: 9,
};

const SUBJECT_MAP = {
  语文: "chinese",
  数学: "math",
  英语: "english",
  物理: "physics",
  化学: "chemistry",
  历史: "history",
  地理: "geography",
  道德与法治: "morality",
  生物学: "biology",
  科学: "science",
  音乐: "music",
  美术: "art",
  体育与健康: "pe",
};

function encodeRepoPath(p) {
  return p.split("/").map(encodeURIComponent).join("/");
}

function detectGrades(name, folderGrade) {
  const range = name.match(/(\d)\s*至\s*(\d)\s*年级/);
  if (range) {
    const out = [];
    for (let g = Number(range[1]); g <= Number(range[2]); g++) out.push(g);
    return out;
  }
  // Prefer explicit N年级 that is not part of “N年级起点”
  const cleaned = name.replace(/[一二三四五六七八九]年级起点/g, "");
  for (const [word, g] of Object.entries(GRADE_WORDS)) {
    if (cleaned.includes(word)) return [g];
  }
  if (folderGrade) {
    for (const [word, g] of Object.entries(GRADE_WORDS)) {
      if (folderGrade.includes(word)) return [g];
    }
  }
  return [];
}

function detectTerm(name) {
  if (name.includes("全一册")) return "full";
  if (name.includes("上册")) return "upper";
  if (name.includes("下册")) return "lower";
  return "full";
}

function termLabel(term) {
  return term === "upper" ? "上册" : term === "lower" ? "下册" : "全一册";
}

function priority(filePath, subjectZh) {
  if (subjectZh === "英语") {
    if (filePath.includes("精通")) return 10;
    if (filePath.includes("一年级起点")) return 90;
    if (filePath.includes("PEP") || filePath.includes("三年级起点")) return 100;
  }
  if (subjectZh === "音乐") {
    if (filePath.includes("简谱")) return 100;
    if (filePath.includes("五线谱")) return 40;
  }
  if (filePath.includes("人教") || filePath.includes("统编")) return 80;
  return 50;
}

const res = await fetch(
  `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`,
  { headers: { "User-Agent": "kejing-edu-catalog" } },
);
if (!res.ok) {
  console.error("GitHub API failed", res.status, await res.text());
  process.exit(1);
}
const tree = await res.json();
const paths = tree.tree
  .filter((n) => n.type === "blob")
  .map((n) => n.path)
  .filter((p) => /^(小学|初中)\//.test(p))
  .filter((p) => /人教|统编/.test(p))
  .filter((p) => /\.pdf$/i.test(p))
  .filter((p) => !/_merge_folder|\.pdf\.\d+$/i.test(p))
  .filter((p) => !/地理图册|教师|教参|练习/.test(p));

const items = [];
for (const filePath of paths) {
  const parts = filePath.split("/");
  const stageZh = parts[0];
  const subjectZh = parts[1];
  const slug = SUBJECT_MAP[subjectZh];
  if (!slug) continue;

  const fileName = parts[parts.length - 1];
  let folderGrade = null;
  for (const part of parts) {
    if (/[一二三四五六七八九]年级/.test(part)) folderGrade = part;
  }
  const grades = detectGrades(fileName, folderGrade);
  if (!grades.length) continue;

  const term = detectTerm(fileName);
  const stage = stageZh === "小学" ? "primary" : "middle";
  const title = fileName.replace(/\.pdf$/i, "").replace(/^义务教育教科书\s*·\s*/, "").trim();
  const encoded = encodeRepoPath(filePath);

  for (const grade of grades) {
    if (slug === "english" && stage === "primary") {
      if (grade <= 2 && !filePath.includes("一年级起点")) continue;
      if (grade >= 3 && filePath.includes("一年级起点")) continue;
      if (grade >= 3 && filePath.includes("精通")) continue;
    }
    if (slug === "music" && filePath.includes("五线谱")) continue;

    items.push({
      stage,
      grade,
      subjectSlug: slug,
      subjectName: subjectZh === "生物学" ? "生物" : subjectZh,
      term,
      termLabel: termLabel(term),
      title,
      path: filePath,
      edition: parts.find((p) => p.includes("人教") || p.includes("统编")) || "人教版",
      githubUrl: `https://github.com/${OWNER}/${REPO}/blob/${BRANCH}/${encoded}`,
      rawUrl: `https://github.com/${OWNER}/${REPO}/raw/${BRANCH}/${encoded}`,
      priority: priority(filePath, subjectZh),
      sourceRepo: `${OWNER}/${REPO}`,
    });
  }
}

const best = new Map();
for (const item of items) {
  const key = `${item.stage}:${item.grade}:${item.subjectSlug}:${item.term}`;
  const prev = best.get(key);
  if (!prev || item.priority > prev.priority) best.set(key, item);
}

const books = [...best.values()].sort(
  (a, b) =>
    a.stage.localeCompare(b.stage) ||
    a.grade - b.grade ||
    a.subjectSlug.localeCompare(b.subjectSlug) ||
    a.term.localeCompare(b.term),
);

const out = {
  generatedAt: new Date().toISOString(),
  source: `https://github.com/${OWNER}/${REPO}`,
  count: books.length,
  books,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(`Wrote ${books.length} books to ${OUT}`);
