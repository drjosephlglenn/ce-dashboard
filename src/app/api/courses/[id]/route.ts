import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        courseEvents: {
          include: { clinic: true, financialRecords: true },
          orderBy: { eventDate: "desc" },
        },
      },
    });
    if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(course);
  } catch (error) {
    console.error("GET /api/courses/[id] error:", error);
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

    const course = await prisma.course.update({ where: { id }, data: body });
    return NextResponse.json(course);
  } catch (error) {
    console.error("PATCH /api/courses/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/courses/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
