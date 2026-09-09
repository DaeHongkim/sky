"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/recruit/ui/Button";

export default function ContractSeekerActions({
  contractId,
  status,
}: {
  contractId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function run(action: string) {
    setLoading(action);
    try {
      const res = await fetch(`/api/contracts/${contractId}/${action}`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  if (status === "VIEWED" || status === "SENT") {
    return (
      <Button size="sm" loading={loading === "agree"} onClick={() => run("agree")} className="mt-4">
        내용에 동의합니다
      </Button>
    );
  }

  if (status === "AGREED") {
    return (
      <Button
        size="sm"
        loading={loading === "sign"}
        onClick={() => {
          if (!confirm("서명하면 채용이 확정됩니다. 계속하시겠습니까?")) return;
          run("sign");
        }}
        className="mt-4"
      >
        서명하고 채용 확정하기
      </Button>
    );
  }

  return null;
}
