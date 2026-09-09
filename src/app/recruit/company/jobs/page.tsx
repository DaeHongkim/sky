"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CompanyJobsPage() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [toast, setToast] = useState("");

  async function load() {
    const res = await fetch("/api/job-posts?mine=1");
    const json = await res.json();
    setItems(json.data?.items || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: string) {
    const res = await fetch(`/api/job-posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    setToast(json.ok ? "상태 변경" : json.error);
    load();
  }

  async function duplicate(id: string) {
    await fetch(`/api/job-posts/${id}/duplicate`, { method: "POST" });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/job-posts/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="hr-title">채용공고</h1>
        <Link className="hr-btn hr-btn-primary" href="/recruit/company/jobs/new">등록</Link>
      </div>
      {items.map((j) => (
        <div key={String(j.id)} className="hr-card">
          <strong>{String(j.title)}</strong>
          <div className="hr-sub">{String(j.status)} · 조회 {String(j.views)}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            <button className="hr-btn hr-btn-ghost" onClick={() => setStatus(String(j.id), "OPEN")}>게시</button>
            <button className="hr-btn hr-btn-ghost" onClick={() => setStatus(String(j.id), "CLOSED")}>마감</button>
            <button className="hr-btn hr-btn-ghost" onClick={() => setStatus(String(j.id), "DRAFT")}>임시저장</button>
            <button className="hr-btn hr-btn-ghost" onClick={() => setStatus(String(j.id), "OPEN")}>재오픈</button>
            <button className="hr-btn hr-btn-ghost" onClick={() => duplicate(String(j.id))}>복제</button>
            <button className="hr-btn hr-btn-ghost" onClick={() => remove(String(j.id))}>삭제</button>
          </div>
        </div>
      ))}
      {toast && <div className="hr-toast">{toast}</div>}
    </div>
  );
}
