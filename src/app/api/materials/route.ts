import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
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

    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor");

    const include = { course: { select: { id: true, title: true, shortCode: true } } };

    if (limitParam) {
      const limit = Math.min(parseInt(limitParam) || 50, 200);
      const queryOptions: any = {
        take: limit + 1,
        where,
        include,
        orderBy: { createdAt: "desc" },
      };

      if (cursor) {
        queryOptions.skip = 1;
        queryOptions.cursor = { id: cursor };
      }

      const items = await prisma.material.findMany(queryOptions);
      const hasMore = items.length > limit;
      if (hasMore) items.pop();

      return NextResponse.json({
        data: items,
        nextCursor: hasMore ? items[items.length - 1].id : null,
        hasMore,
      });
    }

    const materials = await prisma.material.findMany({
      where,
      include,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(materials);
  } catch (error) {
    console.error("GET /api/materials error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    if (!body.fileUrl) {
      return NextResponse.json({ error: "fileUrl is required" }, { status: 400 });
    }

    const material = await prisma.material.create({ data: body });
    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error("POST /api/materials error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
