import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const instructors = await prisma.instructor.findMany({
      orderBy: { lastName: "asc" },
      include: {
        _count: { select: { courseEvents: true } },
      },
    });
    return NextResponse.json(instructors);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch instructors" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const instructor = await prisma.instructor.create({ data: body });
    return NextResponse.json(instructor, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create instructor" }, { status: 500 });
  }
}
