import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

  // All financial records this year
  const records = await prisma.financialRecord.findMany({
    where: { date: { gte: yearStart, lte: yearEnd } },
  });

  // Calculate totals
  let ytdRevenue = 0;
  let ytdExpenses = 0;
  const revenueByMonth = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(now.getFullYear(), i).toLocaleString("en-US", { month: "short" }),
    revenue: 0,
    expenses: 0,
  }));

  const revenueByType: Record<string, number> = {};

  for (const r of records) {
    const amt = Number(r.amount);
    const month = new Date(r.date).getMonth();

    if (amt >= 0) {
      ytdRevenue += amt;
      revenueByMonth[month].revenue += amt;
      revenueByType[r.type] = (revenueByType[r.type] || 0) + amt;
    } else {
      ytdExpenses += Math.abs(amt);
      revenueByMonth[month].expenses += Math.abs(amt);
    }
  }

  // Outstanding (unpaid)
  const outstanding = await prisma.financialRecord.findMany({
    where: { isPaid: false, amount: { gt: 0 } },
    include: { courseEvent: { include: { clinic: true } } },
    orderBy: { date: "asc" },
  });

  const outstandingTotal = outstanding.reduce((sum, r) => sum + Number(r.amount), 0);

  return NextResponse.json({
    ytdRevenue,
    ytdExpenses,
    netIncome: ytdRevenue - ytdExpenses,
    revenueByMonth,
    revenueByType,
    outstandingTotal,
    outstandingCount: outstanding.length,
    revenueGoal: 150000,
  });
}
