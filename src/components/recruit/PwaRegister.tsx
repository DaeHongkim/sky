"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/recruit/ui";

export function PwaRegister() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (installed || !deferred) return null;

  return (
    <div className="hr-toast" style={{ bottom: 110 }}>
      <Button
        onClick={async () => {
          await deferred.prompt();
          setDeferred(null);
        }}
      >
        홈 화면에 설치
      </Button>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}
