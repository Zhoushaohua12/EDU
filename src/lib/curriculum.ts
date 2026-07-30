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
] as const;

export const MIDDLE_SUBJECTS = [
  { slug: "chinese", name: "语文", sortOrder: 1 },
  { slug: "math", name: "数学", sortOrder: 2 },
  { slug: "english", name: "英语", sortOrder: 3 },
  { slug: "physics", name: "物理", sortOrder: 4 },
  { slug: "chemistry", name: "化学", sortOrder: 5 },
  { slug: "history", name: "历史", sortOrder: 6 },
  { slug: "geography", name: "地理", sortOrder: 7 },
  { slug: "morality", name: "道德与法治", sortOrder: 8 },
] as const;

export function stageFromGrade(grade: number): "primary" | "middle" {
  return grade <= 6 ? "primary" : "middle";
}

export function gradeLabel(grade: number) {
  return GRADE_LABELS[grade] ?? `${grade}年级`;
}
