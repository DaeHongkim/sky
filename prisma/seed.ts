import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Passw0rd!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@hihong.recruit" },
    update: {},
    create: {
      email: "admin@hihong.recruit",
      passwordHash,
      role: Role.ADMIN,
      name: "하이홍 관리자",
    },
  });

  const seeker = await prisma.user.upsert({
    where: { email: "seeker@example.com" },
    update: {},
    create: {
      email: "seeker@example.com",
      passwordHash,
      role: Role.JOB_SEEKER,
      name: "김구직",
      jobSeekerProfile: {
        create: {
          name: "김구직",
          email: "seeker@example.com",
          phone: "010-1111-2222",
          residenceRegion: "서울",
          desiredWorkRegions: ["서울", "경기"],
          desiredJobCategories: ["글로벌 인재 매칭 및 HR"],
          desiredSalaryMin: 3000000,
          skills: ["HR", "영어"],
          careerYears: 3,
          nationality: "KR",
          koreaResident: true,
          koreanLevel: "원어민",
        },
      },
    },
  });

  const companyUser = await prisma.user.upsert({
    where: { email: "company@hihong.recruit" },
    update: {},
    create: {
      email: "company@hihong.recruit",
      passwordHash,
      role: Role.COMPANY,
      name: "박담당",
      companyProfile: {
        create: {
          companyName: "주식회사 하이홍화토",
          businessNumber: "123-45-67890",
          representative: "대표",
          industry: "F&B / HR",
          companySize: "50-100",
          description: "브랜드와 공간, 사업의 가능성을 연결합니다.",
          address: "서울특별시",
          contactName: "박담당",
          contactEmail: "company@hihong.recruit",
          verificationStatus: "VERIFIED",
          verifiedAt: new Date(),
        },
      },
    },
    include: { companyProfile: true },
  });

  const companyId = companyUser.companyProfile!.id;

  const existingJob = await prisma.jobPost.findFirst({
    where: { companyId, title: "글로벌 인재 매칭 및 HR" },
  });

  if (!existingJob) {
    await prisma.jobPost.create({
      data: {
        companyId,
        title: "글로벌 인재 매칭 및 HR",
        jobCategory: "HR",
        description: "다국적 인재 풀 구축, 맞춤형 매칭 및 글로벌 파트너십 구축",
        responsibilities: "인재 소싱, 인터뷰 운영, 파트너십",
        requirements: "HR 경력 2년 이상",
        employmentType: "정규직",
        salaryType: "월급",
        salaryMin: 3200000,
        salaryMax: 4500000,
        workLocation: "서울",
        workDays: "월-금",
        workHours: "09:00-18:00",
        foreignerAllowed: true,
        visaConditions: "합법 취업비자",
        koreanLevel: "중급 이상",
        housingSupport: false,
        mealSupport: true,
        transportationSupport: true,
        status: "OPEN",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const resumeCount = await prisma.resume.count({ where: { userId: seeker.id } });
  if (resumeCount === 0) {
    await prisma.resume.create({
      data: {
        userId: seeker.id,
        title: "대표 이력서",
        profileSummary: "HR 및 글로벌 매칭 경험",
        desiredJob: "글로벌 인재 매칭 및 HR",
        desiredLocation: "서울",
        desiredSalary: 3500000,
        employmentType: "정규직",
        visibility: "PUBLIC",
        status: "COMPLETE",
        isPrimary: true,
        careers: {
          create: [
            {
              companyName: "이전회사",
              jobTitle: "HR Associate",
              description: "채용 운영",
              isCurrent: false,
            },
          ],
        },
        languages: {
          create: [
            { language: "한국어", level: "원어민" },
            { language: "영어", level: "중급" },
          ],
        },
        skills: {
          create: [{ name: "채용" }, { name: "면접" }],
        },
      },
    });
  }

  console.log("Seed complete:", {
    admin: admin.email,
    seeker: seeker.email,
    company: companyUser.email,
    password: "Passw0rd!",
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
