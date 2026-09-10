"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/recruit/ui/Button";

export default function ReportReviewControl({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function review(status: "REVIEWED" | "DISMISSED") {
    setLoading(status);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-2 flex gap-2">
      <Button size="sm" loading={loading === "REVIEWED"} onClick={() => review("REVIEWED")}>
        처리완료
      </Button>
      <Button
        size="sm"
        variant="secondary"
        loading={loading === "DISMISSED"}
        onClick={() => review("DISMISSED")}
      >
        기각
      </Button>
    </div>
  );
}
