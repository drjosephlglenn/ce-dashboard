-- CreateEnum
CREATE TYPE "RegistrationType" AS ENUM ('PAID', 'FREE_HOST_SEAT', 'COMP');

-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('SLIDE_DECK', 'HANDOUT', 'FLYER', 'CERTIFICATE_TEMPLATE', 'MARKETING_EMAIL', 'SOCIAL_MEDIA', 'CONTRACT', 'INVOICE_TEMPLATE', 'PHOTO', 'VIDEO', 'OTHER');

-- CreateEnum
CREATE TYPE "FinancialType" AS ENUM ('COURSE_REVENUE', 'ONLINE_SALE', 'DEPOSIT', 'HOST_INCENTIVE_PAYOUT', 'TRAVEL_EXPENSE', 'INSTRUCTOR_PAY', 'OPERATING_EXPENSE', 'REFUND');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CHECK', 'BANK_TRANSFER', 'CREDIT_CARD', 'CASH', 'STRIPE', 'OTHER');

-- CreateTable
CREATE TABLE "Attendee" (
    "id" TEXT NOT NULL,
    "courseEventId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "credentials" TEXT NOT NULL DEFAULT '',
    "clinicId" TEXT,
    "registrationType" "RegistrationType" NOT NULL DEFAULT 'PAID',
    "amountPaid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "ceuCertificateIssued" BOOLEAN NOT NULL DEFAULT false,
    "surveyCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "courseId" TEXT,
    "title" TEXT NOT NULL,
    "type" "MaterialType" NOT NULL DEFAULT 'OTHER',
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "mimeType" TEXT NOT NULL DEFAULT '',
    "version" TEXT NOT NULL DEFAULT 'v1.0',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialRecord" (
    "id" TEXT NOT NULL,
    "courseEventId" TEXT,
    "type" "FinancialType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'OTHER',
    "invoiceNumber" TEXT,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "taxDeductible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_courseEventId_fkey" FOREIGN KEY ("courseEventId") REFERENCES "CourseEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialRecord" ADD CONSTRAINT "FinancialRecord_courseEventId_fkey" FOREIGN KEY ("courseEventId") REFERENCES "CourseEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
