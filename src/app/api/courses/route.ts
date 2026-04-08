import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor");

    const include = { _count: { select: { courseEvents: true } } };

    if (limitParam) {
      const limit = Math.min(parseInt(limitParam) || 50, 200);
      const queryOptions: any = {
        take: limit + 1,
        include,
        orderBy: { title: "asc" },
      };

      if (cursor) {
        queryOptions.skip = 1;
        queryOptions.cursor = { id: cursor };
      }

      const items = await prisma.course.findMany(queryOptions);
      const hasMore = items.length > limit;
      if (hasMore) items.pop();

      return NextResponse.json({
        data: items,
        nextCursor: hasMore ? items[items.length - 1].id : null,
        hasMore,
      });
    }

    const courses = await prisma.course.findMany({
      orderBy: { title: "asc" },
      include,
    });
    return NextResponse.json(courses);
  } catch (error) {
    console.error("GET /api/courses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    if (!body.shortCode || typeof body.shortCode !== "string") {
      return NextResponse.json({ error: "shortCode is required" }, { status: 400 });
    }

    const course = await prisma.course.create({ data: body });
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("POST /api/courses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
