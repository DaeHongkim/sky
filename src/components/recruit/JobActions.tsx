"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/recruit/ui/Button";

export default function JobActions({
  jobId,
  status,
}: {
  jobId: string;
  status: "DRAFT" | "OPEN" | "CLOSED" | "EXPIRED";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: string, fn: () => Promise<Response>) {
    setLoading(action);
    setError(null);
    try {
      const res = await fn();
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "요청에 실패했습니다.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  function patchStatus(nextStatus: string) {
    return run(nextStatus, () =>
      fetch(`/api/company/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {status === "DRAFT" && (
          <Button size="sm" loading={loading === "OPEN"} onClick={() => patchStatus("OPEN")}>
            게시하기
          </Button>
        )}
        {status === "OPEN" && (
          <Button
            size="sm"
            variant="secondary"
            loading={loading === "CLOSED"}
            onClick={() => patchStatus("CLOSED")}
          >
            마감하기
          </Button>
        )}
        {(status === "CLOSED" || status === "EXPIRED") && (
          <Button size="sm" loading={loading === "OPEN"} onClick={() => patchStatus("OPEN")}>
            재오픈
          </Button>
        )}
        <Button
          size="sm"
          variant="secondary"
          loading={loading === "duplicate"}
          onClick={() =>
            run("duplicate", () =>
              fetch(`/api/company/jobs/${jobId}/duplicate`, { method: "POST" })
            )
          }
        >
          복제
        </Button>
        {status === "DRAFT" && (
          <Button
            size="sm"
            variant="danger"
            loading={loading === "delete"}
            onClick={() => {
              if (!confirm("이 채용공고를 삭제하시겠습니까?")) return;
              run("delete", () => fetch(`/api/company/jobs/${jobId}`, { method: "DELETE" }));
            }}
          >
            삭제
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
