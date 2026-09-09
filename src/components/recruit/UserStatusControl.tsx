"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/recruit/ui/Button";

export default function UserStatusControl({
  userId,
  currentStatus,
}: {
  userId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    if (next === "SUSPENDED" && !confirm("이 계정을 정지하시겠습니까?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant={currentStatus === "SUSPENDED" ? "primary" : "danger"}
      loading={loading}
      onClick={toggle}
    >
      {currentStatus === "SUSPENDED" ? "정지 해제" : "계정 정지"}
    </Button>
  );
}
