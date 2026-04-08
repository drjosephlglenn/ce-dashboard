import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const event = await prisma.courseEvent.findUnique({
      where: { id },
      include: { course: true, clinic: true },
    });
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(event);
  } catch (error) {
    console.error("GET /api/events/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Request body is required" }, { status: 400 });
    }

    if (body.eventDate) body.eventDate = new Date(body.eventDate);

    // Detect instructor assignment changes
    let previousInstructorId: string | null = null;
    if (body.instructorId) {
      const currentEvent = await prisma.courseEvent.findUnique({
        where: { id },
        select: { instructorId: true },
      });
      previousInstructorId = currentEvent?.instructorId ?? null;
    }

    const event = await prisma.courseEvent.update({ where: { id }, data: body });

    // Auto-create financial record when instructor is assigned or changed
    if (body.instructorId && body.instructorId !== previousInstructorId) {
      const instructor = await prisma.instructor.findUnique({
        where: { id: body.instructorId },
      });

      if (instructor) {
        // Remove old instructor pay record if replacing an instructor
        if (previousInstructorId) {
          await prisma.financialRecord.deleteMany({
            where: {
              courseEventId: id,
              type: "INSTRUCTOR_PAY",
            },
          });
        }

        await prisma.financialRecord.create({
          data: {
            type: "INSTRUCTOR_PAY",
            amount: -Number(instructor.payRate),
            date: new Date(),
            description: `Instructor pay: ${instructor.firstName} ${instructor.lastName}`,
            courseEventId: id,
            paymentMethod: "OTHER",
            isPaid: false,
          },
        });
      }
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("PATCH /api/events/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.courseEvent.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/events/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
