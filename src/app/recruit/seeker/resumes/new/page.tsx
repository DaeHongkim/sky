"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/recruit/ui/Input";
import Button from "@/components/recruit/ui/Button";

export default function NewResumePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "생성에 실패했습니다.");
        return;
      }
      router.push(`/recruit/seeker/resumes/${data.resume.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <h1 className="text-xl font-bold text-slate-900">새 이력서</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          id="title"
          label="이력서 제목"
          placeholder="예: 카페 서빙 지원용 이력서"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={loading} fullWidth>
          만들기
        </Button>
      </form>
    </div>
  );
}
