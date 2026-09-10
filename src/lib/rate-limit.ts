/**
 * 단일 인스턴스용 최소 rate limiter (in-memory sliding window).
 * 프로덕션에서 다중 인스턴스로 배포할 경우 Redis 등 공유 저장소로 교체해야 한다.
 */
const buckets = new Map<string, number[]>();

export function isRateLimited(
  key: string,
  { windowMs, max }: { windowMs: number; max: number }
): boolean {
  // 통합 테스트 전용 우회 — 운영/개발 환경에서는 절대 설정하지 않는다 (tests/setup/global-setup.ts 참고).
  if (process.env.RATE_LIMIT_DISABLED === "1") return false;

  const now = Date.now();
  const timestamps = (buckets.get(key) ?? []).filter(
    (t) => now - t < windowMs
  );
  if (timestamps.length >= max) {
    buckets.set(key, timestamps);
    return true;
  }
  timestamps.push(now);
  buckets.set(key, timestamps);
  return false;
}

export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
