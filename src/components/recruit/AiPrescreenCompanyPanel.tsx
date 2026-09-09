"use client";

import { useEffect, useState } from "react";
import Button from "@/components/recruit/ui/Button";

interface PrescreenResult {
  questions: string[];
  answers: string[];
  summary: string | null;
  keyExperiences: string | null;
  needsVerification: string | null;
}

export default function AiPrescreenCompanyPanel({ interviewId }: { interviewId: string }) {
  const [result, setResult] = useState<PrescreenResult | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  function load() {
    fetch(`/api/interviews/${interviewId}/prescreen`)
      .then((res) => res.json())
      .then((data) => setResult(data.result));
  }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/interviews/${interviewId}/prescreen`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setResult(data.result);
      });
    return () => {
      cancelled = true;
    };
  }, [interviewId]);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/interviews/${interviewId}/prescreen/generate`, {
        method: "POST",
      });
      if (res.ok) load();
    } finally {
      setLoading(false);
    }
  }

  if (result === undefined) return null;

  if (!result) {
    return (
      <div className="mt-2">
        <Button size="sm" variant="secondary" loading={loading} onClick={generate}>
          AI 사전면접 질문 생성
        </Button>
      </div>
    );
  }

  if (result.answers.length === 0) {
    return <p className="mt-2 text-xs text-slate-400">구직자의 답변 대기중입니다.</p>;
  }

  return (
    <div className="mt-2 flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
      <p className="text-xs font-medium text-amber-700">
        AI 요약 (참고용 — 최종 채용 판단은 담당자가 직접 내려야 합니다)
      </p>
      <p className="text-slate-700">{result.summary}</p>
      {result.keyExperiences && (
        <p className="text-slate-600">
          <span className="font-medium">주요 경험: </span>
          {result.keyExperiences}
        </p>
      )}
      {result.needsVerification && (
        <p className="text-amber-700">
          <span className="font-medium">확인 필요: </span>
          {result.needsVerification}
        </p>
      )}
    </div>
  );
}
