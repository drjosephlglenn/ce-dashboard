import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const record = await prisma.financialRecord.findUnique({
      where: { id },
      include: { courseEvent: { include: { course: true, clinic: true } } },
    });
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(record);
  } catch (error) {
    console.error("GET /api/finances/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Request body is required" }, { status: 400 });
    }

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
  } catch (error) {
    console.error("PATCH /api/finances/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.financialRecord.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/finances/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
