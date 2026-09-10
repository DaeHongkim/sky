"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/recruit/ui/Card";
import Button from "@/components/recruit/ui/Button";
import Loading from "@/components/recruit/ui/Loading";
import EmptyState from "@/components/recruit/ui/EmptyState";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationList() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[] | null>(null);

  function load() {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications ?? []));
  }

  useEffect(load, []);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    load();
    router.refresh();
  }

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    load();
    router.refresh();
  }

  if (notifications === null) return <Loading />;

  return (
    <div className="flex flex-col gap-4">
      {notifications.some((n) => !n.isRead) && (
        <Button variant="secondary" size="sm" onClick={markAllRead} className="self-end">
          모두 읽음 처리
        </Button>
      )}
      {notifications.length === 0 ? (
        <EmptyState title="알림이 없습니다." />
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`cursor-pointer transition-colors ${n.isRead ? "" : "border-slate-400 bg-slate-50"}`}
              onClick={() => !n.isRead && markRead(n.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm ${n.isRead ? "text-slate-600" : "font-semibold text-slate-900"}`}>
                  {n.title}
                </p>
                {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
              </div>
              {n.body && <p className="mt-1 text-sm text-slate-500">{n.body}</p>}
              <p className="mt-2 text-xs text-slate-400">
                {new Date(n.createdAt).toLocaleString("ko-KR")}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
