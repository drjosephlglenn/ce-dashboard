import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const type = searchParams.get("type");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (courseId) where.courseId = courseId;
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { tags: { has: search } },
    ];
  }

  const materials = await prisma.material.findMany({
    where,
    include: { course: { select: { id: true, title: true, shortCode: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(materials);
}

export async function POST(req: Request) {
  const body = await req.json();
  const material = await prisma.material.create({ data: body });
  return NextResponse.json(material, { status: 201 });
}
