import { prisma } from "@/lib/db";
import { preCourseEmail } from "@/lib/email-templates";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await prisma.courseEvent.findUnique({
      where: { id },
      include: { course: true, clinic: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get slide deck materials
    const materials = await prisma.material.findMany({
      where: { courseId: event.courseId, type: "SLIDE_DECK" },
    });

    // Check for prerequisite course
    let prerequisiteInfo: { title: string; ceuHours: number } | null = null;
    if (event.course.prerequisiteCourseId) {
      const prereq = await prisma.course.findUnique({
        where: { id: event.course.prerequisiteCourseId },
      });
      if (prereq) {
        prerequisiteInfo = { title: prereq.title, ceuHours: prereq.ceuHours };
      }
    }

    // Fetch attendees with email
    const attendees = await prisma.attendee.findMany({
      where: { courseEventId: id },
    });

    const withEmail = attendees.filter((a) => a.email);

    const formattedDate = event.eventDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const materialLinks = materials.map((m) => ({
      title: m.title,
      url: m.fileUrl,
    }));

    // Generate a sample email using first attendee's name (or "Attendee")
    const sampleName = withEmail.length > 0 ? withEmail[0].firstName : "Attendee";
    const { subject, html } = preCourseEmail({
      attendeeName: sampleName,
      courseTitle: event.course.title,
      eventDate: formattedDate,
      clinicName: event.clinic.name,
      materialLinks,
      prerequisiteInfo,
    });

    return NextResponse.json({
      attendeeCount: withEmail.length,
      attendees: withEmail.map((a) => ({
        name: `${a.firstName} ${a.lastName}`,
        email: a.email,
      })),
      subject,
      html,
    });
  } catch (error) {
    console.error("GET /api/events/[id]/send-materials/preview error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
