"use client";

import { FormEvent, useEffect, useState } from "react";

type Resume = {
  id: string;
  title: string;
  visibility: string;
  status: string;
  isPrimary: boolean;
  desiredJob?: string | null;
};

export default function ResumesPage() {
  const [items, setItems] = useState<Resume[]>([]);
  const [toast, setToast] = useState("");

  async function load() {
    const res = await fetch("/api/resumes");
    const json = await res.json();
    if (json.ok) setItems(json.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(fd.get("title") || "새 이력서"),
        profileSummary: String(fd.get("profileSummary") || ""),
        desiredJob: String(fd.get("desiredJob") || ""),
        desiredLocation: String(fd.get("desiredLocation") || ""),
        desiredSalary: Number(fd.get("desiredSalary") || 0) || null,
        employmentType: String(fd.get("employmentType") || ""),
        status: "DRAFT",
        visibility: "PRIVATE",
        careers: [],
        educations: [],
        skills: String(fd.get("skills") || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((name) => ({ name })),
        languages: String(fd.get("languages") || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((language) => ({ language, level: "중급" })),
      }),
    });
    const json = await res.json();
    setToast(json.ok ? "이력서가 생성되었습니다" : json.error);
    if (json.ok) {
      e.currentTarget.reset();
      load();
    }
  }

  async function patch(id: string, data: Record<string, unknown>) {
    const res = await fetch(`/api/resumes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setToast(json.ok ? "저장됨" : json.error);
    load();
  }

  async function duplicate(id: string) {
    const res = await fetch(`/api/resumes/${id}/duplicate`, { method: "POST" });
    const json = await res.json();
    setToast(json.ok ? "복제됨" : json.error);
    load();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    const json = await res.json();
    setToast(json.ok ? "삭제됨" : json.error);
    load();
  }

  return (
    <div>
      <h1 className="hr-title">이력서</h1>
      <form className="hr-card" onSubmit={create}>
        <div className="hr-field"><label className="hr-label">제목</label><input className="hr-input" name="title" required /></div>
        <div className="hr-field"><label className="hr-label">희망직종</label><input className="hr-input" name="desiredJob" /></div>
        <div className="hr-field"><label className="hr-label">희망지역</label><input className="hr-input" name="desiredLocation" /></div>
        <div className="hr-field"><label className="hr-label">희망급여</label><input className="hr-input" name="desiredSalary" type="number" /></div>
        <div className="hr-field"><label className="hr-label">고용형태</label><input className="hr-input" name="employmentType" placeholder="정규직/계약직 등" /></div>
        <div className="hr-field"><label className="hr-label">요약</label><textarea className="hr-textarea" name="profileSummary" /></div>
        <div className="hr-field"><label className="hr-label">스킬 (쉼표)</label><input className="hr-input" name="skills" /></div>
        <div className="hr-field"><label className="hr-label">언어 (쉼표)</label><input className="hr-input" name="languages" /></div>
        <button className="hr-btn hr-btn-primary" type="submit">이력서 생성</button>
      </form>

      {items.map((r) => (
        <div key={r.id} className="hr-card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <div>
              <strong>{r.title}</strong> {r.isPrimary && <span className="hr-badge">대표</span>}
              <div className="hr-sub">{r.desiredJob} · {r.status} · {r.visibility}</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button className="hr-btn hr-btn-ghost" onClick={() => patch(r.id, { isPrimary: true })}>대표설정</button>
              <button className="hr-btn hr-btn-ghost" onClick={() => patch(r.id, { visibility: r.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC" })}>
                {r.visibility === "PUBLIC" ? "비공개" : "공개"}
              </button>
              <button className="hr-btn hr-btn-ghost" onClick={() => patch(r.id, { status: r.status === "COMPLETE" ? "DRAFT" : "COMPLETE" })}>
                {r.status === "COMPLETE" ? "작성중" : "완료"}
              </button>
              <button className="hr-btn hr-btn-ghost" onClick={() => duplicate(r.id)}>복제</button>
              <button className="hr-btn hr-btn-ghost" onClick={() => remove(r.id)}>삭제</button>
            </div>
          </div>
        </div>
      ))}
      {toast && <div className="hr-toast">{toast}</div>}
    </div>
  );
}
