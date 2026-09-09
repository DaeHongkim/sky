"use client";

import { useEffect, useState } from "react";

export default function ScoutsPage() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [toast, setToast] = useState("");

  async function load() {
    const res = await fetch("/api/scout-offers");
    const json = await res.json();
    setItems(json.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function respond(id: string, action: "OPEN" | "ACCEPT" | "DECLINE") {
    const res = await fetch(`/api/scout-offers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const json = await res.json();
    setToast(json.ok ? "처리됨" : json.error);
    load();
  }

  return (
    <div>
      <h1 className="hr-title">스카우트</h1>
      {items.map((s) => {
        const company = s.company as { companyName?: string } | undefined;
        return (
          <div key={String(s.id)} className="hr-card">
            <strong>{String(s.title)}</strong>
            <div className="hr-sub">{company?.companyName}</div>
            <p>{String(s.message)}</p>
            <span className="hr-badge">{String(s.status)}</span>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <button className="hr-btn hr-btn-ghost" onClick={() => respond(String(s.id), "OPEN")}>열람</button>
              <button className="hr-btn hr-btn-primary" onClick={() => respond(String(s.id), "ACCEPT")}>수락</button>
              <button className="hr-btn hr-btn-ghost" onClick={() => respond(String(s.id), "DECLINE")}>거절</button>
            </div>
          </div>
        );
      })}
      {toast && <div className="hr-toast">{toast}</div>}
    </div>
  );
}
