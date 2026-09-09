"use client";

import { useState } from "react";
import Select from "@/components/recruit/ui/Select";
import Button from "@/components/recruit/ui/Button";
import { SUPPORTED_LANGUAGES } from "@/lib/translation/languages";

export default function TranslateButton({
  text,
  sourceType,
  sourceId,
}: {
  text: string;
  sourceType: "JOB_POST" | "RESUME" | "MESSAGE" | "INTERVIEW" | "OFFER" | "CONTRACT";
  sourceId: string;
}) {
  const [open, setOpen] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; translated: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleTranslate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLanguage, sourceType, sourceId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "번역에 실패했습니다.");
        return;
      }
      setResult({ text: data.translatedText, translated: data.translated });
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button size="sm" variant="secondary" type="button" onClick={() => setOpen(true)}>
        번역
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3">
      <div className="flex items-center gap-2">
        <Select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} className="flex-1">
          {SUPPORTED_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </Select>
        <Button size="sm" loading={loading} onClick={handleTranslate}>
          번역하기
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {result && (
        <div className="rounded-lg bg-slate-50 p-3 text-sm">
          {!result.translated && (
            <p className="mb-1 text-xs text-amber-700">
              번역 서비스가 아직 연결되지 않아 원문을 표시합니다.
            </p>
          )}
          <p className="whitespace-pre-wrap text-slate-700">{result.text}</p>
        </div>
      )}
    </div>
  );
}
