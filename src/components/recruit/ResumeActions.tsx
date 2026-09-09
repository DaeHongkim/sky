"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/recruit/ui/Button";

export default function ResumeActions({
  resumeId,
  isPrimary,
}: {
  resumeId: string;
  isPrimary: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function run(action: string, fn: () => Promise<Response>) {
    setLoading(action);
    try {
      const res = await fn();
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {!isPrimary && (
        <Button
          variant="secondary"
          size="sm"
          loading={loading === "primary"}
          onClick={() =>
            run("primary", () =>
              fetch(`/api/resumes/${resumeId}/primary`, { method: "POST" })
            )
          }
        >
          대표로 설정
        </Button>
      )}
      <Button
        variant="secondary"
        size="sm"
        loading={loading === "duplicate"}
        onClick={() =>
          run("duplicate", () =>
            fetch(`/api/resumes/${resumeId}/duplicate`, { method: "POST" })
          )
        }
      >
        복제
      </Button>
      <Button
        variant="danger"
        size="sm"
        loading={loading === "delete"}
        onClick={() => {
          if (!confirm("이 이력서를 삭제하시겠습니까?")) return;
          run("delete", () => fetch(`/api/resumes/${resumeId}`, { method: "DELETE" }));
        }}
      >
        삭제
      </Button>
    </div>
  );
}
