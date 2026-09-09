"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewJobPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/job-posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(fd.get("title") || ""),
        jobCategory: String(fd.get("jobCategory") || ""),
        description: String(fd.get("description") || ""),
        responsibilities: String(fd.get("responsibilities") || ""),
        requirements: String(fd.get("requirements") || ""),
        employmentType: String(fd.get("employmentType") || ""),
        salaryType: String(fd.get("salaryType") || "월급"),
        salaryMin: Number(fd.get("salaryMin") || 0) || null,
        salaryMax: Number(fd.get("salaryMax") || 0) || null,
        workLocation: String(fd.get("workLocation") || ""),
        workDays: String(fd.get("workDays") || ""),
        workHours: String(fd.get("workHours") || ""),
        deadline: String(fd.get("deadline") || "") || null,
        foreignerAllowed: fd.get("foreignerAllowed") === "on",
        visaConditions: String(fd.get("visaConditions") || ""),
        koreanLevel: String(fd.get("koreanLevel") || ""),
        housingSupport: fd.get("housingSupport") === "on",
        mealSupport: fd.get("mealSupport") === "on",
        transportationSupport: fd.get("transportationSupport") === "on",
        status: String(fd.get("status") || "DRAFT"),
      }),
    });
    const json = await res.json();
    if (!json.ok) {
      setError(json.error);
      return;
    }
    router.push("/recruit/company/jobs");
  }

  return (
    <div>
      <h1 className="hr-title">채용공고 등록</h1>
      <form className="hr-card" onSubmit={onSubmit}>
        <div className="hr-field"><label className="hr-label">제목</label><input className="hr-input" name="title" required /></div>
        <div className="hr-field"><label className="hr-label">직종</label><input className="hr-input" name="jobCategory" /></div>
        <div className="hr-field"><label className="hr-label">설명</label><textarea className="hr-textarea" name="description" required /></div>
        <div className="hr-field"><label className="hr-label">담당업무</label><textarea className="hr-textarea" name="responsibilities" /></div>
        <div className="hr-field"><label className="hr-label">자격요건</label><textarea className="hr-textarea" name="requirements" /></div>
        <div className="hr-field"><label className="hr-label">고용형태</label><input className="hr-input" name="employmentType" /></div>
        <div className="hr-field"><label className="hr-label">급여유형</label><input className="hr-input" name="salaryType" defaultValue="월급" /></div>
        <div className="hr-field"><label className="hr-label">급여 최소</label><input className="hr-input" type="number" name="salaryMin" /></div>
        <div className="hr-field"><label className="hr-label">급여 최대</label><input className="hr-input" type="number" name="salaryMax" /></div>
        <div className="hr-field"><label className="hr-label">근무지</label><input className="hr-input" name="workLocation" /></div>
        <div className="hr-field"><label className="hr-label">근무일</label><input className="hr-input" name="workDays" /></div>
        <div className="hr-field"><label className="hr-label">근무시간</label><input className="hr-input" name="workHours" /></div>
        <div className="hr-field"><label className="hr-label">마감일</label><input className="hr-input" type="date" name="deadline" /></div>
        <div className="hr-field"><label className="hr-label">비자 조건</label><input className="hr-input" name="visaConditions" /></div>
        <div className="hr-field"><label className="hr-label">한국어 수준</label><input className="hr-input" name="koreanLevel" /></div>
        <label style={{ display: "flex", gap: 8 }}><input type="checkbox" name="foreignerAllowed" /> 외국인 가능</label>
        <label style={{ display: "flex", gap: 8 }}><input type="checkbox" name="housingSupport" /> 숙소</label>
        <label style={{ display: "flex", gap: 8 }}><input type="checkbox" name="mealSupport" /> 식사</label>
        <label style={{ display: "flex", gap: 8, marginBottom: 12 }}><input type="checkbox" name="transportationSupport" /> 교통</label>
        <div className="hr-field">
          <label className="hr-label">상태</label>
          <select className="hr-select" name="status" defaultValue="OPEN">
            <option value="DRAFT">임시저장</option>
            <option value="OPEN">게시</option>
          </select>
        </div>
        {error && <p style={{ color: "#a83a2a" }}>{error}</p>}
        <button className="hr-btn hr-btn-primary" type="submit">저장</button>
      </form>
    </div>
  );
}
