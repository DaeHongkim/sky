/**
 * 최초 관리자 계정 시딩. 관리자는 별도 회원가입 화면이 없으므로(spec: "관리자 로그인"만 존재),
 * 이 스크립트로 최초 계정을 만든 뒤 반드시 비밀번호를 변경한다.
 * 실행: npm run db:seed
 * 기존 데이터를 삭제하지 않는다 — upsert만 사용한다.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@hihong-recruit.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`[seed] admin ready: ${admin.email} (role=${admin.role})`);
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log(
      "[seed] SEED_ADMIN_PASSWORD가 설정되지 않아 기본 비밀번호를 사용했습니다. 로그인 후 즉시 변경하세요."
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
