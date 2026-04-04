import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { preCourseEmail } from "@/lib/email-templates";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const attendeeIds = (body as { attendeeIds?: string[] }).attendeeIds;

  // Fetch event with course and clinic
  const event = await prisma.courseEvent.findUnique({
    where: { id },
    include: {
      course: true,
      clinic: true,
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Get slide deck materials for the course
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

  // Fetch attendees
  const whereClause = attendeeIds
    ? { id: { in: attendeeIds }, courseEventId: id }
    : { courseEventId: id };

  const attendees = await prisma.attendee.findMany({ where: whereClause });

  if (attendees.length === 0) {
    return NextResponse.json({ error: "No attendees found" }, { status: 404 });
  }

  const formattedDate = event.eventDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const materialLinks = materials.map((m) => ({
    title: m.title,
    url: m.fileUrl,
  }));

  let sentCount = 0;

  for (const attendee of attendees) {
    if (!attendee.email) continue;

    const { subject, html } = preCourseEmail({
      attendeeName: attendee.firstName,
      courseTitle: event.course.title,
      eventDate: formattedDate,
      clinicName: event.clinic.name,
      materialLinks,
      prerequisiteInfo,
    });

    try {
      await sendEmail({ to: attendee.email, subject, html });
      sentCount++;
    } catch (err) {
      console.error(`Failed to send materials to ${attendee.email}:`, err);
    }
  }

  return NextResponse.json({ sent: sentCount, total: attendees.length });
}
