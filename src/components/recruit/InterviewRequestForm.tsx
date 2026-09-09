"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/recruit/ui/Input";
import Select from "@/components/recruit/ui/Select";
import Button from "@/components/recruit/ui/Button";

export default function InterviewRequestForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [interviewType, setInterviewType] = useState("ONLINE");
  const [scheduledAt, setScheduledAt] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewType,
          scheduledAt: new Date(scheduledAt).toISOString(),
          meetingUrl: meetingUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "면접 요청에 실패했습니다.");
        return;
      }
      setSent(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (sent) return <p className="mt-2 text-xs text-emerald-600">면접 요청을 보냈습니다.</p>;

  if (!open) {
    return (
      <Button size="sm" variant="secondary" type="button" onClick={() => setOpen(true)} className="mt-2">
        면접 요청
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2 rounded-lg border border-slate-200 p-3">
      <div className="grid grid-cols-2 gap-2">
        <Select value={interviewType} onChange={(e) => setInterviewType(e.target.value)}>
          <option value="ONLINE">화상면접</option>
          <option value="OFFLINE">대면면접</option>
          <option value="PHONE">전화면접</option>
        </Select>
        <Input type="datetime-local" required value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
      </div>
      <Input placeholder="화상면접 URL (선택)" value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)} />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" type="submit" loading={loading}>
          제안 보내기
        </Button>
        <Button size="sm" type="button" variant="ghost" onClick={() => setOpen(false)}>
          취소
        </Button>
      </div>
    </form>
  );
}
