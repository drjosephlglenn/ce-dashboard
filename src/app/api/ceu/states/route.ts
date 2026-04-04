import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const states = await prisma.stateRequirement.findMany({
    include: {
      approvals: {
        include: { course: { select: { id: true, title: true, shortCode: true } } },
      },
    },
    orderBy: { stateName: "asc" },
  });
  return NextResponse.json(states);
}

export async function POST(req: Request) {
  const body = await req.json();
  const state = await prisma.stateRequirement.upsert({
    where: { stateCode: body.stateCode },
    update: {
      stateName: body.stateName,
      boardName: body.boardName || "",
      boardUrl: body.boardUrl || "",
      requiresPreApproval: body.requiresPreApproval ?? false,
      acceptsOtherStates: body.acceptsOtherStates ?? false,
      acceptedBodies: body.acceptedBodies || [],
      ceuRequiredPerCycle: body.ceuRequiredPerCycle || 0,
      renewalCycleYears: body.renewalCycleYears || 2,
      applicationFee: body.applicationFee || 0,
      applicationUrl: body.applicationUrl || "",
      notes: body.notes || "",
      ptLicenseType: body.ptLicenseType || "PT",
    },
    create: body,
  });
  return NextResponse.json(state, { status: 201 });
}
