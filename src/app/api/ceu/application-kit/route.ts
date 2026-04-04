import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// Provider-level document definitions (reusable across all applications)
const PROVIDER_DOCUMENTS = [
  { key: "provider-cv", title: "Provider CV / Resume (Joey Glenn, DC, CSCS)", tag: "provider-cv" },
  { key: "release-of-liability", title: "Release of Liability Form (for hands-on labs)", tag: "release-of-liability" },
  { key: "participant-evaluation", title: "Participant Evaluation Form", tag: "participant-evaluation" },
];

// Per-course document definitions
const COURSE_DOCUMENTS = [
  { key: "promotional-material", title: "Course Promotional Material (screenshot/flyer)", tag: "promotional-material" },
  { key: "course-schedule", title: "Detailed Course Schedule", tag: "course-schedule" },
  { key: "bibliography", title: "Course Bibliography / Works Cited", tag: "bibliography" },
  { key: "certificate-template", title: "Certificate of Completion Template", tag: "certificate-template" },
  { key: "course-description", title: "Course Description + Learning Objectives", tag: "course-description" },
];

export async function GET() {
  // Fetch all courses
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    select: { id: true, title: true, shortCode: true, ceuHours: true },
    orderBy: { title: "asc" },
  });

  // Fetch all materials tagged for the CEU kit
  const materials = await prisma.material.findMany({
    where: {
      tags: { hasSome: [
        "ceu-kit", "provider-cv", "release-of-liability", "participant-evaluation",
        "promotional-material", "course-schedule", "bibliography",
        "certificate-template", "course-description",
      ] },
    },
    include: { course: { select: { id: true, title: true, shortCode: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Build provider-level checklist
  const providerDocuments = PROVIDER_DOCUMENTS.map((doc) => {
    const match = materials.find(
      (m) => m.tags.includes(doc.tag) && !m.courseId
    );
    return {
      key: doc.key,
      title: doc.title,
      tag: doc.tag,
      uploaded: !!match,
      material: match || null,
    };
  });

  // Build per-course checklists
  const courseDocuments = courses.map((course) => {
    const docs = COURSE_DOCUMENTS.map((doc) => {
      const match = materials.find(
        (m) => m.tags.includes(doc.tag) && m.courseId === course.id
      );
      return {
        key: doc.key,
        title: doc.title,
        tag: doc.tag,
        uploaded: !!match,
        material: match || null,
      };
    });

    const completedCount = docs.filter((d) => d.uploaded).length;

    return {
      courseId: course.id,
      courseTitle: course.title,
      shortCode: course.shortCode,
      ceuHours: course.ceuHours,
      documents: docs,
      completedCount,
      totalCount: docs.length,
    };
  });

  // Calculate overall completion
  const providerCompleted = providerDocuments.filter((d) => d.uploaded).length;
  const providerTotal = providerDocuments.length;
  const courseCompleted = courseDocuments.reduce((sum, c) => sum + c.completedCount, 0);
  const courseTotal = courseDocuments.reduce((sum, c) => sum + c.totalCount, 0);
  const totalCompleted = providerCompleted + courseCompleted;
  const totalDocuments = providerTotal + courseTotal;
  const completionPercentage = totalDocuments > 0 ? Math.round((totalCompleted / totalDocuments) * 100) : 0;

  return NextResponse.json({
    providerDocuments,
    courseDocuments,
    completionPercentage,
    totalCompleted,
    totalDocuments,
  });
}
