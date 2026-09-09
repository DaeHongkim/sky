# HIHONG RECRUIT (베타 → 실서비스 확장)

구직자·기업 채용 플랫폼. 기존 하늘사주/점포 앱은 유지하고 `/recruit` 경로에 채용 SaaS를 추가했습니다.

## 빠른 시작

```bash
npm install
cp .env.example .env   # AUTH_SECRET, DATABASE_URL 설정
npx prisma migrate deploy
npm run db:seed
npm run dev
```

- 채용 앱: http://localhost:3000/recruit
- 시드 계정
  - 구직자 `seeker@example.com` / `Test1234!`
  - 기업 `company@example.com` / `Test1234!`
  - 관리자 `admin@hihong.recruit` / `Test1234!`

## 스크립트

- `npm run build` — Prisma generate + Next build
- `npm test` — Vitest (auth/권한/채용 플로우)
- `npm run db:migrate` — migration 생성/적용
- `npm run db:seed` — 샘플 계정/공고 (reset 아님)

## 범위

채용확정(HIRED)까지. 근태·급여·POS·매장운영은 포함하지 않으며, HQ 연동은 `POST /api/integrations/hq/hired` + outbox 이벤트만 준비.

---

# 하늘사주 (기존)

생년월일시 사주팔자 시스템 — `/` 경로에 유지됩니다.
