"use client";

import { FormEvent, useState } from "react";
import Textarea from "@/components/recruit/ui/Textarea";
import Button from "@/components/recruit/ui/Button";

export default function ReportButton({
  targetType,
  targetId,
}: {
  targetType: "JOB_POST" | "USER" | "RESUME" | "MESSAGE";
  targetId: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "신고 접수에 실패했습니다.");
        return;
      }
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (done) return <p className="text-xs text-slate-500">신고가 접수되었습니다.</p>;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-slate-400 underline hover:text-slate-600"
      >
        신고하기
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3">
      <Textarea
        rows={3}
        required
        placeholder="신고 사유를 입력하세요."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" variant="danger" type="submit" loading={loading}>
          신고 제출
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={() => setOpen(false)}>
          취소
        </Button>
      </div>
    </form>
  );
}
