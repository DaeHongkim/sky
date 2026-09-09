"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Job = {
  id: string;
  title: string;
  jobCategory: string | null;
  workLocation: string | null;
  employmentType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  foreignerAllowed: boolean;
  housingSupport: boolean;
  mealSupport: boolean;
  deadline: string | null;
  company: { companyName: string; verificationStatus: string };
};

export default function JobsPage() {
  const [items, setItems] = useState<Job[]>([]);
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState("latest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    jobCategory: "",
    location: "",
    employmentType: "",
    foreignerAllowed: false,
    housingSupport: false,
    mealSupport: false,
    salaryMin: "",
  });

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (keyword) p.set("keyword", keyword);
    if (filters.jobCategory) p.set("jobCategory", filters.jobCategory);
    if (filters.location) p.set("location", filters.location);
    if (filters.employmentType) p.set("employmentType", filters.employmentType);
    if (filters.foreignerAllowed) p.set("foreignerAllowed", "1");
    if (filters.housingSupport) p.set("housingSupport", "1");
    if (filters.mealSupport) p.set("mealSupport", "1");
    if (filters.salaryMin) p.set("salaryMin", filters.salaryMin);
    p.set("sort", sort);
    return p.toString();
  }, [keyword, filters, sort]);

  useEffect(() => {
    fetch(`/api/job-posts?${query}`)
      .then((r) => r.json())
      .then((j) => setItems(j.data?.items || []));
  }, [query]);

  return (
    <div>
      <h1 className="hr-title">채용공고</h1>
      <p className="hr-sub">키워드·조건으로 공고를 검색하세요.</p>

      <div className="hr-filter-bar">
        <input className="hr-input" placeholder="키워드" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <button className="hr-btn hr-btn-ghost" type="button" onClick={() => setFiltersOpen(true)}>필터</button>
      </div>

      <div className="hr-tabs">
        {[
          ["latest", "최신순"],
          ["deadline", "마감임박"],
          ["salary", "급여높은순"],
          ["recommend", "추천순"],
        ].map(([k, label]) => (
          <button key={k} className={`hr-tab ${sort === k ? "active" : ""}`} onClick={() => setSort(k)}>
            {label}
          </button>
        ))}
      </div>

      {items.length === 0 && <div className="hr-empty">검색 결과가 없습니다.</div>}
      {items.map((job) => (
        <Link key={job.id} href={`/recruit/jobs/${job.id}`} className="hr-card hr-job-item" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
          <span className="hr-badge">{job.company.companyName}</span>
          <h3>{job.title}</h3>
          <div className="hr-job-meta">
            {job.workLocation && <span className="hr-badge">{job.workLocation}</span>}
            {job.employmentType && <span className="hr-badge">{job.employmentType}</span>}
            {(job.salaryMin || job.salaryMax) && (
              <span className="hr-badge">
                {job.salaryMin?.toLocaleString() ?? "?"} ~ {job.salaryMax?.toLocaleString() ?? "?"}
              </span>
            )}
            {job.foreignerAllowed && <span className="hr-badge">외국인 가능</span>}
          </div>
        </Link>
      ))}

      {filtersOpen && (
        <div className="hr-modal-backdrop" onClick={() => setFiltersOpen(false)}>
          <div className="hr-drawer" onClick={(e) => e.stopPropagation()}>
            <h2 className="hr-title" style={{ fontSize: "1.1rem" }}>검색 필터</h2>
            <div className="hr-field"><label className="hr-label">직종</label><input className="hr-input" value={filters.jobCategory} onChange={(e) => setFilters({ ...filters, jobCategory: e.target.value })} /></div>
            <div className="hr-field"><label className="hr-label">지역</label><input className="hr-input" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} /></div>
            <div className="hr-field"><label className="hr-label">고용형태</label><input className="hr-input" value={filters.employmentType} onChange={(e) => setFilters({ ...filters, employmentType: e.target.value })} /></div>
            <div className="hr-field"><label className="hr-label">최소 급여</label><input className="hr-input" type="number" value={filters.salaryMin} onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })} /></div>
            <label style={{ display: "flex", gap: 8, marginBottom: 8 }}><input type="checkbox" checked={filters.foreignerAllowed} onChange={(e) => setFilters({ ...filters, foreignerAllowed: e.target.checked })} /> 외국인 가능</label>
            <label style={{ display: "flex", gap: 8, marginBottom: 8 }}><input type="checkbox" checked={filters.housingSupport} onChange={(e) => setFilters({ ...filters, housingSupport: e.target.checked })} /> 숙소 제공</label>
            <label style={{ display: "flex", gap: 8, marginBottom: 16 }}><input type="checkbox" checked={filters.mealSupport} onChange={(e) => setFilters({ ...filters, mealSupport: e.target.checked })} /> 식사 제공</label>
            <button className="hr-btn hr-btn-primary" style={{ width: "100%" }} onClick={() => setFiltersOpen(false)}>적용</button>
          </div>
        </div>
      )}
    </div>
  );
}
