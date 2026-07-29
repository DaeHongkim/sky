import type { Metadata } from "next";
import Link from "next/link";
import {
  channelPlan,
  formatWon,
  funnelSteps,
  products,
  projectedMonthlyRevenue,
  revenueGoal,
} from "@/data/products";

export const metadata: Metadata = {
  title: "요금 · 수익 설계 — 하늘사주",
  description:
    "무료 사주 체험에서 리포트·멤버십·상담까지, 월 1,000만 원을 겨냥한 하늘사주 수익 설계",
};

export default function PricingPage() {
  const projected = projectedMonthlyRevenue();

  return (
    <div className="pb-24">
      <Hero projected={projected} />
      <Products />
      <Funnel />
      <Channels />
      <MathTable projected={projected} />
      <Closing />
    </div>
  );
}

function Hero({ projected }: { projected: number }) {
  return (
    <section className="relative min-h-[70svh] overflow-hidden pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, var(--sky-top) 0%, var(--sky-mid) 45%, var(--paper) 100%)",
        }}
      />
      <div className="animate-breath pointer-events-none absolute -right-16 top-32 h-48 w-48 rounded-full bg-white/40 blur-3xl" />
      <div className="animate-drift pointer-events-none absolute left-[10%] top-40 h-32 w-64 rounded-full bg-white/25 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16">
        <p className="animate-rise text-xs tracking-[0.35em] text-[var(--ink-soft)]">
          SKY SAJU · REVENUE
        </p>
        <h1 className="animate-rise-delay-1 mt-3 font-[family-name:var(--font-display)] text-5xl leading-[1.05] tracking-tight text-[var(--ink)] md:text-7xl">
          하늘사주
        </h1>
        <p className="animate-rise-delay-2 mt-5 max-w-lg text-base leading-relaxed text-[var(--ink-soft)] md:text-lg">
          무료로 기둥을 세우고, 깊은 해석은 유료로. 월{" "}
          {formatWon(revenueGoal)} 목표를 네 상품으로 나눈 설계입니다.
        </p>
        <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
          <Link
            href="#products"
            className="rounded-md bg-[var(--ink)] px-5 py-3 text-sm text-[var(--paper)] transition-opacity hover:opacity-90"
          >
            상품 보기
          </Link>
          <Link
            href="/#saju-form"
            className="rounded-md border border-[var(--ink)]/25 px-5 py-3 text-sm text-[var(--ink)] transition-colors hover:border-[var(--ink)]"
          >
            무료로 사주 보기
          </Link>
        </div>
        <p className="mt-10 text-sm text-[var(--ink-soft)]">
          목표 판매량 달성 시 월 매출{" "}
          <span className="text-[var(--ink)]">{formatWon(projected)}</span>
        </p>
      </div>
    </section>
  );
}

function Products() {
  return (
    <section id="products" className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <p className="text-xs tracking-[0.25em] text-[var(--ink-soft)]">PRODUCTS</p>
      <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-4xl">
        네 가지 수익 상품
      </h2>
      <p className="mt-3 max-w-xl text-[var(--ink-soft)]">
        한 화면에 여러 혜택을 쌓지 않습니다. 각 상품은 한 가지 역할만 합니다.
      </p>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {products.map((product) => (
          <article
            key={product.id}
            id={product.id}
            className={`relative border-t border-[var(--line)] pt-6 ${
              product.highlighted ? "md:col-span-2" : ""
            }`}
          >
            {product.highlighted && (
              <p className="mb-2 text-xs tracking-[0.2em] text-[var(--accent-deep)]">
                추천
              </p>
            )}
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl">
                {product.name}
              </h3>
              <p className="text-lg text-[var(--ink)]">
                {formatWon(product.price)}
                <span className="ml-1 text-sm text-[var(--ink-soft)]">
                  / {product.unit}
                </span>
              </p>
            </div>
            <p className="mt-3 max-w-xl text-[var(--ink-soft)]">{product.tagline}</p>
            <ul className="mt-5 space-y-2 text-sm text-[var(--ink-soft)]">
              {product.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" />
                  {feature}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-[var(--ink-soft)]">
              월 목표 {product.monthlyTarget}
              {product.unit === "월" ? "명" : "건"} · 기여{" "}
              {formatWon(product.price * product.monthlyTarget)}
            </p>
            <Link
              href={`/inquiry?product=${product.id}`}
              className="mt-6 inline-flex rounded-md bg-[var(--ink)] px-4 py-2.5 text-sm text-[var(--paper)] transition-opacity hover:opacity-90"
            >
              {product.cta}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function Funnel() {
  return (
    <section className="border-y border-[var(--line)] bg-[var(--mist)]/50 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-xs tracking-[0.25em] text-[var(--ink-soft)]">FUNNEL</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-4xl">
          전환 흐름
        </h2>
        <p className="mt-3 max-w-xl text-[var(--ink-soft)]">
          무료 체험이 유입을 만들고, 유료가 해석의 깊이를 담당합니다.
        </p>
        <ol className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {funnelSteps.map((step, index) => (
            <li key={step.title}>
              <p className="text-xs tracking-[0.2em] text-[var(--accent-deep)]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Channels() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <p className="text-xs tracking-[0.25em] text-[var(--ink-soft)]">CHANNELS</p>
      <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-4xl">
        유입 채널
      </h2>
      <div className="mt-10 space-y-8">
        {channelPlan.map((item) => (
          <div
            key={item.channel}
            className="grid gap-2 border-t border-[var(--line)] pt-6 md:grid-cols-[10rem_1fr] md:gap-8"
          >
            <h3 className="font-[family-name:var(--font-display)] text-lg">
              {item.channel}
            </h3>
            <p className="text-[var(--ink-soft)]">{item.action}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MathTable({ projected }: { projected: number }) {
  return (
    <section className="border-t border-[var(--line)] bg-[var(--mist)]/40 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-xs tracking-[0.25em] text-[var(--ink-soft)]">MATH</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-4xl">
          월 {formatWon(revenueGoal)} 계산
        </h2>
        <p className="mt-3 max-w-xl text-[var(--ink-soft)]">
          모든 목표를 동시에 채울 필요는 없습니다. 리포트·연간이 주력이고, 상담은
          마진을 받쳐 줍니다.
        </p>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--ink-soft)]">
                <th className="py-3 pr-4 font-normal">상품</th>
                <th className="py-3 pr-4 font-normal">단가</th>
                <th className="py-3 pr-4 font-normal">월 목표</th>
                <th className="py-3 font-normal">매출</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-[var(--line)]">
                  <td className="py-4 pr-4">{p.name}</td>
                  <td className="py-4 pr-4">{formatWon(p.price)}</td>
                  <td className="py-4 pr-4">
                    {p.monthlyTarget}
                    {p.unit === "월" ? "명" : "건"}
                  </td>
                  <td className="py-4">{formatWon(p.price * p.monthlyTarget)}</td>
                </tr>
              ))}
              <tr>
                <td className="py-4 pr-4 font-[family-name:var(--font-display)] text-lg">
                  합계
                </td>
                <td className="py-4 pr-4" />
                <td className="py-4 pr-4" />
                <td className="py-4 font-[family-name:var(--font-display)] text-lg">
                  {formatWon(projected)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 md:pt-20">
      <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl">
        다음 한 걸음
      </h2>
      <p className="mt-4 max-w-xl leading-relaxed text-[var(--ink-soft)]">
        결제(토스·카카오페이)와 PDF 리포트 생성은 이후 단계에서 붙입니다. 지금은
        무료 사주 → 관심 신청으로 수요를 검증하세요.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/#saju-form"
          className="rounded-md bg-[var(--ink)] px-5 py-3 text-sm text-[var(--paper)] transition-opacity hover:opacity-90"
        >
          무료 사주로 유입 만들기
        </Link>
        <Link
          href="/inquiry?product=yearly"
          className="rounded-md border border-[var(--ink)]/25 px-5 py-3 text-sm text-[var(--ink)] transition-colors hover:border-[var(--ink)]"
        >
          연간 패키지 관심 신청
        </Link>
      </div>
    </section>
  );
}
