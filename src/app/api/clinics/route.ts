import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { state: { contains: search, mode: "insensitive" } },
      ];
    }

    const clinics = await prisma.clinic.findMany({
      where,
      include: {
        _count: {
          select: { contacts: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(clinics);
  } catch (error) {
    console.error("Error fetching clinics:", error);
    return NextResponse.json(
      { error: "Failed to fetch clinics" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const data: Record<string, unknown> = {
      name: body.name,
      city: body.city,
      state: body.state,
      status: body.status || "LEAD",
      tags: body.tags || [],
    };
    if (body.type) data.type = body.type;
    if (body.source) data.source = body.source;
    if (body.phone) data.phone = body.phone;
    if (body.website) data.website = body.website;
    if (body.notes) data.notes = body.notes;
    if (body.estimatedSize) {
      const parsed = parseInt(body.estimatedSize, 10);
      if (!isNaN(parsed)) data.estimatedSize = parsed;
    }

    const clinic = await prisma.clinic.create({ data });

    return NextResponse.json(clinic, { status: 201 });
  } catch (error) {
    console.error("Error creating clinic:", error);
    return NextResponse.json(
      { error: "Failed to create clinic" },
      { status: 500 }
    );
  }
}
