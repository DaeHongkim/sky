"use client";

import { useEffect, useState } from "react";

export default function InterviewsPage() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    fetch("/api/interviews").then((r) => r.json()).then((j) => setItems(j.data || []));
  }, []);

  async function confirm(id: string) {
    await fetch(`/api/interviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CONFIRMED" }),
    });
    const res = await fetch("/api/interviews");
    const json = await res.json();
    setItems(json.data || []);
  }

  return (
    <div>
      <h1 className="hr-title">면접</h1>
      {items.map((i) => (
        <div key={String(i.id)} className="hr-card">
          <strong>{String((i.company as { companyName?: string } | undefined)?.companyName || "면접")}</strong>
          <div className="hr-sub">{i.scheduledAt ? new Date(String(i.scheduledAt)).toLocaleString("ko-KR") : "일정 미정"}</div>
          <span className="hr-badge">{String(i.status)}</span>
          {i.status === "REQUESTED" && (
            <div style={{ marginTop: 10 }}>
              <button className="hr-btn hr-btn-primary" onClick={() => confirm(String(i.id))}>확정</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
