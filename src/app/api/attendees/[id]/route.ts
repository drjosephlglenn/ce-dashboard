import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (body.amountPaid) body.amountPaid = parseFloat(body.amountPaid);
  const attendee = await prisma.attendee.update({ where: { id }, data: body });
  return NextResponse.json(attendee);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const attendee = await prisma.attendee.findUnique({ where: { id } });

  if (attendee) {
    // Remove associated financial record for this registration
    await prisma.financialRecord.deleteMany({
      where: {
        courseEventId: attendee.courseEventId,
        description: `Registration: ${attendee.firstName} ${attendee.lastName}`,
      },
    });
  }

  await prisma.attendee.delete({ where: { id } });

  // Update count
  if (attendee) {
    const count = await prisma.attendee.count({
      where: { courseEventId: attendee.courseEventId },
    });
    await prisma.courseEvent.update({
      where: { id: attendee.courseEventId },
      data: { attendeeCount: count },
    });
  }

  return NextResponse.json({ ok: true });
}
