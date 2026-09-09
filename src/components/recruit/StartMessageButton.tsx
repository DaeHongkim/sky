"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/recruit/ui/Button";

export default function StartMessageButton({
  applicationId,
  role,
}: {
  applicationId: string;
  role: "JOB_SEEKER" | "COMPANY";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
      const data = await res.json();
      if (res.ok) {
        const base = role === "COMPANY" ? "/recruit/company/messages" : "/recruit/seeker/messages";
        router.push(`${base}/${data.conversation.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="secondary" loading={loading} onClick={handleClick}>
      메시지
    </Button>
  );
}
