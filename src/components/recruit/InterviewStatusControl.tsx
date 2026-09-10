"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/recruit/ui/Button";

export default function InterviewStatusControl({
  interviewId,
  actions,
}: {
  interviewId: string;
  actions: { status: string; label: string; variant?: "primary" | "secondary" | "danger" }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function setStatus(status: string) {
    setLoading(status);
    try {
      const res = await fetch(`/api/interviews/${interviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  if (actions.length === 0) return null;

  return (
    <div className="mt-3 flex gap-2">
      {actions.map((a) => (
        <Button
          key={a.status}
          size="sm"
          variant={a.variant ?? "secondary"}
          loading={loading === a.status}
          onClick={() => setStatus(a.status)}
        >
          {a.label}
        </Button>
      ))}
    </div>
  );
}
