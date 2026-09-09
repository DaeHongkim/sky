"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/recruit/client-auth";
import { Badge, Button, Card, EmptyState, Loading, PageHeader } from "@/components/recruit/ui";

export default function SeekerContractsPage() {
  const [rows, setRows] = useState<
    Array<{
      id: string;
      title: string;
      version: number;
      status: string;
      contentOriginal: string;
      contentTranslated?: string | null;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await api<typeof rows>("/api/contracts");
    if (res.ok && res.data) setRows(res.data);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) return <Loading />;
  return (
    <div>
      <PageHeader title="전자근로계약" subtitle="원문과 번역문을 구분해 확인하세요" />
      {rows.length ? (
        <div className="hr-grid">
          {rows.map((r) => (
            <Card key={r.id}>
              <div className="hr-meta">
                <Badge>V{r.version}</Badge>
                <Badge tone="accent">{r.status}</Badge>
              </div>
              <h3>{r.title}</h3>
              <h4>원문</h4>
              <p style={{ whiteSpace: "pre-wrap" }}>{r.contentOriginal}</p>
              {r.contentTranslated ? (
                <>
                  <h4>번역문</h4>
                  <p style={{ whiteSpace: "pre-wrap", color: "var(--hr-muted)" }}>
                    {r.contentTranslated}
                  </p>
                </>
              ) : null}
              {["SENT", "VIEWED", "AGREED"].includes(r.status) ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      await api(`/api/contracts/${r.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ action: "AGREE" }),
                      });
                      void load();
                    }}
                  >
                    동의
                  </Button>
                  <Button
                    onClick={async () => {
                      await api(`/api/contracts/${r.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ action: "SIGN" }),
                      });
                      void load();
                    }}
                  >
                    서명
                  </Button>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="계약서가 없습니다" />
      )}
    </div>
  );
}
