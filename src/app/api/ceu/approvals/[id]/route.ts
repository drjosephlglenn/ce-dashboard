import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.status !== undefined) data.status = body.status;
  if (body.providerNumber !== undefined) data.providerNumber = body.providerNumber;
  if (body.approvedCeuHours !== undefined) data.approvedCeuHours = body.approvedCeuHours;
  if (body.applicationDate !== undefined) data.applicationDate = body.applicationDate ? new Date(body.applicationDate) : null;
  if (body.approvalDate !== undefined) data.approvalDate = body.approvalDate ? new Date(body.approvalDate) : null;
  if (body.expirationDate !== undefined) data.expirationDate = body.expirationDate ? new Date(body.expirationDate) : null;
  if (body.cost !== undefined) data.cost = body.cost;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.documentUrl !== undefined) data.documentUrl = body.documentUrl;

  const approval = await prisma.courseApproval.update({ where: { id }, data });
  return NextResponse.json(approval);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.courseApproval.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
