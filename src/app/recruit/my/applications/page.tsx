"use client";

import { useEffect, useState } from "react";

export default function ApplicationsPage() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [toast, setToast] = useState("");

  async function load() {
    const res = await fetch("/api/applications");
    const json = await res.json();
    if (json.ok) setItems(json.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function withdraw(id: string) {
    const res = await fetch(`/api/applications/${id}/withdraw`, { method: "POST" });
    const json = await res.json();
    setToast(json.ok ? "지원 취소됨" : json.error);
    load();
  }

  return (
    <div>
      <h1 className="hr-title">지원현황</h1>
      {items.length === 0 && <div className="hr-empty">지원 내역이 없습니다.</div>}
      {items.map((a) => {
        const jobPost = a.jobPost as { title?: string } | undefined;
        const company = a.company as { companyName?: string } | undefined;
        return (
          <div key={String(a.id)} className="hr-card">
            <strong>{jobPost?.title}</strong>
            <div className="hr-sub">{company?.companyName}</div>
            <span className="hr-badge">{String(a.status)}</span>
            <div style={{ marginTop: 10 }}>
              {a.status !== "WITHDRAWN" && a.status !== "HIRED" && (
                <button className="hr-btn hr-btn-ghost" onClick={() => withdraw(String(a.id))}>지원취소</button>
              )}
            </div>
          </div>
        );
      })}
      {toast && <div className="hr-toast">{toast}</div>}
    </div>
  );
}
