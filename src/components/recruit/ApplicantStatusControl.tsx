"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Select from "@/components/recruit/ui/Select";
import Button from "@/components/recruit/ui/Button";

const statusOptions = [
  { value: "APPLIED", label: "지원완료" },
  { value: "DOCUMENT_REVIEW", label: "서류검토중" },
  { value: "INTERVIEW_REQUESTED", label: "면접요청" },
  { value: "INTERVIEW_SCHEDULED", label: "면접확정" },
  { value: "INTERVIEW_COMPLETED", label: "면접완료" },
  { value: "OFFER", label: "오퍼제안" },
  { value: "HIRED", label: "채용확정" },
  { value: "REJECTED", label: "불합격" },
];

export default function ApplicantStatusControl({
  applicationId,
  currentStatus,
  currentMemo,
}: {
  applicationId: string;
  currentStatus: string;
  currentMemo: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [memo, setMemo] = useState(currentMemo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTerminal = ["HIRED", "REJECTED", "WITHDRAWN"].includes(currentStatus);

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, memo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "변경에 실패했습니다.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (isTerminal) {
    return <p className="text-xs text-slate-400">종료된 지원 건입니다.</p>;
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-44">
        {statusOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
      <input
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="메모 (선택)"
        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
      />
      <Button size="sm" loading={loading} onClick={handleSave}>
        저장
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
