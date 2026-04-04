-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "bibliography" JSONB,
ADD COLUMN     "instructionalLevel" TEXT NOT NULL DEFAULT 'Intermediate to Advanced',
ADD COLUMN     "learningObjectives" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "prerequisites" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "schedule" JSONB;
