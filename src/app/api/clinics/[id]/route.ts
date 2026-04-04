import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id },
      include: {
        contacts: true,
        courseEvents: {
          include: { course: true, attendees: true },
          orderBy: { eventDate: "desc" },
        },
        outreachLogs: {
          include: { contact: true },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: "Clinic not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(clinic);
  } catch (error) {
    console.error("Error fetching clinic:", error);
    return NextResponse.json(
      { error: "Failed to fetch clinic" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();

    const clinic = await prisma.clinic.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(clinic);
  } catch (error) {
    console.error("Error updating clinic:", error);
    return NextResponse.json(
      { error: "Failed to update clinic" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.clinic.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting clinic:", error);
    return NextResponse.json(
      { error: "Failed to delete clinic" },
      { status: 500 }
    );
  }
}
