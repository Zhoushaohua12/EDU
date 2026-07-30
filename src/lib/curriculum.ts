export const GRADE_LABELS: Record<number, string> = {
  1: "一年级",
  2: "二年级",
  3: "三年级",
  4: "四年级",
  5: "五年级",
  6: "六年级",
  7: "七年级",
  8: "八年级",
  9: "九年级",
};

export const PRIMARY_GRADES = [1, 2, 3, 4, 5, 6] as const;
export const MIDDLE_GRADES = [7, 8, 9] as const;

export const PRIMARY_SUBJECTS = [
  { slug: "chinese", name: "语文", sortOrder: 1 },
  { slug: "math", name: "数学", sortOrder: 2 },
  { slug: "english", name: "英语", sortOrder: 3 },
  { slug: "morality", name: "道德与法治", sortOrder: 4 },
  { slug: "science", name: "科学", sortOrder: 5 },
  { slug: "music", name: "音乐", sortOrder: 6 },
  { slug: "art", name: "美术", sortOrder: 7 },
  { slug: "pe", name: "体育与健康", sortOrder: 8 },
] as const;

export const MIDDLE_SUBJECTS = [
  { slug: "chinese", name: "语文", sortOrder: 1 },
  { slug: "math", name: "数学", sortOrder: 2 },
  { slug: "english", name: "英语", sortOrder: 3 },
  { slug: "physics", name: "物理", sortOrder: 4 },
  { slug: "chemistry", name: "化学", sortOrder: 5 },
  { slug: "biology", name: "生物", sortOrder: 6 },
  { slug: "history", name: "历史", sortOrder: 7 },
  { slug: "geography", name: "地理", sortOrder: 8 },
  { slug: "morality", name: "道德与法治", sortOrder: 9 },
  { slug: "music", name: "音乐", sortOrder: 10 },
  { slug: "art", name: "美术", sortOrder: 11 },
  { slug: "pe", name: "体育与健康", sortOrder: 12 },
] as const;

export function stageFromGrade(grade: number): "primary" | "middle" {
  return grade <= 6 ? "primary" : "middle";
}

export function gradeLabel(grade: number) {
  return GRADE_LABELS[grade] ?? `${grade}年级`;
}

export function subjectAllowed(stage: "primary" | "middle", grade: number, slug: string) {
  if (stage === "primary") {
    if (slug === "english" && grade < 1) return false;
    return PRIMARY_SUBJECTS.some((s) => s.slug === slug);
  }
  if (slug === "physics" && grade < 8) return false;
  if (slug === "chemistry" && grade < 9) return false;
  if (slug === "biology" && grade > 8) return false;
  if (slug === "geography" && grade > 8) return false;
  return MIDDLE_SUBJECTS.some((s) => s.slug === slug);
}
