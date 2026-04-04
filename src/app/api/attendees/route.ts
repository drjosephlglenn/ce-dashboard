import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseEventId = searchParams.get("courseEventId");

  const where: Record<string, unknown> = {};
  if (courseEventId) where.courseEventId = courseEventId;

  const attendees = await prisma.attendee.findMany({
    where,
    orderBy: { lastName: "asc" },
  });
  return NextResponse.json(attendees);
}

export async function POST(req: Request) {
  const body = await req.json();
  const attendee = await prisma.attendee.create({
    data: {
      ...body,
      amountPaid: body.amountPaid ? parseFloat(body.amountPaid) : 0,
    },
  });

  // Update attendee count on the course event
  const count = await prisma.attendee.count({
    where: { courseEventId: body.courseEventId },
  });
  await prisma.courseEvent.update({
    where: { id: body.courseEventId },
    data: { attendeeCount: count },
  });

  return NextResponse.json(attendee, { status: 201 });
}
