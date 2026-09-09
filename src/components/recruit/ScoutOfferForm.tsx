"use client";

import { FormEvent, useState } from "react";
import Input from "@/components/recruit/ui/Input";
import Textarea from "@/components/recruit/ui/Textarea";
import Button from "@/components/recruit/ui/Button";
import Card from "@/components/recruit/ui/Card";

export default function ScoutOfferForm({ jobSeekerId }: { jobSeekerId: string }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/scout-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobSeekerId, title, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "전송에 실패했습니다.");
        return;
      }
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">스카우트 제안을 보냈습니다.</p>;
  }

  return (
    <Card>
      <h2 className="mb-3 font-semibold text-slate-900">스카우트 제안 보내기</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          id="scoutTitle"
          label="제목"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 카페 매니저 포지션 제안드립니다"
        />
        <Textarea
          id="scoutMessage"
          label="메시지"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={loading}>
          제안 보내기
        </Button>
      </form>
    </Card>
  );
}
