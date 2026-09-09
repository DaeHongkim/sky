"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/recruit/client-auth";
import { Badge, Button, Card, EmptyState, Input, Loading, PageHeader, Select } from "@/components/recruit/ui";

type Job = {
  id: string;
  title: string;
  jobCategory?: string | null;
  workLocation?: string | null;
  employmentType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  foreignerAllowed?: boolean;
  housingSupport?: boolean;
  mealSupport?: boolean;
  koreanLevel?: string | null;
  deadline?: string | null;
  company?: { companyName: string; verificationStatus?: string };
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [jobCategory, setJobCategory] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [foreignerAllowed, setForeignerAllowed] = useState(false);
  const [housingSupport, setHousingSupport] = useState(false);
  const [mealSupport, setMealSupport] = useState(false);
  const [sort, setSort] = useState("latest");

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (keyword) p.set("keyword", keyword);
    if (jobCategory) p.set("jobCategory", jobCategory);
    if (workLocation) p.set("workLocation", workLocation);
    if (employmentType) p.set("employmentType", employmentType);
    if (foreignerAllowed) p.set("foreignerAllowed", "1");
    if (housingSupport) p.set("housingSupport", "1");
    if (mealSupport) p.set("mealSupport", "1");
    p.set("sort", sort);
    return p.toString();
  }, [
    keyword,
    jobCategory,
    workLocation,
    employmentType,
    foreignerAllowed,
    housingSupport,
    mealSupport,
    sort,
  ]);

  async function load() {
    setLoading(true);
    const res = await api<Job[]>(`/api/job-posts?${query}`);
    if (res.ok && res.data) setJobs(res.data);
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div>
      <PageHeader
        title="채용공고"
        subtitle="조건에 맞는 일자리를 찾아보세요"
        action={
          <Button variant="ghost" onClick={() => setFilterOpen(true)}>
            필터
          </Button>
        }
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <Input
          placeholder="키워드 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ marginBottom: 0 }}
        />
        <Select value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 140 }}>
          <option value="latest">최신순</option>
          <option value="deadline">마감임박</option>
          <option value="salary">급여높은순</option>
          <option value="recommend">추천순</option>
        </Select>
      </div>

      {loading ? (
        <Loading />
      ) : jobs.length ? (
        <div className="hr-grid">
          {jobs.map((job) => (
            <Link key={job.id} href={`/recruit/jobs/${job.id}`} className="hr-card hr-job-item">
              <div className="hr-meta">
                <strong>{job.company?.companyName}</strong>
                {job.foreignerAllowed ? <Badge tone="accent">외국인</Badge> : null}
                {job.housingSupport ? <Badge>숙소</Badge> : null}
                {job.mealSupport ? <Badge>식사</Badge> : null}
              </div>
              <h3>{job.title}</h3>
              <div className="hr-meta">
                <span>{job.jobCategory || "직종 미정"}</span>
                <span>{job.workLocation || "지역 미정"}</span>
                <span>{job.employmentType || "-"}</span>
                <span>
                  {job.salaryMin || job.salaryMax
                    ? `${job.salaryMin ?? ""}~${job.salaryMax ?? ""}`
                    : "급여 협의"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="검색 결과가 없습니다" description="필터를 바꿔 다시 검색해 보세요" />
      )}

      {filterOpen ? (
        <div className="hr-filter-drawer" onClick={() => setFilterOpen(false)}>
          <div className="hr-filter-panel" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>상세 필터</h3>
            <Input label="직종" value={jobCategory} onChange={(e) => setJobCategory(e.target.value)} />
            <Input label="지역" value={workLocation} onChange={(e) => setWorkLocation(e.target.value)} />
            <Select
              label="고용형태"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
            >
              <option value="">전체</option>
              <option value="정규직">정규직</option>
              <option value="계약직">계약직</option>
              <option value="파트타임">파트타임</option>
            </Select>
            <label className="hr-field">
              <span className="hr-label">
                <input
                  type="checkbox"
                  checked={foreignerAllowed}
                  onChange={(e) => setForeignerAllowed(e.target.checked)}
                />{" "}
                외국인 가능
              </span>
            </label>
            <label className="hr-field">
              <span className="hr-label">
                <input
                  type="checkbox"
                  checked={housingSupport}
                  onChange={(e) => setHousingSupport(e.target.checked)}
                />{" "}
                숙소 제공
              </span>
            </label>
            <label className="hr-field">
              <span className="hr-label">
                <input
                  type="checkbox"
                  checked={mealSupport}
                  onChange={(e) => setMealSupport(e.target.checked)}
                />{" "}
                식사 제공
              </span>
            </label>
            <Button
              style={{ width: "100%" }}
              onClick={() => {
                setFilterOpen(false);
                void load();
              }}
            >
              적용하기
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
