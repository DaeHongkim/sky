"use client";

import { useEffect, useState } from "react";

export default function ContractsPage() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [toast, setToast] = useState("");

  async function load() {
    const res = await fetch("/api/contracts");
    const json = await res.json();
    setItems(json.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function act(id: string, action: "VIEW" | "AGREE" | "SIGN") {
    const res = await fetch(`/api/contracts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, signatureName: "본인서명" }),
    });
    const json = await res.json();
    setToast(json.ok ? `${action} 완료` : json.error);
    load();
  }

  return (
    <div>
      <h1 className="hr-title">전자근로계약</h1>
      {items.map((c) => (
        <div key={String(c.id)} className="hr-card">
          <strong>{String(c.title)} (V{String(c.version)})</strong>
          <div className="hr-sub">상태 {String(c.status)}</div>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem", background: "#faf7f2", padding: 10, borderRadius: 8 }}>
            {String(c.originalContent).slice(0, 500)}
          </pre>
          {c.translatedContent ? (
            <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem", color: "#6b6b6b" }}>
              [번역/{String(c.translationLang)}] {String(c.translatedContent).slice(0, 300)}
            </pre>
          ) : null}
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            <button className="hr-btn hr-btn-ghost" onClick={() => act(String(c.id), "VIEW")}>조회</button>
            <button className="hr-btn hr-btn-ghost" onClick={() => act(String(c.id), "AGREE")}>동의</button>
            <button className="hr-btn hr-btn-primary" onClick={() => act(String(c.id), "SIGN")}>서명</button>
          </div>
        </div>
      ))}
      {toast && <div className="hr-toast">{toast}</div>}
    </div>
  );
}
