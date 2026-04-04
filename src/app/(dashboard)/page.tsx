"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { DollarSign, GraduationCap, CalendarDays, AlertCircle, Plus, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardData {
  ytdRevenue: number;
  coursesDelivered: number;
  coursesBooked: number;
  overdueFollowUps: number;
  pipelineValue: number;
  revenueGoal: number;
  revenueByMonth: { month: string; revenue: number }[];
  upcomingCourses: Array<{
    id: string;
    eventDate: string;
    startTime: string;
    status: string;
    type: string;
    course: { title: string; shortCode: string };
    clinic: { name: string; city: string; state: string };
  }>;
  overdueItems: Array<{
    id: string;
    followUpDate: string;
    method: string;
    clinic: { id: string; name: string };
  }>;
}

export default function DashboardPage() {
  const today = format(new Date(), "EEEE, MMMM d, yyyy");
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(setData);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#D7D3CD] tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          Welcome back, Joey
        </h1>
        <p className="text-sm text-[#B9B6AF] mt-1">{today}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="YTD Revenue"
          value={data ? formatCurrency(data.ytdRevenue) : "$0"}
          subtitle={data ? `of ${formatCurrency(data.revenueGoal)} goal` : "of $150K goal"}
          icon={DollarSign}
        />
        <KpiCard
          title="Courses Delivered"
          value={data ? String(data.coursesDelivered) : "0"}
          subtitle="this year"
          icon={GraduationCap}
        />
        <KpiCard
          title="Courses Booked"
          value={data ? String(data.coursesBooked) : "0"}
          subtitle="upcoming"
          icon={CalendarDays}
        />
        <KpiCard
          title="Overdue Follow-Ups"
          value={data ? String(data.overdueFollowUps) : "0"}
          subtitle="needs attention"
          icon={AlertCircle}
        />
      </div>

      {/* Revenue Trend Chart */}
      {data && data.revenueByMonth.some(m => m.revenue > 0) && (
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-[#8FBDA3]" />
              <h2 className="text-sm font-semibold text-[#D7D3CD]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Revenue Trend
              </h2>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueByMonth}>
                  <XAxis dataKey="month" tick={{ fill: "#B9B6AF", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#B9B6AF", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: "#363130", border: "none", borderRadius: 8, color: "#D7D3CD" }} // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any) => [formatCurrency(v), "Revenue"]} />
                  <Line type="monotone" dataKey="revenue" stroke="#8FBDA3" strokeWidth={2} dot={{ fill: "#8FBDA3", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Courses */}
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#D7D3CD] mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Upcoming Courses
            </h2>
            {!data || data.upcomingCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarDays className="h-8 w-8 text-[#B9B6AF]/30 mb-3" />
                <p className="text-sm text-[#B9B6AF]">No upcoming courses</p>
                <p className="text-xs text-[#B9B6AF]/60 mt-1">Schedule your first course to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.upcomingCourses.map((event) => (
                  <Link key={event.id} href={`/courses/events/${event.id}`} className="block">
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#363130] transition-colors">
                      <div>
                        <p className="text-sm font-medium text-[#D7D3CD]">{event.course.title}</p>
                        <p className="text-xs text-[#B9B6AF]">{event.clinic.name} &middot; {formatDate(event.eventDate)}</p>
                      </div>
                      <Badge className={`border-0 text-[9px] ${event.type === "PUBLIC" ? "bg-[#8FBDA3]/20 text-[#8FBDA3]" : "bg-blue-500/20 text-blue-400"}`}>
                        {event.type}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#D7D3CD] mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Action Items
            </h2>
            {!data || data.overdueItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-8 w-8 text-[#8FBDA3]/30 mb-3" />
                <p className="text-sm text-[#B9B6AF]">No overdue follow-ups</p>
                <p className="text-xs text-[#B9B6AF]/60 mt-1">You&apos;re all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.overdueItems.map((item) => (
                  <Link key={item.id} href={`/clinics/${item.clinic.id}`} className="block">
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#363130] transition-colors">
                      <div>
                        <p className="text-sm font-medium text-[#D7D3CD]">{item.clinic.name}</p>
                        <p className="text-xs text-red-400">Due: {formatDate(item.followUpDate)}</p>
                      </div>
                      <Badge className="bg-red-500/20 text-red-400 border-0 text-[9px]">Overdue</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs tracking-[0.16em] uppercase text-[#B9B6AF] mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/clinics/new">
            <Button className="bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90">
              <Plus className="h-4 w-4 mr-2" /> Add Clinic
            </Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline" className="border-[rgba(215,211,205,0.15)] text-[#D7D3CD] hover:bg-[#2C2828]">
              <Plus className="h-4 w-4 mr-2" /> Schedule Course
            </Button>
          </Link>
          <Link href="/outreach">
            <Button variant="outline" className="border-[rgba(215,211,205,0.15)] text-[#D7D3CD] hover:bg-[#2C2828]">
              <Plus className="h-4 w-4 mr-2" /> Log Outreach
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
