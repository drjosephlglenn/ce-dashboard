import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
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

  const records = await prisma.financialRecord.findMany({
    where,
    include: { courseEvent: { include: { course: true, clinic: true } } },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(records);
}

export async function POST(req: Request) {
  const body = await req.json();
  const record = await prisma.financialRecord.create({
    data: {
      ...body,
      date: body.date ? new Date(body.date) : new Date(),
      amount: parseFloat(body.amount),
    },
  });
  return NextResponse.json(record, { status: 201 });
}
