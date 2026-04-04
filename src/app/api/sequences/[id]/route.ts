import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const sequence = await prisma.emailSequence.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(sequence);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update sequence" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.sequenceEnrollment.deleteMany({ where: { sequenceId: id } });
    await prisma.emailSequence.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete sequence" }, { status: 500 });
  }
}
