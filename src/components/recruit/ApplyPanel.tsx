"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Select from "@/components/recruit/ui/Select";
import Button from "@/components/recruit/ui/Button";

interface ResumeOption {
  id: string;
  title: string;
  status: string;
}

export default function ApplyPanel({ jobPostId }: { jobPostId: string }) {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeOption[] | null>(null);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    fetch("/api/resumes")
      .then((res) => res.json())
      .then((data) => {
        const list: ResumeOption[] = data.resumes ?? [];
        setResumes(list);
        if (list.length > 0) setSelected(list[0].id);
      });
  }, []);

  async function handleApply() {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/job-posts/${jobPostId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "지원에 실패했습니다.");
        return;
      }
      setApplied(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (applied) {
    return <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">지원이 완료되었습니다.</p>;
  }

  if (resumes === null) return null;

  if (resumes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
        지원하려면 먼저 이력서를 작성해야 합니다.{" "}
        <Link href="/recruit/seeker/resumes/new" className="font-medium text-slate-900 underline">
          이력서 작성하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4">
      <Select
        id="resume"
        label="지원할 이력서 선택"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        {resumes.map((r) => (
          <option key={r.id} value={r.id}>
            {r.title} ({r.status === "COMPLETED" ? "완료" : "작성중"})
          </option>
        ))}
      </Select>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button onClick={handleApply} loading={loading} fullWidth>
        지원하기
      </Button>
    </div>
  );
}
