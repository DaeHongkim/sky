# 하늘사주 (SKY SAJU)

생년월일시로 사주팔자를 세우고, 일간·오행·십신·대운과 오늘의 운세를 읽는 Next.js 사주 시스템입니다.

## 기능

- 양력/음력(윤달) 생년월일 입력
- 시진 선택 또는 시간 모름
- 년·월·일·시 네 기둥 만세력 계산 (`manseryeok`)
- 오행 균형, 일간 해석, 대운 흐름
- **오늘의 운세** — 일간×오늘 일진 십신으로 종합·애정·재물·일·건강 점수

## 시작하기

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인합니다.

## 기술

- Next.js 16 / React 19 / Tailwind CSS 4
- [manseryeok](https://www.npmjs.com/package/manseryeok) — KASI 절기 기반 만세력
