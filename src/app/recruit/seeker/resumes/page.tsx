"use client";

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

type Resume = {
  id: string;
  title: string;
  status: string;
  visibility: string;
  isPrimary: boolean;
  desiredJob?: string | null;
  updatedAt: string;
};

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("기본 이력서");
  const [desiredJob, setDesiredJob] = useState("");
  const [summary, setSummary] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "PUBLIC">("PRIVATE");
  const [status, setStatus] = useState<"DRAFT" | "COMPLETE">("DRAFT");
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const res = await api<Resume[]>("/api/resumes");
    if (res.ok && res.data) setResumes(res.data);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createResume(e: FormEvent) {
    e.preventDefault();
    const res = await api("/api/resumes", {
      method: "POST",
      body: JSON.stringify({
        title,
        desiredJob,
        profileSummary: summary,
        visibility,
        status,
        isPrimary: resumes.length === 0,
      }),
    });
    setMsg(res.ok ? "생성됨" : res.error || "실패");
    if (res.ok) void load();
  }

  return (
    <div>
      <PageHeader title="이력서" subtitle="여러 개의 이력서를 관리할 수 있습니다" />
      <Card>
        <form onSubmit={createResume}>
          <Input label="제목" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input label="희망직종" value={desiredJob} onChange={(e) => setDesiredJob(e.target.value)} />
          <Textarea label="요약" value={summary} onChange={(e) => setSummary(e.target.value)} />
          <Select label="공개설정" value={visibility} onChange={(e) => setVisibility(e.target.value as "PRIVATE" | "PUBLIC")}>
            <option value="PRIVATE">비공개</option>
            <option value="PUBLIC">공개</option>
          </Select>
          <Select label="상태" value={status} onChange={(e) => setStatus(e.target.value as "DRAFT" | "COMPLETE")}>
            <option value="DRAFT">작성중</option>
            <option value="COMPLETE">완료</option>
          </Select>
          <Button type="submit">이력서 생성</Button>
        </form>
        {msg ? <p>{msg}</p> : null}
      </Card>

      <div className="hr-grid" style={{ marginTop: 12 }}>
        {loading ? (
          <Loading />
        ) : resumes.length ? (
          resumes.map((r) => (
            <Card key={r.id}>
              <div className="hr-meta">
                {r.isPrimary ? <Badge tone="accent">대표</Badge> : null}
                <Badge tone={r.visibility === "PUBLIC" ? "success" : "neutral"}>
                  {r.visibility === "PUBLIC" ? "공개" : "비공개"}
                </Badge>
                <Badge>{r.status === "COMPLETE" ? "완료" : "작성중"}</Badge>
              </div>
              <h3 style={{ margin: "8px 0" }}>{r.title}</h3>
              <p className="hr-meta">{r.desiredJob || "희망직종 미입력"}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await api(`/api/resumes/${r.id}/primary`, { method: "POST" });
                    void load();
                  }}
                >
                  대표 설정
                </Button>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await api(`/api/resumes/${r.id}/duplicate`, { method: "POST" });
                    void load();
                  }}
                >
                  복제
                </Button>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await api(`/api/resumes/${r.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({
                        visibility: r.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC",
                      }),
                    });
                    void load();
                  }}
                >
                  {r.visibility === "PUBLIC" ? "비공개로" : "공개로"}
                </Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    if (!confirm("삭제할까요?")) return;
                    await api(`/api/resumes/${r.id}`, { method: "DELETE" });
                    void load();
                  }}
                >
                  삭제
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <EmptyState title="이력서가 없습니다" description="위에서 새 이력서를 만들어 보세요" />
        )}
      </div>
    </div>
  );
}
