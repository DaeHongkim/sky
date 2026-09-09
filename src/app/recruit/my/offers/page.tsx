"use client";

import { useEffect, useState } from "react";

export default function OffersPage() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [toast, setToast] = useState("");

  async function load() {
    const res = await fetch("/api/job-offers");
    const json = await res.json();
    setItems(json.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function respond(id: string, action: "ACCEPT" | "DECLINE") {
    const res = await fetch(`/api/job-offers/${id}`, {
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
      <h1 className="hr-title">Offer</h1>
      {items.map((o) => (
        <div key={String(o.id)} className="hr-card">
          <strong>{(o.company as { companyName?: string })?.companyName}</strong>
          <div className="hr-sub">급여 {String(o.salary ?? "-")} · {String(o.employmentType || "")}</div>
          <span className="hr-badge">{String(o.status)}</span>
          {o.status === "PENDING" && (
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <button className="hr-btn hr-btn-primary" onClick={() => respond(String(o.id), "ACCEPT")}>수락</button>
              <button className="hr-btn hr-btn-ghost" onClick={() => respond(String(o.id), "DECLINE")}>거절</button>
            </div>
          )}
        </div>
      ))}
      {toast && <div className="hr-toast">{toast}</div>}
    </div>
  );
}
