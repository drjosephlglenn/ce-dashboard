import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseEventId = searchParams.get("courseEventId");

  const where: Record<string, unknown> = {};
  if (courseEventId) where.courseEventId = courseEventId;

  const limitParam = searchParams.get("limit");
  const cursor = searchParams.get("cursor");

  if (limitParam) {
    const limit = Math.min(parseInt(limitParam) || 50, 200);
    const queryOptions: any = {
      take: limit + 1,
      where,
      orderBy: { lastName: "asc" },
    };

    if (cursor) {
      queryOptions.skip = 1;
      queryOptions.cursor = { id: cursor };
    }

    const items = await prisma.attendee.findMany(queryOptions);
    const hasMore = items.length > limit;
    if (hasMore) items.pop();

    return NextResponse.json({
      data: items,
      nextCursor: hasMore ? items[items.length - 1].id : null,
      hasMore,
    });
  }

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
