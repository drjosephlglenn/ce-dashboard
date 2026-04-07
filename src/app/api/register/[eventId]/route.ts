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

    // Calculate pricing for public events
    const now = new Date();
    const eventDate = new Date(event.eventDate);
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isEarlyBird = daysUntilEvent > event.earlyBirdCutoffDays;
    const currentPrice = event.type === "PUBLIC"
      ? (isEarlyBird ? Number(event.earlyBirdPrice) : Number(event.standardPrice))
      : 0;

    // Calculate early bird deadline date
    const earlyBirdDeadline = new Date(eventDate);
    earlyBirdDeadline.setDate(earlyBirdDeadline.getDate() - event.earlyBirdCutoffDays);

    return NextResponse.json({
      id: event.id,
      eventDate: event.eventDate,
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type,
      status: event.status,
      maxAttendees: event.maxAttendees,
      attendeeCount: event.attendeeCount,
      course: event.course,
      clinic: event.clinic,
      // Pricing info
      standardPrice: Number(event.standardPrice),
      earlyBirdPrice: Number(event.earlyBirdPrice),
      currentPrice,
      isEarlyBird,
      earlyBirdDeadline: earlyBirdDeadline.toISOString(),
      daysUntilEvent,
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
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "CONFIRMED" && event.status !== "DEPOSIT_RECEIVED") {
      return NextResponse.json({ error: "Event not available for registration" }, { status: 400 });
    }

    if (event.attendeeCount >= event.maxAttendees) {
      return NextResponse.json({ error: "Event is full" }, { status: 400 });
    }

    // Calculate price for public events
    let amountPaid = 0;
    let regType = registrationType || "PAID";
    if (event.type === "PUBLIC" && regType === "PAID") {
      const now = new Date();
      const eventDate = new Date(event.eventDate);
      const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isEarlyBird = daysUntilEvent > event.earlyBirdCutoffDays;
      amountPaid = isEarlyBird ? Number(event.earlyBirdPrice) : Number(event.standardPrice);
    }

    const [attendee] = await prisma.$transaction([
      prisma.attendee.create({
        data: {
          firstName,
          lastName,
          email,
          credentials: credentials || "",
          registrationType: regType,
          amountPaid,
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
