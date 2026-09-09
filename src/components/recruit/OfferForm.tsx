"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/recruit/ui/Input";
import Select from "@/components/recruit/ui/Select";
import Textarea from "@/components/recruit/ui/Textarea";
import Button from "@/components/recruit/ui/Button";

export default function OfferForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [salary, setSalary] = useState("");
  const [employmentType, setEmploymentType] = useState("FULL_TIME");
  const [workLocation, setWorkLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [benefits, setBenefits] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salary: Number(salary),
          employmentType,
          workLocation,
          startDate: startDate || null,
          benefits: benefits || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Offer 전송에 실패했습니다.");
        return;
      }
      setSent(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (sent) return <p className="mt-2 text-xs text-emerald-600">Offer를 보냈습니다.</p>;

  if (!open) {
    return (
      <Button size="sm" variant="secondary" type="button" onClick={() => setOpen(true)} className="mt-2">
        Offer 보내기
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2 rounded-lg border border-slate-200 p-3">
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" placeholder="급여" required value={salary} onChange={(e) => setSalary(e.target.value)} />
        <Select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
          <option value="FULL_TIME">정규직</option>
          <option value="PART_TIME">파트타임</option>
          <option value="CONTRACT">계약직</option>
          <option value="DAILY">일용직</option>
          <option value="INTERNSHIP">인턴</option>
          <option value="FREELANCE">프리랜서</option>
        </Select>
        <Input placeholder="근무지" required value={workLocation} onChange={(e) => setWorkLocation(e.target.value)} />
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>
      <Textarea placeholder="복리후생 (선택)" rows={2} value={benefits} onChange={(e) => setBenefits(e.target.value)} />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" type="submit" loading={loading}>
          Offer 보내기
        </Button>
        <Button size="sm" type="button" variant="ghost" onClick={() => setOpen(false)}>
          취소
        </Button>
      </div>
    </form>
  );
}
