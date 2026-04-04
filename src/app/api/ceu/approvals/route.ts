import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  const where = courseId ? { courseId } : {};

  const approvals = await prisma.courseApproval.findMany({
    where,
    include: {
      course: { select: { id: true, title: true, shortCode: true } },
      stateRequirement: { select: { id: true, stateCode: true, stateName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(approvals);
}

export async function POST(req: Request) {
  const body = await req.json();

  // Create/update the primary approval
  const approval = await prisma.courseApproval.upsert({
    where: {
      courseId_stateRequirementId: {
        courseId: body.courseId,
        stateRequirementId: body.stateRequirementId,
      },
    },
    update: {
      status: body.status,
      providerNumber: body.providerNumber || "",
      approvedCeuHours: body.approvedCeuHours || 0,
      applicationDate: body.applicationDate ? new Date(body.applicationDate) : null,
      approvalDate: body.approvalDate ? new Date(body.approvalDate) : null,
      expirationDate: body.expirationDate ? new Date(body.expirationDate) : null,
      cost: body.cost || 0,
      notes: body.notes || "",
      documentUrl: body.documentUrl || "",
    },
    create: {
      courseId: body.courseId,
      stateRequirementId: body.stateRequirementId,
      status: body.status || "NOT_STARTED",
      providerNumber: body.providerNumber || "",
      approvedCeuHours: body.approvedCeuHours || 0,
      applicationDate: body.applicationDate ? new Date(body.applicationDate) : null,
      approvalDate: body.approvalDate ? new Date(body.approvalDate) : null,
      expirationDate: body.expirationDate ? new Date(body.expirationDate) : null,
      cost: body.cost || 0,
      notes: body.notes || "",
      documentUrl: body.documentUrl || "",
    },
  });

  // Cascade: if this approval is APPROVED, auto-approve states that accept this body
  let cascaded: string[] = [];
  if (body.status === "APPROVED" && body.cascade !== false) {
    // Get the source state info
    const sourceState = await prisma.stateRequirement.findUnique({
      where: { id: body.stateRequirementId },
    });

    if (sourceState) {
      // The body identifier for this state (e.g., "TX-PT", "CA-PT")
      const bodyId = `${sourceState.stateCode}-PT`;

      // Find all states that accept this specific body OR accept ANY-STATE-PT
      const acceptingStates = await prisma.stateRequirement.findMany({
        where: {
          OR: [
            { acceptedBodies: { has: bodyId } },
            { acceptedBodies: { has: "ANY-STATE-PT" } },
          ],
          id: { not: sourceState.id },
        },
      });

      for (const targetState of acceptingStates) {
        // Only cascade if no existing approval or existing one is NOT_STARTED
        const existing = await prisma.courseApproval.findUnique({
          where: {
            courseId_stateRequirementId: {
              courseId: body.courseId,
              stateRequirementId: targetState.id,
            },
          },
        });

        if (!existing || existing.status === "NOT_STARTED") {
          const reason = targetState.acceptedBodies.includes(bodyId)
            ? `Auto-approved via ${sourceState.stateName} (${bodyId}) recognition`
            : `Auto-approved — ${targetState.stateName} accepts any state PT board approval`;

          await prisma.courseApproval.upsert({
            where: {
              courseId_stateRequirementId: {
                courseId: body.courseId,
                stateRequirementId: targetState.id,
              },
            },
            update: {
              status: "APPROVED",
              providerNumber: body.providerNumber || "",
              approvedCeuHours: body.approvedCeuHours || 0,
              approvalDate: body.approvalDate ? new Date(body.approvalDate) : new Date(),
              expirationDate: body.expirationDate ? new Date(body.expirationDate) : null,
              notes: reason,
            },
            create: {
              courseId: body.courseId,
              stateRequirementId: targetState.id,
              status: "APPROVED",
              providerNumber: body.providerNumber || "",
              approvedCeuHours: body.approvedCeuHours || 0,
              approvalDate: body.approvalDate ? new Date(body.approvalDate) : new Date(),
              expirationDate: body.expirationDate ? new Date(body.expirationDate) : null,
              notes: reason,
            },
          });
          cascaded.push(targetState.stateName);
        }
      }
    }
  }

  return NextResponse.json({ approval, cascaded }, { status: 201 });
}
