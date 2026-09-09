import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/session";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hashPassword("Test1234!");

  const admin = await prisma.user.upsert({
    where: { email: "admin@hihong.recruit" },
    update: {},
    create: {
      email: "admin@hihong.recruit",
      passwordHash,
      role: Role.ADMIN,
      name: "관리자",
    },
  });

  const seeker = await prisma.user.upsert({
    where: { email: "seeker@example.com" },
    update: {},
    create: {
      email: "seeker@example.com",
      passwordHash,
      role: Role.JOB_SEEKER,
      name: "김지원",
      jobSeekerProfile: {
        create: {
          name: "김지원",
          nationality: "KR",
          desiredJobCategory: "서비스",
          desiredWorkRegion: "부산",
          careerYears: 3,
          koreanLevel: "상",
          skills: "고객응대, POS",
        },
      },
    },
    include: { jobSeekerProfile: true },
  });

  const companyUser = await prisma.user.upsert({
    where: { email: "company@example.com" },
    update: {},
    create: {
      email: "company@example.com",
      passwordHash,
      role: Role.COMPANY,
      name: "이담당",
      companyProfile: {
        create: {
          companyName: "하이홍 테스트 컴퍼니",
          industry: "F&B",
          verificationStatus: "VERIFIED",
          verifiedAt: new Date(),
          address: "부산광역시",
          contactName: "이담당",
          contactEmail: "company@example.com",
        },
      },
    },
    include: { companyProfile: true },
  });

  const company = companyUser.companyProfile!;

  const existingPost = await prisma.jobPost.findFirst({
    where: { companyId: company.id, title: "홀서비스 직원 모집" },
  });
  if (!existingPost) {
    await prisma.jobPost.create({
      data: {
        companyId: company.id,
        title: "홀서비스 직원 모집",
        jobCategory: "서비스",
        description: "매장 홀 서비스 및 고객 응대",
        responsibilities: "주문 접수, 서빙, 매장 청결 유지",
        requirements: "관련 경력 우대",
        employmentType: "정규직",
        salaryType: "월급",
        salaryMin: 250,
        salaryMax: 320,
        workLocation: "부산",
        foreignerAllowed: true,
        visaConditions: "E-7, E-9 등 취업가능 비자",
        koreanLevel: "중",
        housingSupport: true,
        mealSupport: true,
        status: "OPEN",
      },
    });
  }

  const benchmarkJobs = [
    {
      title: "외식업 홀·주방 스태프",
      jobCategory: "외식",
      description: "F&B Service & Kitchen Staff — HIHONG PEOPLE 벤치마크 직종",
      workLocation: "부산 · 경남",
      employmentType: "정규직 / 계약직",
      housingSupport: true,
      mealSupport: true,
    },
    {
      title: "숙박업 하우스키핑",
      jobCategory: "숙박",
      description: "Lodging Housekeeping — HIHONG PEOPLE 벤치마크 직종",
      workLocation: "부산 · 경남",
      employmentType: "정규직 / 파견",
      housingSupport: true,
      mealSupport: true,
    },
    {
      title: "생산·제조 인력",
      jobCategory: "제조",
      description: "Manufacturing & Production — HIHONG PEOPLE 벤치마크 직종",
      workLocation: "경남",
      employmentType: "정규직 / 파견",
      housingSupport: false,
      mealSupport: true,
    },
    {
      title: "물류·창고 인력",
      jobCategory: "물류",
      description: "Logistics & Warehouse — HIHONG PEOPLE 벤치마크 직종",
      workLocation: "부산 · 경남",
      employmentType: "정규직 / 파견",
      housingSupport: false,
      mealSupport: false,
    },
  ];

  for (const job of benchmarkJobs) {
    const found = await prisma.jobPost.findFirst({
      where: { companyId: company.id, title: job.title },
    });
    if (!found) {
      await prisma.jobPost.create({
        data: {
          companyId: company.id,
          ...job,
          foreignerAllowed: true,
          visaConditions: "취업가능 비자 — 공식 확인 필요",
          koreanLevel: "초급~중급",
          status: "OPEN",
          responsibilities: "채용 기업 요청에 따라 확정",
          requirements: "국적·언어·한국어 수준·경력·희망지역 확인",
        },
      });
    }
  }

  const resumeCount = await prisma.resume.count({ where: { userId: seeker.id } });
  if (resumeCount === 0) {
    await prisma.resume.create({
      data: {
        userId: seeker.id,
        title: "대표 이력서",
        profileSummary: "서비스 경력 3년",
        desiredJob: "서비스",
        desiredLocation: "부산",
        desiredSalary: 300,
        employmentType: "정규직",
        visibility: "PUBLIC",
        status: "COMPLETE",
        isPrimary: true,
        careers: {
          create: [
            {
              companyName: "테스트카페",
              jobTitle: "홀직원",
              description: "고객 응대",
              isCurrent: false,
            },
          ],
        },
        languages: {
          create: [
            { language: "한국어", level: "상" },
            { language: "영어", level: "중" },
          ],
        },
        skills: {
          create: [{ name: "고객응대" }, { name: "POS" }],
        },
      },
    });
  }

  console.log(
    JSON.stringify(
      {
        seeded: true,
        accounts: {
          admin: admin.email,
          seeker: seeker.email,
          company: companyUser.email,
          password: "Test1234!",
        },
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
