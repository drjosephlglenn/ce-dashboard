import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clinicId = searchParams.get("clinicId");
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = {};
    if (clinicId) where.clinicId = clinicId;
    if (status) where.status = status;
    if (from || to) {
      where.eventDate = {};
      if (from) (where.eventDate as Record<string, unknown>).gte = new Date(from);
      if (to) (where.eventDate as Record<string, unknown>).lte = new Date(to);
    }

    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor");

    const include = { course: true, clinic: true };

    if (limitParam) {
      const limit = Math.min(parseInt(limitParam) || 50, 200);
      const queryOptions: any = {
        take: limit + 1,
        where,
        include,
        orderBy: { eventDate: "asc" },
      };

      if (cursor) {
        queryOptions.skip = 1;
        queryOptions.cursor = { id: cursor };
      }

      const items = await prisma.courseEvent.findMany(queryOptions);
      const hasMore = items.length > limit;
      if (hasMore) items.pop();

      return NextResponse.json({
        data: items,
        nextCursor: hasMore ? items[items.length - 1].id : null,
        hasMore,
      });
    }

    const events = await prisma.courseEvent.findMany({
      where,
      include,
      orderBy: { eventDate: "asc" },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }
    if (!body.clinicId) {
      return NextResponse.json({ error: "clinicId is required" }, { status: 400 });
    }
    if (!body.eventDate) {
      return NextResponse.json({ error: "eventDate is required" }, { status: 400 });
    }

    const event = await prisma.courseEvent.create({
      data: {
        ...body,
        eventDate: new Date(body.eventDate),
      },
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
