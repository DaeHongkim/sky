import { TEST_BASE_URL } from "../setup/global-setup";

/**
 * fetch 기반 테스트 클라이언트. 세션 쿠키를 인스턴스별로 보관해
 * 여러 사용자(구직자/기업/관리자)를 동시에 흉내낼 수 있다.
 */
export class TestClient {
  private cookies = new Map<string, string>();

  private applySetCookie(res: Response) {
    // undici/node-fetch는 getSetCookie()를 지원한다.
    const setCookies =
      typeof (res.headers as { getSetCookie?: () => string[] }).getSetCookie === "function"
        ? (res.headers as { getSetCookie: () => string[] }).getSetCookie()
        : res.headers.get("set-cookie")
        ? [res.headers.get("set-cookie") as string]
        : [];

    for (const raw of setCookies) {
      const [pair] = raw.split(";");
      const idx = pair.indexOf("=");
      const name = pair.slice(0, idx);
      const value = pair.slice(idx + 1);
      this.cookies.set(name, value);
    }
  }

  private cookieHeader() {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }

  async request(path: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers);
    if (this.cookies.size > 0) headers.set("cookie", this.cookieHeader());
    if (init.body && !headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
    const res = await fetch(`${TEST_BASE_URL}${path}`, { ...init, headers, redirect: "manual" });
    this.applySetCookie(res);
    return res;
  }

  get(path: string) {
    return this.request(path, { method: "GET" });
  }
  post(path: string, body?: unknown) {
    return this.request(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
  }
  patch(path: string, body?: unknown) {
    return this.request(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined });
  }
  delete(path: string) {
    return this.request(path, { method: "DELETE" });
  }
}

export function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.local`;
}
