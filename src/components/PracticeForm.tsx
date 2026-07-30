"use client";

import { useState, useTransition } from "react";
import { submitPracticeAction } from "@/app/actions/progress";

type Question = {
  id: string;
  type: "single" | "fill";
  prompt: string;
  options: string[];
};

type Result = {
  score: number;
  total: number;
  details: {
    questionId: string;
    correct: boolean;
    expected: string;
    explanation: string;
  }[];
  requiresLogin?: boolean;
};

export function PracticeForm({
  lessonId,
  questions,
}: {
  lessonId: string;
  questions: Question[];
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await submitPracticeAction(lessonId, formData);
      if ("error" in res) {
        setError(res.error ?? "提交失败");
        return;
      }
      setResult(res);
    });
  }

  return (
    <form action={onSubmit} style={{ marginTop: "0.75rem" }}>
      {questions.map((q, index) => (
        <div key={q.id} className="question">
          <p>
            <strong>
              {index + 1}. {q.prompt}
            </strong>
          </p>
          {q.type === "single" ? (
            <div className="options">
              {q.options.map((opt) => (
                <label key={opt}>
                  <input type="radio" name={q.id} value={opt} required />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          ) : (
            <input
              name={q.id}
              required
              placeholder="填写答案"
              style={{
                marginTop: "0.6rem",
                width: "100%",
                maxWidth: 360,
                border: "1px solid var(--line)",
                borderRadius: 10,
                padding: "0.65rem 0.75rem",
                background: "rgba(255,255,255,0.55)",
              }}
            />
          )}
          {result ? (
            <p className={result.details.find((d) => d.questionId === q.id)?.correct ? "success" : "alert"} style={{ marginTop: "0.7rem" }}>
              {result.details.find((d) => d.questionId === q.id)?.correct
                ? "回答正确"
                : `参考答案：${result.details.find((d) => d.questionId === q.id)?.expected}`}
              <br />
              <span className="muted">
                {result.details.find((d) => d.questionId === q.id)?.explanation}
              </span>
            </p>
          ) : null}
        </div>
      ))}

      {error ? <p className="alert">{error}</p> : null}
      {result ? (
        <p className="success">
          得分 {result.score} / {result.total}
          {result.requiresLogin ? "（未登录，成绩未写入云端）" : "（已保存进度）"}
        </p>
      ) : null}

      <button className="btn btn-primary" type="submit" disabled={pending} style={{ marginTop: "1rem" }}>
        {pending ? "提交中…" : "提交练习"}
      </button>
    </form>
  );
}
