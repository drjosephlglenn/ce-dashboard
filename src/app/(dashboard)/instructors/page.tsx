"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
  coursesDelivered: number;
  avgFeedbackScore: number | null;
}

const STATUS_COLORS: Record<string, string> = {
  PROSPECT: "#666666",
  AUDITING: "#D97706",
  APPROVED: "#3B82F6",
  ACTIVE: "#8FBDA3",
  INACTIVE: "#EF4444",
};

export default function InstructorsPage() {
  const router = useRouter();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Instructor | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    credentials: "",
    payRate: "",
    status: "PROSPECT",
  });

  const fetchInstructors = async () => {
    try {
      const res = await fetch("/api/instructors");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setInstructors(data);
    } catch {
      toast.error("Failed to load instructors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          payRate: parseFloat(form.payRate),
        }),
      });
      if (!res.ok) throw new Error("Failed to create");
      toast.success("Instructor added");
      setDialogOpen(false);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        credentials: "",
        payRate: "",
        status: "PROSPECT",
      });
      fetchInstructors();
    } catch {
      toast.error("Failed to add instructor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInstructor = async (id: string) => {
    try {
      const res = await fetch(`/api/instructors/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Instructor deleted");
      setDeleteTarget(null);
      fetchInstructors();
    } catch {
      toast.error("Failed to delete instructor");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Instructors
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger className="rounded-lg bg-[#8FBDA3] px-4 py-2 text-sm font-medium text-[#231F20] hover:bg-[#8FBDA3]/90 transition">
              Add Instructor
          </DialogTrigger>
          <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.07)] text-white">
            <DialogHeader>
              <DialogTitle
                className="text-white"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Add Instructor
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-[#B9B6AF]">First Name</label>
                  <input
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full rounded-md border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-3 py-2 text-sm text-white outline-none focus:border-[#8FBDA3]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[#B9B6AF]">Last Name</label>
                  <input
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full rounded-md border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-3 py-2 text-sm text-white outline-none focus:border-[#8FBDA3]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#B9B6AF]">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-md border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-3 py-2 text-sm text-white outline-none focus:border-[#8FBDA3]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#B9B6AF]">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-md border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-3 py-2 text-sm text-white outline-none focus:border-[#8FBDA3]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#B9B6AF]">Credentials</label>
                <input
                  value={form.credentials}
                  onChange={(e) => setForm({ ...form, credentials: e.target.value })}
                  className="w-full rounded-md border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-3 py-2 text-sm text-white outline-none focus:border-[#8FBDA3]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-[#B9B6AF]">Pay Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.payRate}
                    onChange={(e) => setForm({ ...form, payRate: e.target.value })}
                    className="w-full rounded-md border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-3 py-2 text-sm text-white outline-none focus:border-[#8FBDA3]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[#B9B6AF]">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full rounded-md border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-3 py-2 text-sm text-white outline-none focus:border-[#8FBDA3]"
                  >
                    <option value="PROSPECT">Prospect</option>
                    <option value="AUDITING">Auditing</option>
                    <option value="APPROVED">Approved</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-[#8FBDA3] px-4 py-2 text-sm font-medium text-[#231F20] hover:bg-[#8FBDA3]/90 transition disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add Instructor"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-[#B9B6AF]">Loading instructors...</div>
      ) : instructors.length === 0 ? (
        <div className="rounded-xl border border-[rgba(215,211,205,0.07)] bg-[#2C2828] p-8 text-center text-[#B9B6AF]">
          No instructors yet. Add your first instructor to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {instructors.map((inst) => (
            <div
              key={inst.id}
              onClick={() => router.push(`/instructors/${inst.id}`)}
              className="cursor-pointer rounded-xl border border-[rgba(215,211,205,0.07)] bg-[#2C2828] p-5 transition hover:border-[#8FBDA3]/30 group relative"
            >
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteTarget(inst); }}
                className="absolute top-3 right-3 p-1.5 rounded-md text-[#B9B6AF] opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <div className="mb-3 flex items-center justify-between">
                <h3
                  className="text-lg font-semibold text-white"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {inst.firstName} {inst.lastName}
                </h3>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white mr-6"
                  style={{ backgroundColor: STATUS_COLORS[inst.status] || "#666" }}
                >
                  {inst.status}
                </span>
              </div>
              <p className="mb-1 text-sm text-[#B9B6AF]">{inst.credentials || "No credentials"}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[rgba(215,211,205,0.07)] pt-3">
                <div>
                  <p className="text-xs text-[#B9B6AF]">Pay Rate</p>
                  <p className="text-sm font-medium text-white">${inst.payRate}</p>
                </div>
                <div>
                  <p className="text-xs text-[#B9B6AF]">Courses</p>
                  <p className="text-sm font-medium text-white">{inst.coursesDelivered}</p>
                </div>
                <div>
                  <p className="text-xs text-[#B9B6AF]">Avg Score</p>
                  <p className="text-sm font-medium text-white">
                    {inst.avgFeedbackScore != null ? inst.avgFeedbackScore.toFixed(1) : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.07)] text-white">
          <DialogHeader>
            <DialogTitle className="text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Delete Instructor
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#B9B6AF]">
            Delete this instructor? They will be unassigned from any events.
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} className="text-[#B9B6AF]">
              Cancel
            </Button>
            <Button onClick={() => deleteTarget && handleDeleteInstructor(deleteTarget.id)} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
