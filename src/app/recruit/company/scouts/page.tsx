"use client";

import { useEffect, useState } from "react";

export default function CompanyScoutsPage() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  useEffect(() => {
    fetch("/api/scout-offers").then((r) => r.json()).then((j) => setItems(j.data || []));
  }, []);
  return (
    <div>
      <h1 className="hr-title">스카우트 현황</h1>
      {items.map((s) => (
        <div key={String(s.id)} className="hr-card">
          <strong>{String(s.title)}</strong>
          <div className="hr-sub">{(s.jobSeeker as { name?: string })?.name} · {String(s.status)}</div>
        </div>
      ))}
    </div>
  );
}
