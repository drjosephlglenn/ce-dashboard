import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear() + 1, 0, 1);

    // Pipeline funnel: count clinics per status
    const pipelineFunnel = await prisma.clinic.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const funnelMap: Record<string, number> = {};
    for (const status of ["LEAD", "CONTACTED", "INTERESTED", "BOOKED", "ACTIVE", "CHURNED"]) {
      const match = pipelineFunnel.find((p) => p.status === status);
      funnelMap[status] = match?._count.id ?? 0;
    }

    // Revenue by month for current year
    const financialRecords = await prisma.financialRecord.findMany({
      where: {
        date: { gte: yearStart, lt: yearEnd },
      },
      select: { date: true, amount: true },
    });

    const monthlyRevenue: { month: string; revenue: number }[] = [];
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    for (let i = 0; i < 12; i++) {
      monthlyRevenue.push({ month: monthNames[i], revenue: 0 });
    }
    for (const record of financialRecords) {
      const monthIndex = new Date(record.date).getMonth();
      monthlyRevenue[monthIndex].revenue += Number(record.amount);
    }

    // Courses ranked by event count and total revenue (completed events)
    const completedEvents = await prisma.courseEvent.findMany({
      where: { status: "COMPLETED" },
      include: {
        course: { select: { id: true, title: true } },
        financialRecords: { select: { amount: true } },
      },
    });

    const courseMap = new Map<string, { title: string; eventCount: number; totalRevenue: number }>();
    for (const event of completedEvents) {
      const key = event.course.id;
      const existing = courseMap.get(key) || { title: event.course.title, eventCount: 0, totalRevenue: 0 };
      existing.eventCount += 1;
      existing.totalRevenue += event.financialRecords.reduce(
        (sum, r) => sum + Number(r.amount),
        0
      );
      courseMap.set(key, existing);
    }
    const coursesRanked = Array.from(courseMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.eventCount - a.eventCount || b.totalRevenue - a.totalRevenue);

    // Top 10 clinics by lifetime revenue
    const topClinics = await prisma.clinic.findMany({
      orderBy: { lifetimeRevenue: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        lifetimeRevenue: true,
      },
    });

    // Rebooking rate: ACTIVE clinics with rebookedForNextYear on any event
    const activeClinics = await prisma.clinic.count({
      where: { status: "ACTIVE" },
    });

    const rebookedClinics = await prisma.clinic.count({
      where: {
        status: "ACTIVE",
        courseEvents: {
          some: { rebookedForNextYear: true },
        },
      },
    });

    const rebookingRate = activeClinics > 0
      ? Math.round((rebookedClinics / activeClinics) * 100) / 100
      : 0;

    // Total attendees this year
    const totalAttendees = await prisma.attendee.count({
      where: {
        createdAt: { gte: yearStart, lt: yearEnd },
      },
    });

    return NextResponse.json({
      pipelineFunnel: funnelMap,
      revenueByMonth: monthlyRevenue,
      coursesRanked,
      topClinics,
      rebookingRate,
      totalAttendees,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
