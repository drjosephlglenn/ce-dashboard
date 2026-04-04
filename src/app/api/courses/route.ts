import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const courses = await prisma.course.findMany({
    orderBy: { title: "asc" },
    include: { _count: { select: { courseEvents: true } } },
  });
  return NextResponse.json(courses);
}

export async function POST(req: Request) {
  const body = await req.json();
  const course = await prisma.course.create({ data: body });
  return NextResponse.json(course, { status: 201 });
}
