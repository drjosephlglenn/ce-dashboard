import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  try {
    const event = await prisma.courseEvent.findUnique({
      where: { id: eventId },
      include: {
        course: {
          select: {
            title: true,
            description: true,
            ceuHours: true,
            targetAudience: true,
            maxAttendees: true,
          },
        },
        clinic: {
          select: {
            name: true,
            city: true,
            state: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "CONFIRMED" && event.status !== "DEPOSIT_RECEIVED") {
      return NextResponse.json({ error: "Event not available for registration" }, { status: 404 });
    }

    return NextResponse.json({
      id: event.id,
      eventDate: event.eventDate,
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type,
      status: event.status,
      maxAttendees: event.course.maxAttendees,
      attendeeCount: event.attendeeCount,
      course: event.course,
      clinic: event.clinic,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  try {
    const body = await req.json();
    const { firstName, lastName, email, credentials, registrationType } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "firstName, lastName, and email are required" },
        { status: 400 }
      );
    }

    const event = await prisma.courseEvent.findUnique({
      where: { id: eventId },
      include: { course: { select: { maxAttendees: true } } },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "CONFIRMED" && event.status !== "DEPOSIT_RECEIVED") {
      return NextResponse.json({ error: "Event not available for registration" }, { status: 400 });
    }

    if (event.course.maxAttendees && event.attendeeCount >= event.course.maxAttendees) {
      return NextResponse.json({ error: "Event is full" }, { status: 400 });
    }

    const [attendee] = await prisma.$transaction([
      prisma.attendee.create({
        data: {
          firstName,
          lastName,
          email,
          credentials,
          registrationType,
          courseEventId: eventId,
        },
      }),
      prisma.courseEvent.update({
        where: { id: eventId },
        data: { attendeeCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true, id: attendee.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to register attendee" }, { status: 500 });
  }
}
