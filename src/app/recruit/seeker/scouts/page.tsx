"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/recruit/client-auth";
import { Badge, Button, Card, EmptyState, Loading, PageHeader } from "@/components/recruit/ui";

type Scout = {
  id: string;
  title: string;
  message: string;
  status: string;
  company?: { companyName: string };
};

export default function SeekerScoutsPage() {
  const [rows, setRows] = useState<Scout[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await api<Scout[]>("/api/scout-offers");
    if (res.ok && res.data) setRows(res.data);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="스카우트" subtitle="기업의 제안을 확인하고 응답하세요" />
      {rows.length ? (
        <div className="hr-grid">
          {rows.map((r) => (
            <Card key={r.id}>
              <Badge>{r.status}</Badge>
              <h3>{r.title}</h3>
              <p className="hr-meta">{r.company?.companyName}</p>
              <p style={{ whiteSpace: "pre-wrap" }}>{r.message}</p>
              {r.status === "PENDING" || r.status === "OPENED" ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    onClick={async () => {
                      await api(`/api/scout-offers/${r.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ action: "ACCEPT" }),
                      });
                      void load();
                    }}
                  >
                    수락
                  </Button>
                  <Button
                    variant="danger"
                    onClick={async () => {
                      await api(`/api/scout-offers/${r.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ action: "DECLINE" }),
                      });
                      void load();
                    }}
                  >
                    거절
                  </Button>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="스카우트 제안이 없습니다" />
      )}
    </div>
  );
}
