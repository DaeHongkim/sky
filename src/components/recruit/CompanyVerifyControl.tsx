"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/recruit/ui/Button";

export default function CompanyVerifyControl({
  userId,
  currentStatus,
}: {
  userId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function setStatus(status: string) {
    setLoading(status);
    try {
      const res = await fetch(`/api/admin/companies/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus: status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-3 flex gap-2">
      {currentStatus !== "VERIFIED" && (
        <Button size="sm" loading={loading === "VERIFIED"} onClick={() => setStatus("VERIFIED")}>
          인증승인
        </Button>
      )}
      {currentStatus !== "REJECTED" && (
        <Button
          size="sm"
          variant="danger"
          loading={loading === "REJECTED"}
          onClick={() => setStatus("REJECTED")}
        >
          거절
        </Button>
      )}
      {currentStatus !== "PENDING" && (
        <Button
          size="sm"
          variant="secondary"
          loading={loading === "PENDING"}
          onClick={() => setStatus("PENDING")}
        >
          대기로 되돌리기
        </Button>
      )}
    </div>
  );
}
