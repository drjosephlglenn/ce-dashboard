-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'DENIED', 'EXPIRED');

-- CreateTable
CREATE TABLE "StateRequirement" (
    "id" TEXT NOT NULL,
    "stateCode" TEXT NOT NULL,
    "stateName" TEXT NOT NULL,
    "boardName" TEXT NOT NULL DEFAULT '',
    "boardUrl" TEXT NOT NULL DEFAULT '',
    "requiresPreApproval" BOOLEAN NOT NULL DEFAULT false,
    "acceptsOtherStates" BOOLEAN NOT NULL DEFAULT false,
    "acceptedBodies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ceuRequiredPerCycle" INTEGER NOT NULL DEFAULT 0,
    "renewalCycleYears" INTEGER NOT NULL DEFAULT 2,
    "applicationFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "applicationUrl" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "ptLicenseType" TEXT NOT NULL DEFAULT 'PT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StateRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseApproval" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "stateRequirementId" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "providerNumber" TEXT NOT NULL DEFAULT '',
    "approvedCeuHours" INTEGER NOT NULL DEFAULT 0,
    "applicationDate" TIMESTAMP(3),
    "approvalDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "renewalDate" TIMESTAMP(3),
    "cost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "documentUrl" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseApproval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StateRequirement_stateCode_key" ON "StateRequirement"("stateCode");

-- CreateIndex
CREATE UNIQUE INDEX "CourseApproval_courseId_stateRequirementId_key" ON "CourseApproval"("courseId", "stateRequirementId");

-- AddForeignKey
ALTER TABLE "CourseApproval" ADD CONSTRAINT "CourseApproval_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseApproval" ADD CONSTRAINT "CourseApproval_stateRequirementId_fkey" FOREIGN KEY ("stateRequirementId") REFERENCES "StateRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
