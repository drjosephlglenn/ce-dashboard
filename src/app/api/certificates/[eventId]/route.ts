import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  const event = await prisma.courseEvent.findUnique({
    where: { id: eventId },
    include: { course: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const attendees = await prisma.attendee.findMany({
    where: { courseEventId: eventId },
    orderBy: { lastName: "asc" },
  });

  const dateStr = event.eventDate.toISOString().slice(0, 10).replace(/-/g, "");

  const result = attendees.map((a, i) => ({
    id: a.id,
    firstName: a.firstName,
    lastName: a.lastName,
    email: a.email,
    ceuCertificateIssued: a.ceuCertificateIssued,
    certificateNumber: a.ceuCertificateIssued
      ? `SL-${event.course.shortCode}-${dateStr}-${String(i + 1).padStart(3, "0")}`
      : null,
  }));

  return NextResponse.json(result);
}
