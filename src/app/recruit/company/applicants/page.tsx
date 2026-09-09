"use client";

import { useEffect, useState } from "react";

const PIPELINE = [
  "APPLIED",
  "DOCUMENT_REVIEW",
  "INTERVIEW_REQUESTED",
  "INTERVIEW_SCHEDULED",
  "INTERVIEW_COMPLETED",
  "OFFER",
  "HIRED",
  "REJECTED",
];

export default function ApplicantsPage() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [toast, setToast] = useState("");

  async function load() {
    const res = await fetch("/api/applications");
    const json = await res.json();
    setItems(json.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStatus(id: string, status: string) {
    const res = await fetch(`/api/applications/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note: `상태 변경: ${status}` }),
    });
    const json = await res.json();
    setToast(json.ok ? "상태 변경됨" : json.error);
    load();
  }

  async function requestInterview(applicationId: string) {
    const scheduledAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    const res = await fetch("/api/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, scheduledAt, interviewType: "ONLINE", meetingUrl: "https://meet.example.com/hihong" }),
    });
    const json = await res.json();
    setToast(json.ok ? "면접 요청됨" : json.error);
    load();
  }

  async function sendOffer(applicationId: string) {
    const res = await fetch("/api/job-offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId,
        salary: 3000000,
        employmentType: "정규직",
        workLocation: "서울",
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        workingHours: "09:00-18:00",
        benefits: "식대, 교통비",
      }),
    });
    const json = await res.json();
    setToast(json.ok ? "Offer 발송" : json.error);
    load();
  }

  async function createContract(applicationId: string) {
    const res = await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId,
        title: "근로계약서",
        originalContent: "제1조(목적) 본 계약은 근로조건에 관하여 정한다...\n제2조(근로시간) 주 40시간\n제3조(임금) 월급제",
        translatedContent: "[en] Employment contract draft...",
        translationLang: "en",
      }),
    });
    const created = await res.json();
    if (!created.ok) {
      setToast(created.error);
      return;
    }
    const send = await fetch(`/api/contracts/${created.data.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "SEND" }),
    });
    const json = await send.json();
    setToast(json.ok ? "계약 발송" : json.error);
  }

  async function openChat(applicationId: string) {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId }),
    });
    const json = await res.json();
    setToast(json.ok ? "대화방 생성/연결됨" : json.error);
  }

  return (
    <div>
      <h1 className="hr-title">지원자 파이프라인</h1>
      {items.map((a) => (
        <div key={String(a.id)} className="hr-card">
          <strong>{(a.jobSeeker as { name?: string; email?: string })?.name || (a.jobSeeker as { email?: string })?.email}</strong>
          <div className="hr-sub">{(a.jobPost as { title?: string })?.title} · 이력서 {(a.resume as { title?: string })?.title}</div>
          <span className="hr-badge">{String(a.status)}</span>
          <div className="hr-field" style={{ marginTop: 10 }}>
            <select className="hr-select" defaultValue={String(a.status)} onChange={(e) => changeStatus(String(a.id), e.target.value)}>
              {PIPELINE.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button className="hr-btn hr-btn-ghost" onClick={() => requestInterview(String(a.id))}>면접요청</button>
            <button className="hr-btn hr-btn-ghost" onClick={() => sendOffer(String(a.id))}>Offer</button>
            <button className="hr-btn hr-btn-ghost" onClick={() => createContract(String(a.id))}>계약발송</button>
            <button className="hr-btn hr-btn-ghost" onClick={() => openChat(String(a.id))}>채팅</button>
          </div>
        </div>
      ))}
      {toast && <div className="hr-toast">{toast}</div>}
    </div>
  );
}
