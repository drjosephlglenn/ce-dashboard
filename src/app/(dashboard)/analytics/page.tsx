"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

interface AnalyticsRaw {
  pipelineFunnel: Record<string, number>;
  revenueByMonth: { month: string; revenue: number }[];
  coursesRanked: { title: string; _count: { courseEvents: number }; totalRevenue: number }[];
  topClinics: { name: string; lifetimeRevenue: string | number }[];
  rebookingRate: number;
  totalAttendees: number;
}

interface AnalyticsData {
  pipelineFunnel: { stage: string; count: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  coursesRanked: { title: string; events: number; totalRevenue: number }[];
  topClinics: { name: string; lifetimeRevenue: number }[];
  rebookingRate: number;
  totalAttendees: number;
}

const FUNNEL_COLORS = [
  "#8FBDA3",
  "#3B82F6",
  "#A78BFA",
  "#D97706",
  "#EF4444",
  "#666666",
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics");
        if (!res.ok) throw new Error("Failed to fetch");
        const raw: AnalyticsRaw = await res.json();
        // Transform API response to expected format
        const transformed: AnalyticsData = {
          pipelineFunnel: Object.entries(raw.pipelineFunnel || {}).map(([stage, count]) => ({ stage, count })),
          revenueByMonth: raw.revenueByMonth || [],
          coursesRanked: (raw.coursesRanked || []).map((c) => ({
            title: c.title,
            events: c._count?.courseEvents || 0,
            totalRevenue: Number(c.totalRevenue) || 0,
          })),
          topClinics: (raw.topClinics || []).map((c) => ({
            name: c.name,
            lifetimeRevenue: Number(c.lifetimeRevenue) || 0,
          })),
          rebookingRate: raw.rebookingRate || 0,
          totalAttendees: raw.totalAttendees || 0,
        };
        setData(transformed);
      } catch {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="text-[#B9B6AF]">Loading analytics...</div>;
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-[rgba(215,211,205,0.07)] bg-[#2C2828] p-8 text-center text-[#B9B6AF]">
        Failed to load analytics data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1
        className="text-2xl font-bold text-white"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        Analytics
      </h1>

      {/* Top Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Rebooking Rate */}
        <div className="rounded-xl border border-[rgba(215,211,205,0.07)] bg-[#2C2828] p-5">
          <p className="text-sm text-[#B9B6AF]">Rebooking Rate</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className="text-4xl font-bold text-[#8FBDA3]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {data.rebookingRate}%
            </span>
            <div className="flex-1">
              <div className="h-2 w-full rounded-full bg-[#231F20]">
                <div
                  className="h-2 rounded-full bg-[#8FBDA3] transition-all"
                  style={{ width: `${Math.min(data.rebookingRate, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Total Attendees */}
        <div className="rounded-xl border border-[rgba(215,211,205,0.07)] bg-[#2C2828] p-5">
          <p className="text-sm text-[#B9B6AF]">Total Attendees</p>
          <p
            className="mt-2 text-4xl font-bold text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {data.totalAttendees.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Pipeline Funnel */}
      <div className="rounded-xl border border-[rgba(215,211,205,0.07)] bg-[#2C2828] p-5">
        <h2
          className="mb-4 text-lg font-semibold text-white"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Pipeline Funnel
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.pipelineFunnel} layout="vertical" margin={{ left: 80 }}>
            <XAxis type="number" stroke="#B9B6AF" tick={{ fill: "#B9B6AF", fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="stage"
              stroke="#B9B6AF"
              tick={{ fill: "#B9B6AF", fontSize: 12 }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#2C2828",
                border: "1px solid rgba(215,211,205,0.07)",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.pipelineFunnel.map((_, i) => (
                <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue by Month */}
      <div className="rounded-xl border border-[rgba(215,211,205,0.07)] bg-[#2C2828] p-5">
        <h2
          className="mb-4 text-lg font-semibold text-white"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Revenue by Month
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.revenueByMonth}>
            <XAxis dataKey="month" stroke="#B9B6AF" tick={{ fill: "#B9B6AF", fontSize: 12 }} />
            <YAxis stroke="#B9B6AF" tick={{ fill: "#B9B6AF", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#2C2828",
                border: "1px solid rgba(215,211,205,0.07)",
                borderRadius: "8px",
                color: "#fff",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
            />
            <Bar dataKey="revenue" fill="#8FBDA3" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Course Leaderboard */}
        <div className="rounded-xl border border-[rgba(215,211,205,0.07)] bg-[#2C2828] p-5">
          <h2
            className="mb-4 text-lg font-semibold text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Course Leaderboard
          </h2>
          <div className="space-y-2">
            {data.coursesRanked.map((course, i) => (
              <div
                key={course.title}
                className="flex items-center justify-between rounded-lg border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8FBDA3]/20 text-xs font-bold text-[#8FBDA3]"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{course.title}</p>
                    <p className="text-xs text-[#B9B6AF]">{course.events} deliveries</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-[#8FBDA3]">
                  ${course.totalRevenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clinics */}
        <div className="rounded-xl border border-[rgba(215,211,205,0.07)] bg-[#2C2828] p-5">
          <h2
            className="mb-4 text-lg font-semibold text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Top Clinics by Lifetime Revenue
          </h2>
          <div className="space-y-2">
            {data.topClinics.map((clinic, i) => (
              <div
                key={clinic.name}
                className="flex items-center justify-between rounded-lg border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8FBDA3]/20 text-xs font-bold text-[#8FBDA3]">
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium text-white">{clinic.name}</p>
                </div>
                <p className="text-sm font-medium text-[#8FBDA3]">
                  ${clinic.lifetimeRevenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
