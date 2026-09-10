# HIHONG RECRUIT — Vercel 배포 안내

이 앱은 `sky` 저장소의 `/recruit` 경로 아래에서 동작하며, 저장소의 실제 프로덕션 브랜치
(`claude/work-session-check-4jlQz`)와는 별도로 작업 브랜치
(`claude/hihong-recruit-platform-jcktp4`)의 Preview 배포로 운영 중이다.

## 필수 환경변수 (Vercel Project → Settings → Environment Variables)

- `DATABASE_URL` — 프로덕션용 PostgreSQL 연결 문자열 (Vercel Postgres / Neon / Supabase 등).
  Prisma 7 드라이버 어댑터(`@prisma/adapter-pg`)를 사용하므로 일반 연결 문자열이면 충분하다.
- `AUTH_SECRET` — 세션 JWT 서명 키. 32자 이상 랜덤 문자열로 새로 생성해서 넣을 것 (로컬 `.env`의
  값을 그대로 쓰지 말 것).

## 선택 환경변수

- `OPENAI_API_KEY` — 설정하면 다국어 번역과 AI 사전면접 질문 생성이 실제 OpenAI 호출로 동작한다.
  미설정 시 각각 `NullTranslationProvider`(원문 그대로 반환)와 템플릿 기반 사전면접 질문으로
  안전하게 동작한다(가짜 성공을 반환하지 않음).
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — `npm run db:seed`로 최초 관리자 계정을 만들 때 사용.

## 배포 후 확인할 것

1. `npx prisma migrate deploy` (또는 동일 효과의 빌드 스텝)로 `prisma/migrations/`의 두 마이그레이션이
   프로덕션 DB에 적용되어 있는지 확인.
2. `/recruit` 경로로 접속해 회원가입 → 로그인이 되는지 확인 (DB 연결 검증).
3. 환경변수가 비어 있으면 DB 관련 라우트는 빌드는 성공하지만 런타임에서 에러를 반환한다 — 이는
   의도된 동작이다 (가짜 성공을 숨기지 않기 위함).
