-- CreateEnum
CREATE TYPE "Role" AS ENUM ('JOB_SEEKER', 'COMPANY', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'UNSPECIFIED');

-- CreateEnum
CREATE TYPE "CompanyVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ResumeVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ResumeStatus" AS ENUM ('DRAFT', 'COMPLETED');

-- CreateEnum
CREATE TYPE "EducationStatus" AS ENUM ('ENROLLED', 'ON_LEAVE', 'GRADUATED', 'DROPPED_OUT');

-- CreateEnum
CREATE TYPE "ProficiencyLevel" AS ENUM ('BASIC', 'INTERMEDIATE', 'ADVANCED', 'NATIVE');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'DAILY', 'INTERNSHIP', 'FREELANCE');

-- CreateEnum
CREATE TYPE "SalaryType" AS ENUM ('HOURLY', 'DAILY', 'MONTHLY', 'ANNUAL', 'NEGOTIABLE');

-- CreateEnum
CREATE TYPE "JobPostStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'DOCUMENT_REVIEW', 'INTERVIEW_REQUESTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ScoutStatus" AS ENUM ('PENDING', 'OPENED', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPLICATION_SUBMITTED', 'APPLICATION_WITHDRAWN', 'NEW_APPLICANT', 'APPLICATION_STATUS_CHANGED', 'INTERVIEW_REQUESTED', 'INTERVIEW_CONFIRMED', 'SCOUT_RECEIVED', 'SCOUT_ACCEPTED', 'OFFER_RECEIVED', 'CONTRACT_RECEIVED', 'HIRED', 'VISA_EXPIRY_WARNING', 'SYSTEM');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('ONLINE', 'OFFLINE', 'PHONE', 'AI_PRESCREEN');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'AGREED', 'SIGNED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VisaVerificationStatus" AS ENUM ('AI_ESTIMATED', 'NEEDS_OFFICIAL_CHECK', 'ADMIN_VERIFIED');

-- CreateEnum
CREATE TYPE "TranslationSourceType" AS ENUM ('JOB_POST', 'RESUME', 'MESSAGE', 'INTERVIEW', 'OFFER', 'CONTRACT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "email_verified_at" TIMESTAMP(3),
    "withdrawn_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_seeker_profiles" (
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profile_image_url" TEXT,
    "birth_date" TIMESTAMP(3),
    "gender" "Gender",
    "phone" TEXT,
    "residence_region" TEXT,
    "desired_region" TEXT,
    "desired_job_category" TEXT,
    "desired_salary_min" INTEGER,
    "desired_salary_max" INTEGER,
    "desired_employment_type" "EmploymentType",
    "available_from" TIMESTAMP(3),
    "self_introduction" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "career_years" INTEGER,
    "nationality" TEXT,
    "native_language" TEXT,
    "current_country" TEXT,
    "korea_resident" BOOLEAN NOT NULL DEFAULT false,
    "korea_location" TEXT,
    "korean_level" "ProficiencyLevel",
    "english_level" "ProficiencyLevel",
    "preferred_language" TEXT,
    "auto_translate_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_seeker_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "company_profiles" (
    "user_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "business_registration_number" TEXT NOT NULL,
    "representative_name" TEXT,
    "industry" TEXT,
    "company_size" TEXT,
    "company_intro" TEXT,
    "address" TEXT,
    "homepage_url" TEXT,
    "contact_name" TEXT,
    "contact_phone" TEXT,
    "contact_email" TEXT,
    "logo_url" TEXT,
    "verification_status" "CompanyVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "visa_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "visa_type" TEXT NOT NULL,
    "visa_status" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "employment_allowed" BOOLEAN NOT NULL DEFAULT false,
    "verification_status" "VisaVerificationStatus" NOT NULL DEFAULT 'AI_ESTIMATED',
    "verified_by_admin_id" TEXT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visa_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "profile_summary" TEXT,
    "desired_job" TEXT,
    "desired_location" TEXT,
    "desired_salary" INTEGER,
    "employment_type" "EmploymentType",
    "available_date" TIMESTAMP(3),
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "visibility" "ResumeVisibility" NOT NULL DEFAULT 'PRIVATE',
    "status" "ResumeStatus" NOT NULL DEFAULT 'DRAFT',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_careers" (
    "id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "position" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "responsibilities" TEXT,
    "resign_reason" TEXT,

    CONSTRAINT "resume_careers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_educations" (
    "id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "school_name" TEXT NOT NULL,
    "major" TEXT,
    "degree" TEXT,
    "admission_date" TIMESTAMP(3),
    "graduation_date" TIMESTAMP(3),
    "status" "EducationStatus" NOT NULL DEFAULT 'GRADUATED',

    CONSTRAINT "resume_educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_certificates" (
    "id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT,
    "acquired_date" TIMESTAMP(3),

    CONSTRAINT "resume_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_languages" (
    "id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "level" "ProficiencyLevel" NOT NULL,

    CONSTRAINT "resume_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_portfolios" (
    "id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "description" TEXT,

    CONSTRAINT "resume_portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_posts" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "job_category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "responsibilities" TEXT,
    "requirements" TEXT,
    "preferred_conditions" TEXT,
    "employment_type" "EmploymentType" NOT NULL,
    "salary_type" "SalaryType" NOT NULL,
    "salary_min" INTEGER,
    "salary_max" INTEGER,
    "work_location" TEXT NOT NULL,
    "work_days" TEXT,
    "work_hours" TEXT,
    "break_time" TEXT,
    "recruitment_count" INTEGER,
    "deadline" TIMESTAMP(3),
    "foreigner_allowed" BOOLEAN NOT NULL DEFAULT false,
    "visa_conditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "korean_level" "ProficiencyLevel",
    "housing_support" BOOLEAN NOT NULL DEFAULT false,
    "meal_support" BOOLEAN NOT NULL DEFAULT false,
    "transportation_support" BOOLEAN NOT NULL DEFAULT false,
    "status" "JobPostStatus" NOT NULL DEFAULT 'DRAFT',
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "job_post_id" TEXT NOT NULL,
    "job_seeker_id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "company_memo" TEXT,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawn_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_histories" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "from_status" "ApplicationStatus",
    "to_status" "ApplicationStatus" NOT NULL,
    "changed_by_user_id" TEXT,
    "memo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_scraps" (
    "id" TEXT NOT NULL,
    "job_seeker_id" TEXT NOT NULL,
    "job_post_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_scraps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talent_bookmarks" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "job_seeker_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "talent_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talent_view_logs" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "viewer_user_id" TEXT NOT NULL,
    "job_seeker_id" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "talent_view_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scout_offers" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "job_seeker_id" TEXT NOT NULL,
    "sender_user_id" TEXT NOT NULL,
    "job_post_id" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ScoutStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scout_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "link_url" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "job_post_id" TEXT,
    "application_id" TEXT,
    "job_seeker_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "translated_content" JSONB,
    "attachment_url" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interviews" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "company_user_id" TEXT NOT NULL,
    "job_seeker_id" TEXT NOT NULL,
    "interview_type" "InterviewType" NOT NULL,
    "scheduled_at" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "status" "InterviewStatus" NOT NULL DEFAULT 'REQUESTED',
    "meeting_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_prescreen_results" (
    "id" TEXT NOT NULL,
    "interview_id" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "answers" JSONB NOT NULL,
    "summary" TEXT,
    "key_experiences" TEXT,
    "needs_verification" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_prescreen_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_offers" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "job_seeker_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "company_user_id" TEXT NOT NULL,
    "salary" INTEGER NOT NULL,
    "employment_type" "EmploymentType" NOT NULL,
    "work_location" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "working_hours" TEXT,
    "benefits" TEXT,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employment_contracts" (
    "id" TEXT NOT NULL,
    "contract_group_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "application_id" TEXT NOT NULL,
    "job_offer_id" TEXT,
    "job_seeker_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "company_user_id" TEXT NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "content_original" TEXT NOT NULL,
    "content_translated" TEXT,
    "translated_language" TEXT,
    "sent_at" TIMESTAMP(3),
    "viewed_at" TIMESTAMP(3),
    "agreed_at" TIMESTAMP(3),
    "signed_at" TIMESTAMP(3),
    "signature_hash" TEXT,
    "integrity_hash" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employment_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translations" (
    "id" TEXT NOT NULL,
    "source_type" "TranslationSourceType" NOT NULL,
    "source_id" TEXT NOT NULL,
    "source_language" TEXT NOT NULL,
    "target_language" TEXT NOT NULL,
    "source_text" TEXT NOT NULL,
    "translated_text" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "created_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "action" TEXT NOT NULL,
    "target_type" TEXT,
    "target_id" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_profiles_business_registration_number_key" ON "company_profiles"("business_registration_number");

-- CreateIndex
CREATE UNIQUE INDEX "visa_profiles_user_id_key" ON "visa_profiles"("user_id");

-- CreateIndex
CREATE INDEX "visa_profiles_expiry_date_idx" ON "visa_profiles"("expiry_date");

-- CreateIndex
CREATE INDEX "resumes_user_id_idx" ON "resumes"("user_id");

-- CreateIndex
CREATE INDEX "resume_careers_resume_id_idx" ON "resume_careers"("resume_id");

-- CreateIndex
CREATE INDEX "resume_educations_resume_id_idx" ON "resume_educations"("resume_id");

-- CreateIndex
CREATE INDEX "resume_certificates_resume_id_idx" ON "resume_certificates"("resume_id");

-- CreateIndex
CREATE INDEX "resume_languages_resume_id_idx" ON "resume_languages"("resume_id");

-- CreateIndex
CREATE INDEX "resume_portfolios_resume_id_idx" ON "resume_portfolios"("resume_id");

-- CreateIndex
CREATE INDEX "job_posts_status_job_category_idx" ON "job_posts"("status", "job_category");

-- CreateIndex
CREATE INDEX "job_posts_work_location_idx" ON "job_posts"("work_location");

-- CreateIndex
CREATE INDEX "job_posts_deadline_idx" ON "job_posts"("deadline");

-- CreateIndex
CREATE INDEX "applications_job_post_id_idx" ON "applications"("job_post_id");

-- CreateIndex
CREATE INDEX "applications_job_seeker_id_idx" ON "applications"("job_seeker_id");

-- CreateIndex
CREATE INDEX "applications_company_id_status_idx" ON "applications"("company_id", "status");

-- CreateIndex
CREATE INDEX "application_histories_application_id_idx" ON "application_histories"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_scraps_job_seeker_id_job_post_id_key" ON "job_scraps"("job_seeker_id", "job_post_id");

-- CreateIndex
CREATE UNIQUE INDEX "talent_bookmarks_company_id_job_seeker_id_key" ON "talent_bookmarks"("company_id", "job_seeker_id");

-- CreateIndex
CREATE INDEX "talent_view_logs_company_id_idx" ON "talent_view_logs"("company_id");

-- CreateIndex
CREATE INDEX "talent_view_logs_job_seeker_id_idx" ON "talent_view_logs"("job_seeker_id");

-- CreateIndex
CREATE INDEX "scout_offers_job_seeker_id_status_idx" ON "scout_offers"("job_seeker_id", "status");

-- CreateIndex
CREATE INDEX "scout_offers_company_id_idx" ON "scout_offers"("company_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_application_id_key" ON "conversations"("application_id");

-- CreateIndex
CREATE INDEX "conversations_job_seeker_id_idx" ON "conversations"("job_seeker_id");

-- CreateIndex
CREATE INDEX "conversations_company_id_idx" ON "conversations"("company_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");

-- CreateIndex
CREATE INDEX "interviews_application_id_idx" ON "interviews"("application_id");

-- CreateIndex
CREATE INDEX "interviews_job_seeker_id_idx" ON "interviews"("job_seeker_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_prescreen_results_interview_id_key" ON "ai_prescreen_results"("interview_id");

-- CreateIndex
CREATE INDEX "job_offers_application_id_idx" ON "job_offers"("application_id");

-- CreateIndex
CREATE INDEX "job_offers_job_seeker_id_idx" ON "job_offers"("job_seeker_id");

-- CreateIndex
CREATE INDEX "employment_contracts_contract_group_id_idx" ON "employment_contracts"("contract_group_id");

-- CreateIndex
CREATE INDEX "employment_contracts_application_id_idx" ON "employment_contracts"("application_id");

-- CreateIndex
CREATE INDEX "translations_source_type_source_id_idx" ON "translations"("source_type", "source_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_idx" ON "audit_logs"("actor_user_id");

-- CreateIndex
CREATE INDEX "audit_logs_target_type_target_id_idx" ON "audit_logs"("target_type", "target_id");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_seeker_profiles" ADD CONSTRAINT "job_seeker_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visa_profiles" ADD CONSTRAINT "visa_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_careers" ADD CONSTRAINT "resume_careers_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_educations" ADD CONSTRAINT "resume_educations_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_certificates" ADD CONSTRAINT "resume_certificates_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_languages" ADD CONSTRAINT "resume_languages_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_portfolios" ADD CONSTRAINT "resume_portfolios_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_posts" ADD CONSTRAINT "job_posts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_post_id_fkey" FOREIGN KEY ("job_post_id") REFERENCES "job_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_seeker_id_fkey" FOREIGN KEY ("job_seeker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_histories" ADD CONSTRAINT "application_histories_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_histories" ADD CONSTRAINT "application_histories_changed_by_user_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_scraps" ADD CONSTRAINT "job_scraps_job_seeker_id_fkey" FOREIGN KEY ("job_seeker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_scraps" ADD CONSTRAINT "job_scraps_job_post_id_fkey" FOREIGN KEY ("job_post_id") REFERENCES "job_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_bookmarks" ADD CONSTRAINT "talent_bookmarks_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_bookmarks" ADD CONSTRAINT "talent_bookmarks_job_seeker_id_fkey" FOREIGN KEY ("job_seeker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_view_logs" ADD CONSTRAINT "talent_view_logs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_view_logs" ADD CONSTRAINT "talent_view_logs_viewer_user_id_fkey" FOREIGN KEY ("viewer_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_view_logs" ADD CONSTRAINT "talent_view_logs_job_seeker_id_fkey" FOREIGN KEY ("job_seeker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scout_offers" ADD CONSTRAINT "scout_offers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scout_offers" ADD CONSTRAINT "scout_offers_job_seeker_id_fkey" FOREIGN KEY ("job_seeker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scout_offers" ADD CONSTRAINT "scout_offers_sender_user_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scout_offers" ADD CONSTRAINT "scout_offers_job_post_id_fkey" FOREIGN KEY ("job_post_id") REFERENCES "job_posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_job_post_id_fkey" FOREIGN KEY ("job_post_id") REFERENCES "job_posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_job_seeker_id_fkey" FOREIGN KEY ("job_seeker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_company_user_id_fkey" FOREIGN KEY ("company_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_job_seeker_id_fkey" FOREIGN KEY ("job_seeker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_prescreen_results" ADD CONSTRAINT "ai_prescreen_results_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_job_seeker_id_fkey" FOREIGN KEY ("job_seeker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_company_user_id_fkey" FOREIGN KEY ("company_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_contracts" ADD CONSTRAINT "employment_contracts_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_contracts" ADD CONSTRAINT "employment_contracts_job_offer_id_fkey" FOREIGN KEY ("job_offer_id") REFERENCES "job_offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_contracts" ADD CONSTRAINT "employment_contracts_job_seeker_id_fkey" FOREIGN KEY ("job_seeker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_contracts" ADD CONSTRAINT "employment_contracts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_contracts" ADD CONSTRAINT "employment_contracts_company_user_id_fkey" FOREIGN KEY ("company_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
