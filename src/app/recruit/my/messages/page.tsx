"use client";

import { FormEvent, useEffect, useState } from "react";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Array<Record<string, unknown>>>([]);
  const [active, setActive] = useState<string>("");
  const [messages, setMessages] = useState<Array<Record<string, unknown>>>([]);

  async function loadConversations() {
    const res = await fetch("/api/conversations");
    const json = await res.json();
    setConversations(json.data || []);
  }

  useEffect(() => {
    loadConversations();
  }, []);

  async function openConversation(id: string) {
    setActive(id);
    const res = await fetch(`/api/conversations/${id}/messages`);
    const json = await res.json();
    setMessages(json.data || []);
  }

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!active) return;
    const fd = new FormData(e.currentTarget);
    await fetch(`/api/conversations/${active}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: String(fd.get("body") || "") }),
    });
    e.currentTarget.reset();
    openConversation(active);
  }

  return (
    <div>
      <h1 className="hr-title">채팅</h1>
      <div className="hr-grid hr-grid-2">
        <div>
          {conversations.map((c) => (
            <button key={String(c.id)} className="hr-card" style={{ width: "100%", textAlign: "left" }} onClick={() => openConversation(String(c.id))}>
              {(c.company as { companyName?: string })?.companyName} · {(c.jobPost as { title?: string })?.title || "대화"}
            </button>
          ))}
          {conversations.length === 0 && <div className="hr-empty">대화방이 없습니다. 지원 후 생성됩니다.</div>}
        </div>
        <div className="hr-card">
          {messages.map((m) => (
            <div key={String(m.id)} style={{ marginBottom: 8 }}>
              <strong>{(m.sender as { name?: string })?.name || "사용자"}</strong>
              <div>{String(m.body)}</div>
              <div className="hr-sub">{new Date(String(m.createdAt)).toLocaleString("ko-KR")}</div>
            </div>
          ))}
          {active && (
            <form onSubmit={send}>
              <textarea className="hr-textarea" name="body" required placeholder="메시지 (번역 연결 구조 지원)" />
              <button className="hr-btn hr-btn-primary" type="submit">전송</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
