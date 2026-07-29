"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, type FormEvent } from "react";
import {
  formatWon,
  products,
  type ProductId,
} from "@/data/products";

export default function InquiryPage() {
  return (
    <Suspense fallback={<InquiryFallback />}>
      <InquiryForm />
    </Suspense>
  );
}

function InquiryFallback() {
  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-28">
      <p className="text-sm text-[var(--ink-soft)]">불러오는 중…</p>
    </div>
  );
}

function InquiryForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialId = (searchParams.get("product") as ProductId | null) ?? "report";
  const [productId, setProductId] = useState<ProductId>(
    products.some((p) => p.id === initialId) ? initialId : "report",
  );
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  const product = useMemo(
    () => products.find((p) => p.id === productId) ?? products[0],
    [productId],
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      productId,
      name: name.trim(),
      contact: contact.trim(),
      note: note.trim(),
      at: new Date().toISOString(),
    };
    try {
      const prev = JSON.parse(localStorage.getItem("sky-inquiries") ?? "[]") as unknown[];
      localStorage.setItem("sky-inquiries", JSON.stringify([payload, ...prev].slice(0, 50)));
    } catch {
      /* ignore quota / private mode */
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-24 pt-28">
        <p className="text-xs tracking-[0.25em] text-[var(--ink-soft)]">DONE</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl">
          신청이 저장됐어요
        </h1>
        <p className="mt-4 text-[var(--ink-soft)]">
          {product.name} 관심 신청을 이 기기에 기록했습니다. 결제 연동 전까지는
          직접 연락·카톡으로 안내하면 됩니다.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/pricing"
            className="rounded-md bg-[var(--ink)] px-5 py-3 text-sm text-[var(--paper)]"
          >
            요금 설계로
          </Link>
          <button
            type="button"
            onClick={() => {
              setDone(false);
              setNote("");
            }}
            className="rounded-md border border-[var(--line)] px-5 py-3 text-sm text-[var(--ink-soft)]"
          >
            다른 상품 신청
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-28">
      <p className="text-xs tracking-[0.25em] text-[var(--ink-soft)]">INQUIRY</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl">관심 신청</h1>
      <p className="mt-4 text-[var(--ink-soft)]">
        결제는 아직 연결 전입니다. 수요 검증용으로 연락처만 받아 둡니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <label className="block">
          <span className="text-sm text-[var(--ink-soft)]">상품</span>
          <select
            value={productId}
            onChange={(e) => {
              const next = e.target.value as ProductId;
              setProductId(next);
              router.replace(`/inquiry?product=${next}`, { scroll: false });
            }}
            className="mt-2 w-full rounded-md border border-[var(--line)] bg-white/80 px-3 py-3 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {formatWon(p.price)}/{p.unit}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-[var(--ink-soft)]">이름</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-md border border-[var(--line)] bg-white/80 px-3 py-3 outline-none focus:border-[var(--ink)]"
            placeholder="홍길동"
          />
        </label>

        <label className="block">
          <span className="text-sm text-[var(--ink-soft)]">연락처 (전화·카톡·이메일)</span>
          <input
            required
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="mt-2 w-full rounded-md border border-[var(--line)] bg-white/80 px-3 py-3 outline-none focus:border-[var(--ink)]"
            placeholder="010-0000-0000"
          />
        </label>

        <label className="block">
          <span className="text-sm text-[var(--ink-soft)]">하고 싶은 말 (선택)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="mt-2 w-full resize-y rounded-md border border-[var(--line)] bg-white/80 px-3 py-3 outline-none focus:border-[var(--ink)]"
            placeholder="궁금한 주제, 상담 희망 시간 등"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-md bg-[var(--ink)] px-5 py-3 text-[var(--paper)] transition-opacity hover:opacity-90"
        >
          {product.cta} 신청하기
        </button>
      </form>
    </div>
  );
}
