import Link from "next/link";

const sections = [
  {
    title: "사주팔자",
    body: "년·월·일·시 네 기둥에 천간과 지지가 하나씩 올라가 여덟 글자가 됩니다. 그 중심은 일간(日干), 곧 ‘나’의 기운입니다.",
  },
  {
    title: "절기와 월주",
    body: "달력의 1일이 아니라 입춘·경칩 같은 절입 시각을 기준으로 년주와 월주가 바뀝니다. 하늘사주는 만세력 절기표로 이를 계산합니다.",
  },
  {
    title: "오행",
    body: "목·화·토·금·수는 서로 살리거나 억제하며 균형을 이룹니다. 많이 드러난 기운과 비어 있는 기운을 함께 보면 흐름이 읽힙니다.",
  },
  {
    title: "대운",
    body: "약 10년 단위로 바뀌는 큰 운의 물결입니다. 성별과 연간의 음양에 따라 순행·역행이 달라집니다.",
  },
];

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28">
      <p className="text-xs tracking-[0.25em] text-[var(--ink-soft)]">GUIDE</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl md:text-5xl">
        사주 읽는 법
      </h1>
      <p className="mt-4 max-w-xl text-[var(--ink-soft)]">
        하늘사주는 만세력으로 기둥을 세운 뒤, 일간과 오행을 중심으로 짧은 해석을
        붙입니다. 점괘가 아니라 기운의 지도를 보는 일에 가깝습니다.
      </p>

      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-[family-name:var(--font-display)] text-2xl">
              {section.title}
            </h2>
            <p className="mt-3 leading-relaxed text-[var(--ink-soft)]">{section.body}</p>
          </section>
        ))}
      </div>

      <Link
        href="/#saju-form"
        className="mt-14 inline-flex rounded-md bg-[var(--ink)] px-5 py-3 text-[var(--paper)] transition-opacity hover:opacity-90"
      >
        내 사주 보러 가기
      </Link>
    </div>
  );
}
