"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/recruit/client-auth";
import { Badge, Button, Card, EmptyState, Loading, PageHeader } from "@/components/recruit/ui";

type Noti = {
  id: string;
  title: string;
  body?: string | null;
  isRead: boolean;
  createdAt: string;
  linkUrl?: string | null;
  type: string;
};

export default function NotificationsPage() {
  const [rows, setRows] = useState<Noti[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await api<Noti[]>("/api/notifications");
    if (res.ok && res.data) setRows(res.data);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <PageHeader
        title="알림"
        action={
          <Button
            variant="ghost"
            onClick={async () => {
              await api("/api/notifications", {
                method: "PATCH",
                body: JSON.stringify({ all: true }),
              });
              void load();
            }}
          >
            모두 읽음
          </Button>
        }
      />
      {loading ? (
        <Loading />
      ) : rows.length ? (
        <div className="hr-grid">
          {rows.map((n) => (
            <Card key={n.id} className={n.isRead ? "" : ""}>
              <div className="hr-meta">
                {!n.isRead ? <Badge tone="accent">NEW</Badge> : <Badge>읽음</Badge>}
                <span>{n.type}</span>
                <span>{new Date(n.createdAt).toLocaleString()}</span>
              </div>
              <h3 style={{ margin: "8px 0" }}>{n.title}</h3>
              <p style={{ margin: 0, color: "var(--hr-muted)" }}>{n.body}</p>
              {n.linkUrl ? (
                <Link href={n.linkUrl} style={{ fontSize: "0.85rem" }}>
                  바로가기
                </Link>
              ) : null}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="알림이 없습니다" />
      )}
    </div>
  );
}
