import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (body.followUpDate) body.followUpDate = new Date(body.followUpDate);
  const log = await prisma.outreachLog.update({ where: { id }, data: body });
  return NextResponse.json(log);
}
