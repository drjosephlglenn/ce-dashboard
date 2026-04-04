import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await prisma.financialRecord.findUnique({
    where: { id },
    include: { courseEvent: { include: { course: true, clinic: true } } },
  });
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(record);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (body.date) body.date = new Date(body.date);
  if (body.amount !== undefined) body.amount = parseFloat(body.amount);
  // Allow explicitly setting courseEventId to null (unlink)
  if ("courseEventId" in body && !body.courseEventId) {
    body.courseEventId = null;
  }
  const record = await prisma.financialRecord.update({
    where: { id },
    data: body,
    include: { courseEvent: { include: { course: true, clinic: true } } },
  });
  return NextResponse.json(record);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.financialRecord.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
