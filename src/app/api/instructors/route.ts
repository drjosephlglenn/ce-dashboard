import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor");

    const include = {
      _count: { select: { courseEvents: true } },
    };

    if (limitParam) {
      const limit = Math.min(parseInt(limitParam) || 50, 200);
      const queryOptions: any = {
        take: limit + 1,
        include,
        orderBy: { lastName: "asc" },
      };

      if (cursor) {
        queryOptions.skip = 1;
        queryOptions.cursor = { id: cursor };
      }

      const items = await prisma.instructor.findMany(queryOptions);
      const hasMore = items.length > limit;
      if (hasMore) items.pop();

      return NextResponse.json({
        data: items,
        nextCursor: hasMore ? items[items.length - 1].id : null,
        hasMore,
      });
    }

    const instructors = await prisma.instructor.findMany({
      orderBy: { lastName: "asc" },
      include,
    });
    return NextResponse.json(instructors);
  } catch (error) {
    console.error("GET /api/instructors error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.firstName) {
      return NextResponse.json({ error: "firstName is required" }, { status: 400 });
    }
    if (!body.lastName) {
      return NextResponse.json({ error: "lastName is required" }, { status: 400 });
    }
    if (!body.email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const instructor = await prisma.instructor.create({ data: body });
    return NextResponse.json(instructor, { status: 201 });
  } catch (error) {
    console.error("POST /api/instructors error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
