"use client";

import { useEffect, useState } from "react";
import Textarea from "@/components/recruit/ui/Textarea";
import Button from "@/components/recruit/ui/Button";

interface PrescreenResult {
  questions: string[];
  answers: string[];
}

export default function AiPrescreenSeekerPanel({ interviewId }: { interviewId: string }) {
  const [result, setResult] = useState<PrescreenResult | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/interviews/${interviewId}/prescreen`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data.result) return;
        setResult(data.result);
        setAnswers(new Array(data.result.questions.length).fill(""));
        if (data.result.answers?.length > 0) setSubmitted(true);
      });
    return () => {
      cancelled = true;
    };
  }, [interviewId]);

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch(`/api/interviews/${interviewId}/prescreen/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (res.ok) setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (!result) return null;
  if (submitted) {
    return (
      <p className="mt-2 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-700">
        AI 사전면접 답변을 제출했습니다.
      </p>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-3 rounded-lg border border-slate-200 p-3">
      <p className="text-xs text-slate-500">AI 사전면접 질문에 답변해주세요.</p>
      {result.questions.map((q, i) => (
        <div key={i} className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">{q}</label>
          <Textarea
            rows={2}
            value={answers[i] ?? ""}
            onChange={(e) =>
              setAnswers((prev) => prev.map((a, idx) => (idx === i ? e.target.value : a)))
            }
          />
        </div>
      ))}
      <Button size="sm" loading={loading} onClick={handleSubmit}>
        답변 제출
      </Button>
    </div>
  );
}
