import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.courseEvent.findUnique({
    where: { id },
    include: { course: true, clinic: true },
  });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(event);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (body.eventDate) body.eventDate = new Date(body.eventDate);
  const event = await prisma.courseEvent.update({ where: { id }, data: body });
  return NextResponse.json(event);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.courseEvent.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
