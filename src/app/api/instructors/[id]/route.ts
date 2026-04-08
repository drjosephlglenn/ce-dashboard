import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const instructor = await prisma.instructor.findUnique({
      where: { id },
      include: {
        courseEvents: {
          orderBy: { eventDate: "desc" },
          include: {
            course: true,
            clinic: true,
          },
        },
      },
    });
    if (!instructor) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
    }
    return NextResponse.json(instructor);
  } catch (error) {
    console.error("GET /api/instructors/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Request body is required" }, { status: 400 });
    }

    const instructor = await prisma.instructor.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(instructor);
  } catch (error) {
    console.error("PATCH /api/instructors/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.instructor.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/instructors/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
