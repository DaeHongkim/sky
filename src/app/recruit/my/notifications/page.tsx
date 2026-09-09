"use client";

import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  async function load() {
    const res = await fetch("/api/notifications");
    const json = await res.json();
    setItems(json.data?.items || []);
    setUnreadCount(json.data?.unreadCount || 0);
  }

  useEffect(() => {
    load();
  }, []);

  async function markAll() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="hr-title">알림 ({unreadCount})</h1>
        <button className="hr-btn hr-btn-ghost" onClick={markAll}>모두 읽음</button>
      </div>
      {items.map((n) => (
        <div key={String(n.id)} className="hr-card" style={{ opacity: n.readAt ? 0.65 : 1 }}>
          <strong>{String(n.title)}</strong>
          <div className="hr-sub">{String(n.body || "")}</div>
          <span className="hr-badge">{String(n.type)}</span>
        </div>
      ))}
    </div>
  );
}
