"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/recruit/ui/Button";

export default function WithdrawButton({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleWithdraw() {
    if (!confirm("지원을 취소하시겠습니까?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/withdraw`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="danger" size="sm" loading={loading} onClick={handleWithdraw}>
      지원취소
    </Button>
  );
}
