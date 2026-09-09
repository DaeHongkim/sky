"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/recruit/client-auth";
import { Badge, Card, EmptyState, Loading, PageHeader } from "@/components/recruit/ui";

export default function CompanyScoutsPage() {
  const [rows, setRows] = useState<
    Array<{
      id: string;
      title: string;
      status: string;
      jobSeeker?: { name?: string | null };
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const res = await api<typeof rows>("/api/scout-offers");
      if (res.ok && res.data) setRows(res.data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loading />;
  return (
    <div>
      <PageHeader title="스카우트 현황" />
      {rows.length ? (
        <div className="hr-grid">
          {rows.map((r) => (
            <Card key={r.id}>
              <Badge>{r.status}</Badge>
              <h3>{r.title}</h3>
              <p>{r.jobSeeker?.name || "인재"}</p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="보낸 스카우트가 없습니다" />
      )}
    </div>
  );
}
