"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/recruit/client-auth";
import { Badge, Button, Card, EmptyState, Loading, PageHeader } from "@/components/recruit/ui";

export default function SeekerInterviewsPage() {
  const [rows, setRows] = useState<
    Array<{
      id: string;
      status: string;
      scheduledAt?: string | null;
      meetingUrl?: string | null;
      company?: { companyName: string };
      jobPost?: { title: string } | null;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await api<typeof rows>("/api/interviews");
    if (res.ok && res.data) setRows(res.data);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) return <Loading />;
  return (
    <div>
      <PageHeader title="면접" subtitle="면접 일정과 상태를 확인하세요" />
      {rows.length ? (
        <div className="hr-grid">
          {rows.map((r) => (
            <Card key={r.id}>
              <Badge>{r.status}</Badge>
              <h3>{r.jobPost?.title || "면접"}</h3>
              <p className="hr-meta">{r.company?.companyName}</p>
              <p>{r.scheduledAt ? new Date(r.scheduledAt).toLocaleString() : "일정 미정"}</p>
              {r.meetingUrl ? (
                <a href={r.meetingUrl} target="_blank" rel="noreferrer">
                  미팅 링크
                </a>
              ) : null}
              {r.status === "REQUESTED" ? (
                <Button
                  style={{ marginTop: 8 }}
                  onClick={async () => {
                    await api(`/api/interviews/${r.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ status: "CONFIRMED" }),
                    });
                    void load();
                  }}
                >
                  면접 확정
                </Button>
              ) : null}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="예정된 면접이 없습니다" />
      )}
    </div>
  );
}
