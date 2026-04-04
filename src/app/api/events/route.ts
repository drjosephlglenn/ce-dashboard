import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
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

  const events = await prisma.courseEvent.findMany({
    where,
    include: { course: true, clinic: true },
    orderBy: { eventDate: "asc" },
  });
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const body = await req.json();
  const event = await prisma.courseEvent.create({
    data: {
      ...body,
      eventDate: new Date(body.eventDate),
    },
  });
  return NextResponse.json(event, { status: 201 });
}
