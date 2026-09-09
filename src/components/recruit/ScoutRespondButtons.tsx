"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/recruit/ui/Button";

export default function ScoutRespondButtons({ offerId }: { offerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function respond(action: "ACCEPT" | "DECLINE") {
    setLoading(action);
    try {
      const res = await fetch(`/api/scout-offers/${offerId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-3 flex gap-2">
      <Button size="sm" loading={loading === "ACCEPT"} onClick={() => respond("ACCEPT")}>
        수락
      </Button>
      <Button
        size="sm"
        variant="secondary"
        loading={loading === "DECLINE"}
        onClick={() => respond("DECLINE")}
      >
        거절
      </Button>
    </div>
  );
}
