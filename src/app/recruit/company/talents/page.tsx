"use client";

import { FormEvent, useEffect, useState } from "react";

export default function TalentsPage() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [toast, setToast] = useState("");

  async function search(params = "") {
    const res = await fetch(`/api/talents${params}`);
    const json = await res.json();
    setItems(json.data || []);
  }

  useEffect(() => {
    search();
  }, []);

  async function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p = new URLSearchParams();
    ["jobCategory", "location", "nationality", "koreanLevel", "careerYearsMin"].forEach((k) => {
      const v = String(fd.get(k) || "");
      if (v) p.set(k, v);
    });
    search(`?${p.toString()}`);
  }

  async function view(jobSeekerId: string, resumeId: string) {
    const res = await fetch("/api/talents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobSeekerId, resumeId }),
    });
    const json = await res.json();
    if (json.ok) setDetail(json.data);
    else setToast(json.error);
  }

  async function scout(jobSeekerId: string) {
    const res = await fetch("/api/scout-offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobSeekerId,
        title: "스카우트 제안",
        message: "귀하 이력서를 검토하고 포지션을 제안드립니다.",
      }),
    });
    const json = await res.json();
    setToast(json.ok ? "스카우트 발송" : json.error);
  }

  return (
    <div>
      <h1 className="hr-title">인재검색</h1>
      <p className="hr-sub">공개 이력서만 검색됩니다. 상세 열람은 로그에 기록됩니다.</p>
      <form className="hr-card" onSubmit={onSearch}>
        <div className="hr-field"><label className="hr-label">직종</label><input className="hr-input" name="jobCategory" /></div>
        <div className="hr-field"><label className="hr-label">지역</label><input className="hr-input" name="location" /></div>
        <div className="hr-field"><label className="hr-label">국적</label><input className="hr-input" name="nationality" /></div>
        <div className="hr-field"><label className="hr-label">한국어</label><input className="hr-input" name="koreanLevel" /></div>
        <div className="hr-field"><label className="hr-label">최소경력</label><input className="hr-input" type="number" name="careerYearsMin" /></div>
        <button className="hr-btn hr-btn-primary" type="submit">검색</button>
      </form>
      {items.map((t) => (
        <div key={String(t.resumeId)} className="hr-card">
          <strong>{String(t.desiredJob || t.title)}</strong>
          <div className="hr-sub">{String(t.desiredLocation || "-")} · 경력 {String(t.careerYears)}년 · {String(t.nationality || "")}</div>
          <p>{String(t.summary || "")}</p>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="hr-btn hr-btn-ghost" onClick={() => view(String(t.jobSeekerId), String(t.resumeId))}>상세</button>
            <button className="hr-btn hr-btn-primary" onClick={() => scout(String(t.jobSeekerId))}>스카우트</button>
          </div>
        </div>
      ))}
      {detail && (
        <div className="hr-card">
          <h2 className="hr-title" style={{ fontSize: "1.05rem" }}>상세 ({String(detail.displayName)})</h2>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem" }}>{JSON.stringify(detail.resume, null, 2)}</pre>
        </div>
      )}
      {toast && <div className="hr-toast">{toast}</div>}
    </div>
  );
}
