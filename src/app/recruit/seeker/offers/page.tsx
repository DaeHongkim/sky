"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/recruit/client-auth";
import { Badge, Button, Card, EmptyState, Loading, PageHeader } from "@/components/recruit/ui";

export default function SeekerOffersPage() {
  const [rows, setRows] = useState<
    Array<{
      id: string;
      status: string;
      salary?: number | null;
      workLocation?: string | null;
      employmentType?: string | null;
      message?: string | null;
      company?: { companyName: string };
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await api<typeof rows>("/api/job-offers");
    if (res.ok && res.data) setRows(res.data);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) return <Loading />;
  return (
    <div>
      <PageHeader title="Offer" />
      {rows.length ? (
        <div className="hr-grid">
          {rows.map((r) => (
            <Card key={r.id}>
              <Badge tone="accent">{r.status}</Badge>
              <h3>{r.company?.companyName}</h3>
              <p>
                {r.employmentType} / {r.workLocation} / {r.salary ? `${r.salary}만원` : "급여 협의"}
              </p>
              <p>{r.message}</p>
              {r.status === "PENDING" ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    onClick={async () => {
                      await api(`/api/job-offers/${r.id}`, {
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
                      await api(`/api/job-offers/${r.id}`, {
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
        <EmptyState title="Offer가 없습니다" />
      )}
    </div>
  );
}
