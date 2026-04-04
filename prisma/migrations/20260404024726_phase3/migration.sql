-- CreateEnum
CREATE TYPE "InstructorStatus" AS ENUM ('PROSPECT', 'AUDITING', 'APPROVED', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SequenceTrigger" AS ENUM ('NEW_LEAD', 'POST_COURSE', 'ANNUAL_REBOOKING', 'RE_ENGAGEMENT', 'PUBLIC_COURSE_PROMO');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Clinic" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "CourseEvent" ADD COLUMN     "instructorId" TEXT;

-- CreateTable
CREATE TABLE "Instructor" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "credentials" TEXT NOT NULL DEFAULT '',
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "InstructorStatus" NOT NULL DEFAULT 'PROSPECT',
    "payRate" DECIMAL(65,30) NOT NULL DEFAULT 2500,
    "nonCompeteExpiry" TIMESTAMP(3),
    "w9OnFile" BOOLEAN NOT NULL DEFAULT false,
    "insuranceVerified" BOOLEAN NOT NULL DEFAULT false,
    "totalCoursesDelivered" INTEGER NOT NULL DEFAULT 0,
    "avgFeedbackScore" DECIMAL(65,30),
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailSequence" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trigger" "SequenceTrigger" NOT NULL,
    "steps" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SequenceEnrollment" (
    "id" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SequenceEnrollment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CourseEvent" ADD CONSTRAINT "CourseEvent_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SequenceEnrollment" ADD CONSTRAINT "SequenceEnrollment_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "EmailSequence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
