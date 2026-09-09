"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/recruit/client-auth";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Loading,
  PageHeader,
  Select,
  Textarea,
} from "@/components/recruit/ui";

type Job = {
  id: string;
  title: string;
  status: string;
  workLocation?: string | null;
  views: number;
};

export default function CompanyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    jobCategory: "",
    description: "",
    employmentType: "정규직",
    workLocation: "",
    salaryMin: "",
    salaryMax: "",
    foreignerAllowed: false,
    housingSupport: false,
    mealSupport: false,
    status: "DRAFT",
  });

  async function load() {
    const res = await api<Job[]>("/api/job-posts?mine=1");
    if (res.ok && res.data) setJobs(res.data);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createJob(e: FormEvent) {
    e.preventDefault();
    await api("/api/job-posts", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      }),
    });
    setForm({ ...form, title: "", description: "" });
    void load();
  }

  return (
    <div>
      <PageHeader title="공고 관리" subtitle="등록 · 임시저장 · 게시 · 마감 · 재오픈" />
      <Card>
        <form onSubmit={createJob}>
          <Input label="공고 제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="직종" value={form.jobCategory} onChange={(e) => setForm({ ...form, jobCategory: e.target.value })} />
          <Input label="근무지" value={form.workLocation} onChange={(e) => setForm({ ...form, workLocation: e.target.value })} />
          <Input label="고용형태" value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })} />
          <div className="hr-grid hr-grid-2">
            <Input label="급여 최소" type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
            <Input label="급여 최대" type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
          </div>
          <Textarea label="공고 내용" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Select label="상태" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="DRAFT">임시저장</option>
            <option value="OPEN">게시</option>
          </Select>
          <label className="hr-field">
            <span className="hr-label">
              <input type="checkbox" checked={form.foreignerAllowed} onChange={(e) => setForm({ ...form, foreignerAllowed: e.target.checked })} /> 외국인 가능
            </span>
          </label>
          <Button type="submit">공고 등록</Button>
        </form>
      </Card>

      <div className="hr-grid" style={{ marginTop: 12 }}>
        {loading ? (
          <Loading />
        ) : jobs.length ? (
          jobs.map((j) => (
            <Card key={j.id}>
              <div className="hr-meta">
                <Badge tone={j.status === "OPEN" ? "success" : "neutral"}>{j.status}</Badge>
                <span>조회 {j.views}</span>
              </div>
              <h3>{j.title}</h3>
              <p className="hr-meta">{j.workLocation}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link href={`/recruit/jobs/${j.id}`}>
                  <Button variant="ghost">보기</Button>
                </Link>
                {(["OPEN", "CLOSED", "DRAFT"] as const).map((s) => (
                  <Button
                    key={s}
                    variant="ghost"
                    onClick={async () => {
                      await api(`/api/job-posts/${j.id}/status`, {
                        method: "POST",
                        body: JSON.stringify({ status: s }),
                      });
                      void load();
                    }}
                  >
                    {s === "OPEN" ? "게시/재오픈" : s === "CLOSED" ? "마감" : "임시저장"}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await api(`/api/job-posts/${j.id}/duplicate`, { method: "POST" });
                    void load();
                  }}
                >
                  복제
                </Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    if (!confirm("삭제?")) return;
                    await api(`/api/job-posts/${j.id}`, { method: "DELETE" });
                    void load();
                  }}
                >
                  삭제
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <EmptyState title="등록된 공고가 없습니다" />
        )}
      </div>
    </div>
  );
}
