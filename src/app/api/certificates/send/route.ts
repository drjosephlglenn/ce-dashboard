import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { ceuCertificate } from "@/lib/email-templates";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { courseEventId, attendeeIds } = (await req.json()) as {
    courseEventId: string;
    attendeeIds?: string[];
  };

  // Fetch the event with course info
  const event = await prisma.courseEvent.findUnique({
    where: { id: courseEventId },
    include: { course: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Fetch attendees — specific IDs or all for this event
  const whereClause = attendeeIds
    ? { id: { in: attendeeIds }, courseEventId }
    : { courseEventId };

  const attendees = await prisma.attendee.findMany({ where: whereClause });

  if (attendees.length === 0) {
    return NextResponse.json({ error: "No attendees found" }, { status: 404 });
  }

  const dateStr = event.eventDate.toISOString().slice(0, 10).replace(/-/g, "");
  const formattedDate = event.eventDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let sentCount = 0;

  for (let i = 0; i < attendees.length; i++) {
    const attendee = attendees[i];

    if (!attendee.email) continue;

    const certNumber = `SL-${event.course.shortCode}-${dateStr}-${String(i + 1).padStart(3, "0")}`;

    const { subject, html } = ceuCertificate({
      attendeeName: `${attendee.firstName} ${attendee.lastName}`,
      courseTitle: event.course.title,
      dateCompleted: formattedDate,
      ceuHours: event.course.ceuHours,
      certificateNumber: certNumber,
    });

    try {
      await sendEmail({ to: attendee.email, subject, html });
      await prisma.attendee.update({
        where: { id: attendee.id },
        data: { ceuCertificateIssued: true },
      });
      sentCount++;
    } catch (err) {
      console.error(`Failed to send cert to ${attendee.email}:`, err);
    }
  }

  return NextResponse.json({ sent: sentCount, total: attendees.length });
}
