import { spawn, execSync, type ChildProcess } from "child_process";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

export const TEST_PORT = 3100;
export const TEST_BASE_URL = `http://localhost:${TEST_PORT}`;
export const TEST_DATABASE_URL =
  "postgresql://hihong:hihong_dev_pw@localhost:5432/hihong_recruit_test?schema=public";

export const TEST_ADMIN_EMAIL = "test-admin@hihong-recruit.local";
export const TEST_ADMIN_PASSWORD = "TestAdmin123!";

let serverProcess: ChildProcess | undefined;

function freePortIfOccupied(port: number) {
  // 이전 실행이 비정상 종료되어 좀비 서버가 포트를 점유하고 있으면
  // 이번 테스트가 그 오래된(수정 전) 서버에 조용히 붙어버리는 사고를 방지한다.
  try {
    execSync(`fuser -k ${port}/tcp`, { stdio: "ignore" });
  } catch {
    // 점유 프로세스가 없으면 실패하는 게 정상 — 무시한다.
  }
}

async function waitForServer(url: string, timeoutMs: number, proc: ChildProcess) {
  let exited = false;
  let exitInfo = "";
  proc.on("exit", (code, signal) => {
    exited = true;
    exitInfo = `code=${code} signal=${signal}`;
  });

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (exited) {
      throw new Error(`테스트용 Next 서버가 준비 전에 종료되었습니다 (${exitInfo}).`);
    }
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {
      // 아직 서버가 뜨지 않음 — 재시도
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`서버가 ${timeoutMs}ms 내에 준비되지 않았습니다: ${url}`);
}

export async function setup() {
  freePortIfOccupied(TEST_PORT);

  // 테스트 DB를 깨끗한 상태로 초기화한다 (마이그레이션 이력 테이블은 유지).
  const adapter = new PrismaPg({ connectionString: TEST_DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const tables: { tablename: string }[] = await prisma.$queryRawUnsafe(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations'`
  );
  if (tables.length > 0) {
    const names = tables.map((t) => `"public"."${t.tablename}"`).join(", ");
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${names} RESTART IDENTITY CASCADE`);
  }

  const passwordHash = await bcrypt.hash(TEST_ADMIN_PASSWORD, 12);
  await prisma.user.create({
    data: { email: TEST_ADMIN_EMAIL, passwordHash, role: "ADMIN", status: "ACTIVE" },
  });
  await prisma.$disconnect();

  // 이미 빌드된 .next 산출물을 테스트 전용 포트/DB로 기동한다.
  serverProcess = spawn("npx", ["next", "start", "-p", String(TEST_PORT)], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: TEST_DATABASE_URL,
      AUTH_SECRET: process.env.AUTH_SECRET ?? "test-only-secret-for-vitest-integration-tests",
      NODE_ENV: "production",
      RATE_LIMIT_DISABLED: "1",
    },
    stdio: "pipe",
  });

  let stderrBuffer = "";
  serverProcess.stderr?.on("data", (chunk) => {
    const text = chunk.toString();
    stderrBuffer += text;
    if (!text.includes("ExperimentalWarning")) process.stderr.write(`[next-test-server] ${text}`);
  });

  try {
    await waitForServer(`${TEST_BASE_URL}/recruit`, 30000, serverProcess);
  } catch (err) {
    throw new Error(`${(err as Error).message}\n--- stderr ---\n${stderrBuffer}`);
  }
}

export async function teardown() {
  if (serverProcess) {
    serverProcess.kill("SIGTERM");
  }
  // 확실하게 포트를 반환해 다음 실행이 좀비에 붙는 일이 없게 한다.
  freePortIfOccupied(TEST_PORT);
}
