"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  credentials: string;
  payRate: number;
  status: string;
  w9OnFile: boolean;
  insuranceVerified: boolean;
  nonCompeteExpiry: string | null;
  coursesDelivered: number;
  avgFeedbackScore: number | null;
  assignedCourses: {
    id: string;
    date: string;
    courseTitle: string;
    clinicName: string;
    status: string;
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  PROSPECT: "#666666",
  AUDITING: "#D97706",
  APPROVED: "#3B82F6",
  ACTIVE: "#8FBDA3",
  INACTIVE: "#EF4444",
};

const EVENT_STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "#3B82F6",
  CONFIRMED: "#8FBDA3",
  COMPLETED: "#666666",
  CANCELLED: "#EF4444",
};

export default function InstructorDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingPayRate, setEditingPayRate] = useState(false);
  const [payRateValue, setPayRateValue] = useState("");

  const fetchInstructor = async () => {
    try {
      const res = await fetch(`/api/instructors/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setInstructor(data);
      setPayRateValue(String(data.payRate));
    } catch {
      toast.error("Failed to load instructor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructor();
  }, [id]);

  const updateField = async (field: string, value: unknown) => {
    try {
      const res = await fetch(`/api/instructors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Updated successfully");
      fetchInstructor();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handlePayRateSave = () => {
    const rate = parseFloat(payRateValue);
    if (isNaN(rate)) {
      toast.error("Invalid pay rate");
      return;
    }
    updateField("payRate", rate);
    setEditingPayRate(false);
  };

  if (loading) {
    return <div className="text-[#B9B6AF]">Loading instructor...</div>;
  }

  if (!instructor) {
    return (
      <div className="space-y-4">
        <Link href="/instructors" className="text-sm text-[#8FBDA3] hover:underline">
          &larr; Back to Instructors
        </Link>
        <div className="rounded-xl border border-[rgba(215,211,205,0.07)] bg-[#2C2828] p-8 text-center text-[#B9B6AF]">
          Instructor not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/instructors" className="text-sm text-[#8FBDA3] hover:underline">
        &larr; Back to Instructors
      </Link>

      <div className="flex items-center gap-3">
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {instructor.firstName} {instructor.lastName}
        </h1>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: STATUS_COLORS[instructor.status] || "#666" }}
        >
          {instructor.status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Overview Card */}
        <div className="rounded-xl border border-[rgba(215,211,205,0.07)] bg-[#2C2828] p-5">
          <h2
            className="mb-4 text-lg font-semibold text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Overview
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[#B9B6AF]">Email</p>
              <p className="text-sm text-white">{instructor.email}</p>
            </div>
            <div>
              <p className="text-xs text-[#B9B6AF]">Phone</p>
              <p className="text-sm text-white">{instructor.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-[#B9B6AF]">Credentials</p>
              <p className="text-sm text-white">{instructor.credentials || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-[#B9B6AF]">Pay Rate</p>
              {editingPayRate ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={payRateValue}
                    onChange={(e) => setPayRateValue(e.target.value)}
                    className="w-28 rounded-md border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-2 py-1 text-sm text-white outline-none focus:border-[#8FBDA3]"
                  />
                  <button
                    onClick={handlePayRateSave}
                    className="rounded bg-[#8FBDA3] px-2 py-1 text-xs font-medium text-[#231F20]"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingPayRate(false);
                      setPayRateValue(String(instructor.payRate));
                    }}
                    className="text-xs text-[#B9B6AF] hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p
                  className="cursor-pointer text-sm text-white hover:text-[#8FBDA3]"
                  onClick={() => setEditingPayRate(true)}
                >
                  ${instructor.payRate}{" "}
                  <span className="text-xs text-[#B9B6AF]">(click to edit)</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Compliance Card */}
        <div className="rounded-xl border border-[rgba(215,211,205,0.07)] bg-[#2C2828] p-5">
          <h2
            className="mb-4 text-lg font-semibold text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Compliance
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={instructor.w9OnFile}
                onChange={(e) => updateField("w9OnFile", e.target.checked)}
                className="h-4 w-4 rounded border-[rgba(215,211,205,0.07)] accent-[#8FBDA3]"
              />
              <span className="text-sm text-white">W-9 on File</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={instructor.insuranceVerified}
                onChange={(e) => updateField("insuranceVerified", e.target.checked)}
                className="h-4 w-4 rounded border-[rgba(215,211,205,0.07)] accent-[#8FBDA3]"
              />
              <span className="text-sm text-white">Insurance Verified</span>
            </label>
            <div>
              <p className="mb-1 text-xs text-[#B9B6AF]">Non-Compete Expiry</p>
              <input
                type="date"
                value={instructor.nonCompeteExpiry?.split("T")[0] || ""}
                onChange={(e) => updateField("nonCompeteExpiry", e.target.value || null)}
                className="rounded-md border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-3 py-1.5 text-sm text-white outline-none focus:border-[#8FBDA3]"
              />
            </div>
          </div>
        </div>

        {/* Performance Card */}
        <div className="rounded-xl border border-[rgba(215,211,205,0.07)] bg-[#2C2828] p-5">
          <h2
            className="mb-4 text-lg font-semibold text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Performance
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#B9B6AF]">Total Courses Delivered</p>
              <p className="text-2xl font-bold text-white">{instructor.coursesDelivered}</p>
            </div>
            <div>
              <p className="text-xs text-[#B9B6AF]">Avg Feedback Score</p>
              <p className="text-2xl font-bold text-white">
                {instructor.avgFeedbackScore != null
                  ? instructor.avgFeedbackScore.toFixed(1)
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Courses */}
      <div className="rounded-xl border border-[rgba(215,211,205,0.07)] bg-[#2C2828] p-5">
        <h2
          className="mb-4 text-lg font-semibold text-white"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Assigned Courses
        </h2>
        {instructor.assignedCourses?.length === 0 ? (
          <p className="text-sm text-[#B9B6AF]">No courses assigned yet.</p>
        ) : (
          <div className="space-y-2">
            {instructor.assignedCourses?.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between rounded-lg border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">{course.courseTitle}</p>
                  <p className="text-xs text-[#B9B6AF]">
                    {course.clinicName} &middot;{" "}
                    {new Date(course.date).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                  style={{
                    backgroundColor: EVENT_STATUS_COLORS[course.status] || "#666",
                  }}
                >
                  {course.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
