"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaRegister() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/recruit/" })
        .catch((err) => console.error("[pwa] service worker registration failed", err));
    }

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  if (!installEvent || dismissed) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 mx-auto max-w-md px-4 md:bottom-4">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
        <p className="text-sm text-slate-700">홈 화면에 HIHONG RECRUIT을 추가할까요?</p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => setDismissed(true)}
            className="rounded-lg px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-50"
          >
            닫기
          </button>
          <button
            onClick={async () => {
              await installEvent.prompt();
              setInstallEvent(null);
            }}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            설치
          </button>
        </div>
      </div>
    </div>
  );
}
