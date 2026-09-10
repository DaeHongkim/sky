"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Select from "@/components/recruit/ui/Select";
import Button from "@/components/recruit/ui/Button";

export default function VisaVerifyControl({
  userId,
  currentStatus,
  currentAllowed,
}: {
  userId: string;
  currentStatus: string;
  currentAllowed: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [allowed, setAllowed] = useState(currentAllowed);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/visa/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus: status, employmentAllowed: allowed }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
      <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-56">
        <option value="AI_ESTIMATED">AI 예상</option>
        <option value="NEEDS_OFFICIAL_CHECK">공식 확인 필요</option>
        <option value="ADMIN_VERIFIED">관리자 확인 완료</option>
      </Select>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={allowed} onChange={(e) => setAllowed(e.target.checked)} />
        취업 허용
      </label>
      <Button size="sm" loading={loading} onClick={handleSave}>
        저장
      </Button>
    </div>
  );
}
