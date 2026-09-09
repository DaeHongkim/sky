"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ScrapsPage() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    fetch("/api/job-scraps").then((r) => r.json()).then((j) => setItems(j.data || []));
  }, []);

  return (
    <div>
      <h1 className="hr-title">스크랩</h1>
      {items.length === 0 && <div className="hr-empty">스크랩한 공고가 없습니다.</div>}
      {items.map((s) => {
        const job = s.jobPost as { id: string; title: string };
        return (
          <Link key={String(s.id)} href={`/recruit/jobs/${job.id}`} className="hr-card" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
            {job.title}
          </Link>
        );
      })}
    </div>
  );
}
