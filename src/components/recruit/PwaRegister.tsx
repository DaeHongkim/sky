"use client";

import { useEffect, useState } from "react";

export default function PwaRegister() {
  const [deferred, setDeferred] = useState<Event | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler as EventListener);
    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
  }, []);

  if (!show) return null;

  return (
    <div className="hr-toast" style={{ bottom: 96, display: "flex", gap: 8, alignItems: "center" }}>
      <span>홈 화면에 설치</span>
      <button
        className="hr-btn hr-btn-primary"
        style={{ padding: "6px 10px" }}
        onClick={async () => {
          const prompt = deferred as unknown as { prompt: () => Promise<void> };
          await prompt.prompt();
          setShow(false);
        }}
      >
        설치
      </button>
      <button className="hr-btn hr-btn-ghost" style={{ padding: "6px 10px" }} onClick={() => setShow(false)}>
        닫기
      </button>
    </div>
  );
}
