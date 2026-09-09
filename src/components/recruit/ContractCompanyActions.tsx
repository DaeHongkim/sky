"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Textarea from "@/components/recruit/ui/Textarea";
import Button from "@/components/recruit/ui/Button";

export default function ContractCompanyActions({
  contractId,
  status,
  contentOriginal,
}: {
  contractId: string;
  status: string;
  contentOriginal: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [newVersionOpen, setNewVersionOpen] = useState(false);
  const [content, setContent] = useState(contentOriginal);

  async function send() {
    setLoading("send");
    try {
      const res = await fetch(`/api/contracts/${contractId}/send`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function cancel() {
    if (!confirm("계약을 취소하시겠습니까?")) return;
    setLoading("cancel");
    try {
      const res = await fetch(`/api/contracts/${contractId}/cancel`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleNewVersion(e: FormEvent) {
    e.preventDefault();
    setLoading("new-version");
    try {
      const res = await fetch(`/api/contracts/${contractId}/new-version`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentOriginal: content }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/recruit/company/contracts/${data.contract.id}`);
      }
    } finally {
      setLoading(null);
    }
  }

  if (status === "SIGNED" || status === "CANCELLED") return null;

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {status === "DRAFT" && (
          <Button size="sm" loading={loading === "send"} onClick={send}>
            발송하기
          </Button>
        )}
        <Button
          size="sm"
          variant="secondary"
          type="button"
          onClick={() => setNewVersionOpen((v) => !v)}
        >
          새 버전 작성
        </Button>
        <Button size="sm" variant="danger" loading={loading === "cancel"} onClick={cancel}>
          취소
        </Button>
      </div>
      {newVersionOpen && (
        <form onSubmit={handleNewVersion} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3">
          <Textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} />
          <Button size="sm" type="submit" loading={loading === "new-version"}>
            새 버전 생성
          </Button>
        </form>
      )}
    </div>
  );
}
