"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/recruit/client-auth";
import { Button, Card, EmptyState, Loading, PageHeader } from "@/components/recruit/ui";

export default function SeekerScrapsPage() {
  const [rows, setRows] = useState<
    Array<{ id: string; jobPostId: string; jobPost: { title: string; company?: { companyName: string } } }>
  >([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await api<typeof rows>("/api/job-scraps");
    if (res.ok && res.data) setRows(res.data);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="스크랩" />
      {rows.length ? (
        <div className="hr-grid">
          {rows.map((r) => (
            <Card key={r.id}>
              <Link href={`/recruit/jobs/${r.jobPostId}`} style={{ color: "inherit", textDecoration: "none" }}>
                <h3 style={{ marginTop: 0 }}>{r.jobPost.title}</h3>
                <p className="hr-meta">{r.jobPost.company?.companyName}</p>
              </Link>
              <Button
                variant="danger"
                onClick={async () => {
                  await api(`/api/job-scraps?jobPostId=${r.jobPostId}`, { method: "DELETE" });
                  void load();
                }}
              >
                삭제
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="스크랩한 공고가 없습니다" />
      )}
    </div>
  );
}
