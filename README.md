# 하늘사주 (SKY SAJU)

생년월일시로 사주팔자를 세우고, 일간·오행·십신·대운을 읽는 Next.js 사주 시스템입니다.

## 기능

- 양력/음력(윤달) 생년월일 입력
- 시진 선택 또는 시간 모름
- 년·월·일·시 네 기둥 만세력 계산 (`manseryeok`)
- 오행 균형, 일간 해석, 대운 흐름
- **매일 운세** (`/daily`): 일간 庚金 · 火·土 공백 틀
  - 일진 육친 → 사업·대인·SNS·판단력·컨디션·이성운
  - 火土 채움 여부·색/방위 (水木 과다 시 검정·초록 주의)
  - 배우자운은 평생운 고정 (丙丁 / 巳午未戌, 결혼 적기 2027 丁未)
  - 웹에서 확인한 일진을 입력해 만세력과 교차 검증 후 풀이

## 시작하기

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) · 매일 운세는 [/daily](http://localhost:3000/daily)

## 기술

- Next.js 16 / React 19 / Tailwind CSS 4
- [manseryeok](https://www.npmjs.com/package/manseryeok) — KASI 절기 기반 만세력
