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
    return NextResponse.json({ error: "Failed to fetch instructor" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const instructor = await prisma.instructor.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(instructor);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update instructor" }, { status: 500 });
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
    return NextResponse.json({ error: "Failed to delete instructor" }, { status: 500 });
  }
}
