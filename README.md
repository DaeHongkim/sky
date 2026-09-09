# HIHONG RECRUIT / SKY

이 저장소는 기존 하늘사주·하이홍화토 회사 소개을 유지하면서 **HIHONG RECRUIT** 채용 플랫폼을 `/recruit` 경로로 확장합니다.

## 서비스 범위

회원가입 → 프로필/이력서 → 채용공고 → 지원 → 기업 검토 → 인재검색/스카우트 → 면접 → Offer → 전자근로계약 → 채용확정

채용확정 이후의 근태·급여·POS·매장운영은 포함하지 않습니다. `HIRED` 시 HQ 연동 이벤트만 준비합니다.

## 시작하기

```bash
cp .env.example .env
# DATABASE_URL, AUTH_SECRET 설정

npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

- 채용 플랫폼: http://localhost:3000/recruit
- 회사 사이트: http://localhost:3000/company
- 사주: http://localhost:3000

### 시드 계정

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 관리자 | admin@hihong.recruit | Passw0rd! |
| 구직자 | seeker@example.com | Passw0rd! |
| 기업 | company@hihong.recruit | Passw0rd! |

## 스크립트

- `npm run build` — Prisma generate + Next build
- `npm test` — API 통합 테스트 (dev 서버 실행 중 필요)
- `npm run db:migrate` — migration 적용
- `npm run db:seed` — 데모 데이터 (upsert, reset 아님)

## 환경변수

`.env.example` 참고. API 키는 서버 환경변수에만 저장합니다.
