"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Textarea from "@/components/recruit/ui/Textarea";
import Button from "@/components/recruit/ui/Button";

export default function CreateContractButton({ jobOfferId }: { jobOfferId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/job-offers/${jobOfferId}/contracts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentOriginal: content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "계약서 작성에 실패했습니다.");
        return;
      }
      router.push(`/recruit/company/contracts/${data.contract.id}`);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)} className="mt-3">
        계약서 작성
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
      <Textarea
        rows={6}
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="근로계약서 원문 내용을 입력하세요 (근무조건, 급여, 근무시간 등)"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" type="submit" loading={loading}>
          임시저장으로 작성
        </Button>
        <Button size="sm" type="button" variant="ghost" onClick={() => setOpen(false)}>
          취소
        </Button>
      </div>
    </form>
  );
}
