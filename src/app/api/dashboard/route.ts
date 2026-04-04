import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  // Financial records this year
  const records = await prisma.financialRecord.findMany({
    where: { date: { gte: yearStart } },
  });

  let ytdRevenue = 0;
  let ytdExpenses = 0;
  const revenueByMonth = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(now.getFullYear(), i).toLocaleString("en-US", { month: "short" }),
    revenue: 0,
  }));

  for (const r of records) {
    const amt = Number(r.amount);
    const month = new Date(r.date).getMonth();
    if (amt >= 0) {
      ytdRevenue += amt;
      revenueByMonth[month].revenue += amt;
    } else {
      ytdExpenses += Math.abs(amt);
    }
  }

  // Course events
  const coursesDelivered = await prisma.courseEvent.count({
    where: { status: "COMPLETED", eventDate: { gte: yearStart } },
  });

  const coursesBooked = await prisma.courseEvent.count({
    where: {
      status: { in: ["CONFIRMED", "DEPOSIT_RECEIVED", "TENTATIVE"] },
      eventDate: { gte: now },
    },
  });

  // Overdue follow-ups
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const overdueFollowUps = await prisma.outreachLog.count({
    where: {
      followUpDate: { lt: startOfDay },
      followUpCompleted: false,
    },
  });

  // Pipeline value (estimated revenue from interested + booked clinics)
  const pipelineClinics = await prisma.clinic.count({
    where: { status: { in: ["INTERESTED", "BOOKED"] } },
  });
  const pipelineValue = pipelineClinics * 10000; // Rough estimate at $10K avg per clinic

  // Upcoming courses
  const upcomingCourses = await prisma.courseEvent.findMany({
    where: { eventDate: { gte: now } },
    include: { course: true, clinic: true },
    orderBy: { eventDate: "asc" },
    take: 5,
  });

  // Overdue follow-up details
  const overdueItems = await prisma.outreachLog.findMany({
    where: {
      followUpDate: { lt: startOfDay },
      followUpCompleted: false,
    },
    include: { clinic: true },
    orderBy: { followUpDate: "asc" },
    take: 5,
  });

  return NextResponse.json({
    ytdRevenue,
    ytdExpenses,
    netIncome: ytdRevenue - ytdExpenses,
    coursesDelivered,
    coursesBooked,
    overdueFollowUps,
    pipelineValue,
    revenueGoal: 150000,
    revenueByMonth,
    upcomingCourses,
    overdueItems,
  });
}
