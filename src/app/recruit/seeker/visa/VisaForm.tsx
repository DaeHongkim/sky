"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/recruit/ui/Input";
import Button from "@/components/recruit/ui/Button";

export default function VisaForm({
  initial,
}: {
  initial: { visaType: string; visaStatus: string; issueDate: string; expiryDate: string };
}) {
  const router = useRouter();
  const [visaType, setVisaType] = useState(initial.visaType);
  const [visaStatus, setVisaStatus] = useState(initial.visaStatus);
  const [issueDate, setIssueDate] = useState(initial.issueDate);
  const [expiryDate, setExpiryDate] = useState(initial.expiryDate);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      const res = await fetch("/api/seeker/visa", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visaType,
          visaStatus,
          issueDate: issueDate || null,
          expiryDate: expiryDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "저장에 실패했습니다.");
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input id="visaType" label="비자 종류" required value={visaType} onChange={(e) => setVisaType(e.target.value)} placeholder="예: E-9, H-2, F-4" />
      <Input id="visaStatus" label="체류 상태" required value={visaStatus} onChange={(e) => setVisaStatus(e.target.value)} placeholder="예: 재류중" />
      <div className="grid grid-cols-2 gap-3">
        <Input id="issueDate" label="발급일" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
        <Input id="expiryDate" label="만료일" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-emerald-600">저장되었습니다. 취업 허용 여부는 관리자 확인 후 반영됩니다.</p>}
      <Button type="submit" loading={loading}>
        저장
      </Button>
    </form>
  );
}
