import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clinicId = searchParams.get("clinicId");
  const overdue = searchParams.get("overdue");
  const today = searchParams.get("today");

  const where: Record<string, unknown> = {};
  if (clinicId) where.clinicId = clinicId;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 86400000);

  if (overdue === "true") {
    where.followUpDate = { lt: startOfDay };
    where.followUpCompleted = false;
  }
  if (today === "true") {
    where.followUpDate = { gte: startOfDay, lt: endOfDay };
    where.followUpCompleted = false;
  }

  const limitParam = searchParams.get("limit");
  const cursor = searchParams.get("cursor");

  const include = { clinic: true, contact: true };

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

    const items = await prisma.outreachLog.findMany(queryOptions);
    const hasMore = items.length > limit;
    if (hasMore) items.pop();

    return NextResponse.json({
      data: items,
      nextCursor: hasMore ? items[items.length - 1].id : null,
      hasMore,
    });
  }

  const logs = await prisma.outreachLog.findMany({
    where,
    include,
    orderBy: { date: "desc" },
  });
  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const body = await req.json();
  const log = await prisma.outreachLog.create({
    data: {
      ...body,
      date: body.date ? new Date(body.date) : new Date(),
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
    },
  });

  // Update clinic's lastContactDate and nextFollowUpDate
  const updateData: Record<string, unknown> = { lastContactDate: new Date() };
  if (body.followUpDate) updateData.nextFollowUpDate = new Date(body.followUpDate);
  await prisma.clinic.update({ where: { id: body.clinicId }, data: updateData });

  return NextResponse.json(log, { status: 201 });
}
