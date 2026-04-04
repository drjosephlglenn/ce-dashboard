import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sequenceId, clinicId } = body;

    if (!sequenceId || !clinicId) {
      return NextResponse.json(
        { error: "sequenceId and clinicId are required" },
        { status: 400 }
      );
    }

    const enrollment = await prisma.sequenceEnrollment.create({
      data: {
        sequenceId,
        clinicId,
      },
    });
    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to enroll in sequence" }, { status: 500 });
  }
}
