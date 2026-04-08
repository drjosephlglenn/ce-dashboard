import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const isPaid = searchParams.get("isPaid");
    const clinicId = searchParams.get("clinicId");

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (isPaid !== null && isPaid !== undefined) where.isPaid = isPaid === "true";
    if (from || to) {
      where.date = {};
      if (from) (where.date as Record<string, unknown>).gte = new Date(from);
      if (to) (where.date as Record<string, unknown>).lte = new Date(to);
    }
    if (clinicId) {
      where.courseEvent = { clinicId };
    }
    const courseEventId = searchParams.get("courseEventId");
    if (courseEventId) {
      where.courseEventId = courseEventId;
    }

    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor");

    const include = { courseEvent: { include: { course: true, clinic: true } } };

    if (limitParam) {
      const limit = Math.min(parseInt(limitParam) || 50, 200);
      const queryOptions: any = {
        take: limit + 1,
        where,
        include,
        orderBy: { date: "desc" },
      };

      if (cursor) {
        queryOptions.skip = 1;
        queryOptions.cursor = { id: cursor };
      }

      const items = await prisma.financialRecord.findMany(queryOptions);
      const hasMore = items.length > limit;
      if (hasMore) items.pop();

      return NextResponse.json({
        data: items,
        nextCursor: hasMore ? items[items.length - 1].id : null,
        hasMore,
      });
    }

    const records = await prisma.financialRecord.findMany({
      where,
      include,
      orderBy: { date: "desc" },
    });
    return NextResponse.json(records);
  } catch (error) {
    console.error("GET /api/finances error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.type) {
      return NextResponse.json({ error: "type is required" }, { status: 400 });
    }
    if (body.amount === undefined || body.amount === null || isNaN(Number(body.amount))) {
      return NextResponse.json({ error: "amount is required and must be a number" }, { status: 400 });
    }

    const record = await prisma.financialRecord.create({
      data: {
        ...body,
        date: body.date ? new Date(body.date) : new Date(),
        amount: parseFloat(body.amount),
      },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("POST /api/finances error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
