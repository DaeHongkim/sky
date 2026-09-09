"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/recruit/client-auth";
import { Badge, Button, Card, EmptyState, Loading, PageHeader } from "@/components/recruit/ui";

type AppRow = {
  id: string;
  status: string;
  appliedAt: string;
  jobPost: { title: string; company?: { companyName: string } };
  histories: Array<{ toStatus: string; createdAt: string }>;
};

export default function SeekerApplicationsPage() {
  const [rows, setRows] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await api<AppRow[]>("/api/applications");
    if (res.ok && res.data) setRows(res.data);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <PageHeader title="지원현황" subtitle="지원 단계와 이력을 확인하세요" />
      {loading ? (
        <Loading />
      ) : rows.length ? (
        <div className="hr-grid">
          {rows.map((r) => (
            <Card key={r.id}>
              <div className="hr-meta">
                <Badge tone="accent">{r.status}</Badge>
                <span>{new Date(r.appliedAt).toLocaleString()}</span>
              </div>
              <h3 style={{ margin: "8px 0" }}>{r.jobPost.title}</h3>
              <p className="hr-meta">{r.jobPost.company?.companyName}</p>
              <div style={{ fontSize: "0.8rem", color: "var(--hr-muted)", marginTop: 8 }}>
                {r.histories.map((h, i) => (
                  <div key={i}>
                    → {h.toStatus} ({new Date(h.createdAt).toLocaleDateString()})
                  </div>
                ))}
              </div>
              {r.status !== "WITHDRAWN" && r.status !== "HIRED" ? (
                <Button
                  variant="danger"
                  style={{ marginTop: 10 }}
                  onClick={async () => {
                    await api(`/api/applications/${r.id}/withdraw`, { method: "POST" });
                    void load();
                  }}
                >
                  지원취소
                </Button>
              ) : null}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="지원 내역이 없습니다" />
      )}
    </div>
  );
}
