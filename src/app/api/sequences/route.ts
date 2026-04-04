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
    return NextResponse.json({ error: "Failed to fetch sequences" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, trigger, steps } = body;

    const sequence = await prisma.emailSequence.create({
      data: {
        name,
        trigger,
        steps,
      },
    });
    return NextResponse.json(sequence, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create sequence" }, { status: 500 });
  }
}
