"use client";

import { FormEvent, useEffect, useState } from "react";

const LABEL: Record<string, string> = {
  AI_ESTIMATE: "AI 예상",
  OFFICIAL_CONFIRMATION_REQUIRED: "공식 확인 필요",
  ADMIN_VERIFIED: "관리자 확인 완료",
};

export default function VisaPage() {
  const [visa, setVisa] = useState<Record<string, unknown> | null>(null);
  const [disclaimer, setDisclaimer] = useState("");
  const [toast, setToast] = useState("");

  async function load() {
    const res = await fetch("/api/visa");
    const json = await res.json();
    setVisa(json.data?.visa);
    setDisclaimer(json.data?.disclaimer || "");
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/visa", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visaType: String(fd.get("visaType") || ""),
        visaStatus: String(fd.get("visaStatus") || ""),
        issueDate: String(fd.get("issueDate") || "") || null,
        expiryDate: String(fd.get("expiryDate") || "") || null,
        employmentAllowed: fd.get("employmentAllowed") === "on",
      }),
    });
    const json = await res.json();
    setToast(json.ok ? "저장됨 (공식 확인 필요)" : json.error);
    if (json.ok) setVisa(json.data.visa);
  }

  return (
    <div>
      <h1 className="hr-title">비자 / 외국인 정보</h1>
      <p className="hr-sub">{disclaimer}</p>
      {visa && (
        <div className="hr-card">
          <span className="hr-badge">{LABEL[String(visa.verificationStatus)] || String(visa.verificationStatus)}</span>
        </div>
      )}
      <form className="hr-card" onSubmit={save}>
        <div className="hr-field"><label className="hr-label">비자 종류</label><input className="hr-input" name="visaType" defaultValue={String(visa?.visaType || "")} /></div>
        <div className="hr-field"><label className="hr-label">비자 상태</label><input className="hr-input" name="visaStatus" defaultValue={String(visa?.visaStatus || "")} /></div>
        <div className="hr-field"><label className="hr-label">발급일</label><input className="hr-input" type="date" name="issueDate" defaultValue={visa?.issueDate ? String(visa.issueDate).slice(0, 10) : ""} /></div>
        <div className="hr-field"><label className="hr-label">만료일</label><input className="hr-input" type="date" name="expiryDate" defaultValue={visa?.expiryDate ? String(visa.expiryDate).slice(0, 10) : ""} /></div>
        <label style={{ display: "flex", gap: 8, marginBottom: 12 }}><input type="checkbox" name="employmentAllowed" defaultChecked={Boolean(visa?.employmentAllowed)} /> 취업 가능(본인 입력)</label>
        <button className="hr-btn hr-btn-primary" type="submit">저장</button>
      </form>
      {toast && <div className="hr-toast">{toast}</div>}
    </div>
  );
}
