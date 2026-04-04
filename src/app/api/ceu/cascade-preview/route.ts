import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Preview which states would be auto-approved if a given state is approved
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const stateRequirementId = searchParams.get("stateRequirementId");
  const courseId = searchParams.get("courseId");

  if (!stateRequirementId) {
    return NextResponse.json({ cascadeStates: [] });
  }

  const sourceState = await prisma.stateRequirement.findUnique({
    where: { id: stateRequirementId },
  });

  if (!sourceState) {
    return NextResponse.json({ cascadeStates: [] });
  }

  const bodyId = `${sourceState.stateCode}-PT`;

  // Find all states that accept this body OR accept ANY-STATE-PT
  const acceptingStates = await prisma.stateRequirement.findMany({
    where: {
      OR: [
        { acceptedBodies: { has: bodyId } },
        { acceptedBodies: { has: "ANY-STATE-PT" } },
      ],
      id: { not: sourceState.id },
    },
    select: { id: true, stateCode: true, stateName: true },
  });

  // Filter out states that already have an active approval for this course
  const cascadeStates: { id: string; stateCode: string; stateName: string; alreadyApproved: boolean }[] = [];

  for (const state of acceptingStates) {
    let alreadyApproved = false;
    if (courseId) {
      const existing = await prisma.courseApproval.findUnique({
        where: {
          courseId_stateRequirementId: {
            courseId,
            stateRequirementId: state.id,
          },
        },
      });
      alreadyApproved = !!existing && existing.status !== "NOT_STARTED";
    }
    cascadeStates.push({ ...state, alreadyApproved });
  }

  return NextResponse.json({
    sourceState: { stateCode: sourceState.stateCode, stateName: sourceState.stateName, bodyId },
    cascadeStates,
    newApprovals: cascadeStates.filter((s) => !s.alreadyApproved).length,
  });
}
