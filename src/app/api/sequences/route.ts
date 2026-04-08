import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sequences = await prisma.emailSequence.findMany({
      include: {
        _count: { select: { enrollments: true } },
      },
    });
    return NextResponse.json(sequences);
  } catch (error) {
    console.error("GET /api/sequences error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, trigger, steps } = body;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (!trigger) {
      return NextResponse.json({ error: "trigger is required" }, { status: 400 });
    }

    const sequence = await prisma.emailSequence.create({
      data: {
        name,
        trigger,
        steps,
      },
    });
    return NextResponse.json(sequence, { status: 201 });
  } catch (error) {
    console.error("POST /api/sequences error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
