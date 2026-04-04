-- CreateEnum
CREATE TYPE "ClinicType" AS ENUM ('PRIVATE_PRACTICE', 'HOSPITAL_SYSTEM', 'OUTPATIENT', 'SNF', 'OTHER');

-- CreateEnum
CREATE TYPE "ClinicStatus" AS ENUM ('LEAD', 'CONTACTED', 'INTERESTED', 'BOOKED', 'ACTIVE', 'CHURNED');

-- CreateEnum
CREATE TYPE "ClinicSource" AS ENUM ('EXISTING_NETWORK', 'REFERRAL', 'COLD_OUTREACH', 'CONFERENCE', 'INBOUND', 'OTHER');

-- CreateEnum
CREATE TYPE "ContactRole" AS ENUM ('OWNER', 'CLINIC_DIRECTOR', 'EDUCATION_COORD', 'MANAGER', 'CLINICIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "CourseFormat" AS ENUM ('LIVE_PRIVATE', 'LIVE_PUBLIC', 'ONLINE_SELF_PACED', 'HYBRID');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('TENTATIVE', 'CONFIRMED', 'DEPOSIT_RECEIVED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OutreachMethod" AS ENUM ('EMAIL', 'PHONE', 'IN_PERSON', 'SOCIAL_MEDIA', 'TEXT', 'OTHER');

-- CreateEnum
CREATE TYPE "OutreachDirection" AS ENUM ('OUTBOUND', 'INBOUND');

-- CreateEnum
CREATE TYPE "OutreachOutcome" AS ENUM ('NO_RESPONSE', 'INTERESTED', 'NOT_INTERESTED', 'FOLLOW_UP_NEEDED', 'BOOKED', 'REFERRED');

-- CreateTable
CREATE TABLE "Clinic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ClinicType" NOT NULL DEFAULT 'PRIVATE_PRACTICE',
    "address" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL DEFAULT '',
    "region" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "website" TEXT,
    "status" "ClinicStatus" NOT NULL DEFAULT 'LEAD',
    "source" "ClinicSource" NOT NULL DEFAULT 'OTHER',
    "estimatedSize" INTEGER,
    "notes" TEXT NOT NULL DEFAULT '',
    "lastContactDate" TIMESTAMP(3),
    "nextFollowUpDate" TIMESTAMP(3),
    "lifetimeRevenue" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT,
    "role" "ContactRole" NOT NULL DEFAULT 'OTHER',
    "isPrimaryContact" BOOLEAN NOT NULL DEFAULT false,
    "credentials" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "ceuHours" INTEGER NOT NULL DEFAULT 0,
    "targetAudience" TEXT NOT NULL DEFAULT 'PTs, PTAs, ATCs',
    "format" "CourseFormat" NOT NULL DEFAULT 'LIVE_PRIVATE',
    "maxAttendees" INTEGER NOT NULL DEFAULT 30,
    "defaultPrice" DECIMAL(65,30) NOT NULL DEFAULT 10000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "materialsFolder" TEXT,
    "version" TEXT NOT NULL DEFAULT 'v1.0',
    "prerequisiteCourseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseEvent" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL DEFAULT '08:00',
    "endTime" TEXT NOT NULL DEFAULT '16:00',
    "type" "EventType" NOT NULL DEFAULT 'PRIVATE',
    "status" "EventStatus" NOT NULL DEFAULT 'TENTATIVE',
    "priceCharged" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "depositAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "depositPaidDate" TIMESTAMP(3),
    "totalRevenue" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "attendeeCount" INTEGER NOT NULL DEFAULT 0,
    "hostIncentivePaid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "travelCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "travelCoveredByClinic" BOOLEAN NOT NULL DEFAULT false,
    "feedbackScore" DECIMAL(65,30),
    "notes" TEXT NOT NULL DEFAULT '',
    "postEventFollowUpSent" BOOLEAN NOT NULL DEFAULT false,
    "rebookingPitched" BOOLEAN NOT NULL DEFAULT false,
    "rebookedForNextYear" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutreachLog" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "contactId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" "OutreachMethod" NOT NULL DEFAULT 'EMAIL',
    "direction" "OutreachDirection" NOT NULL DEFAULT 'OUTBOUND',
    "subject" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "outcome" "OutreachOutcome" NOT NULL DEFAULT 'NO_RESPONSE',
    "followUpDate" TIMESTAMP(3),
    "followUpCompleted" BOOLEAN NOT NULL DEFAULT false,
    "emailTemplateUsed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutreachLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_shortCode_key" ON "Course"("shortCode");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEvent" ADD CONSTRAINT "CourseEvent_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEvent" ADD CONSTRAINT "CourseEvent_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachLog" ADD CONSTRAINT "OutreachLog_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachLog" ADD CONSTRAINT "OutreachLog_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
