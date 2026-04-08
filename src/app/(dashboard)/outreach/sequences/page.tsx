"use client";

import { useEffect, useState } from "react";
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

interface SequenceStep {
  dayOffset: number;
  templateName: string;
  subject: string;
}

interface Sequence {
  id: string;
  name: string;
  trigger: string;
  steps: SequenceStep[];
  enrolledClinicsCount: number;
}

interface Clinic {
  id: string;
  name: string;
}

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollSequenceId, setEnrollSequenceId] = useState<string | null>(null);
  const [enrollClinicId, setEnrollClinicId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Sequence | null>(null);

  const [form, setForm] = useState({
    name: "",
    trigger: "NEW_LEAD",
    steps: [
      { dayOffset: 0, templateName: "", subject: "" },
      { dayOffset: 7, templateName: "", subject: "" },
      { dayOffset: 14, templateName: "", subject: "" },
    ] as SequenceStep[],
  });

  const fetchSequences = async () => {
    try {
      const res = await fetch("/api/sequences");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSequences(data);
    } catch {
      toast.error("Failed to load sequences");
    } finally {
      setLoading(false);
    }
  };

  const fetchClinics = async () => {
    try {
      const res = await fetch("/api/clinics");
      if (!res.ok) throw new Error("Failed to fetch clinics");
      const data = await res.json();
      setClinics(data);
    } catch {
      // silently fail - clinics will be empty
    }
  };

  useEffect(() => {
    fetchSequences();
    fetchClinics();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create");
      toast.success("Sequence created");
      setCreateOpen(false);
      setForm({
        name: "",
        trigger: "NEW_LEAD",
        steps: [
          { dayOffset: 0, templateName: "", subject: "" },
          { dayOffset: 7, templateName: "", subject: "" },
          { dayOffset: 14, templateName: "", subject: "" },
        ],
      });
      fetchSequences();
    } catch {
      toast.error("Failed to create sequence");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollSequenceId || !enrollClinicId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/sequences/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sequenceId: enrollSequenceId, clinicId: enrollClinicId }),
      });
      if (!res.ok) throw new Error("Failed to enroll");
      toast.success("Clinic enrolled in sequence");
      setEnrollOpen(false);
      setEnrollClinicId("");
      setEnrollSequenceId(null);
      fetchSequences();
    } catch {
      toast.error("Failed to enroll clinic");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSequence = async (id: string) => {
    try {
      const res = await fetch(`/api/sequences/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Sequence deleted");
      setDeleteTarget(null);
      fetchSequences();
    } catch {
      toast.error("Failed to delete sequence");
    }
  };

  const updateStep = (index: number, field: keyof SequenceStep, value: string | number) => {
    const newSteps = [...form.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setForm({ ...form, steps: newSteps });
  };

  const TRIGGER_LABELS: Record<string, string> = {
    NEW_LEAD: "New Lead",
    POST_EVENT: "Post Event",
    REBOOK_REMINDER: "Rebook Reminder",
    WIN_BACK: "Win Back",
    ONBOARDING: "Onboarding",
  };

  const TRIGGER_COLORS: Record<string, string> = {
    NEW_LEAD: "#8FBDA3",
    POST_EVENT: "#3B82F6",
    REBOOK_REMINDER: "#D97706",
    WIN_BACK: "#EF4444",
    ONBOARDING: "#A78BFA",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Email Sequences
        </h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger className="rounded-lg bg-[#8FBDA3] px-4 py-2 text-sm font-medium text-[#231F20] hover:bg-[#8FBDA3]/90 transition">
              Create Sequence
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-[#2C2828] border-[rgba(215,211,205,0.07)] text-white">
            <DialogHeader>
              <DialogTitle
                className="text-white"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Create Sequence
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-[#B9B6AF]">Sequence Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-md border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-3 py-2 text-sm text-white outline-none focus:border-[#8FBDA3]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#B9B6AF]">Trigger</label>
                <select
                  value={form.trigger}
                  onChange={(e) => setForm({ ...form, trigger: e.target.value })}
                  className="w-full rounded-md border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-3 py-2 text-sm text-white outline-none focus:border-[#8FBDA3]"
                >
                  {Object.entries(TRIGGER_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-[#B9B6AF]">Steps</label>
                <div className="space-y-3">
                  {form.steps.map((step, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-[rgba(215,211,205,0.07)] bg-[#231F20] p-3 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#B9B6AF]">Day</span>
                        <input
                          type="number"
                          min={0}
                          value={step.dayOffset}
                          onChange={(e) => updateStep(i, "dayOffset", parseInt(e.target.value) || 0)}
                          className="w-16 rounded border border-[rgba(215,211,205,0.07)] bg-[#2C2828] px-2 py-1 text-xs text-white outline-none"
                        />
                      </div>
                      <input
                        placeholder="Template name"
                        value={step.templateName}
                        onChange={(e) => updateStep(i, "templateName", e.target.value)}
                        className="w-full rounded border border-[rgba(215,211,205,0.07)] bg-[#2C2828] px-2 py-1 text-xs text-white outline-none placeholder:text-[#B9B6AF]/50"
                      />
                      <input
                        placeholder="Subject line"
                        value={step.subject}
                        onChange={(e) => updateStep(i, "subject", e.target.value)}
                        className="w-full rounded border border-[rgba(215,211,205,0.07)] bg-[#2C2828] px-2 py-1 text-xs text-white outline-none placeholder:text-[#B9B6AF]/50"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-[#8FBDA3] px-4 py-2 text-sm font-medium text-[#231F20] hover:bg-[#8FBDA3]/90 transition disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create Sequence"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Enroll Dialog */}
      <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
        <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.07)] text-white">
          <DialogHeader>
            <DialogTitle
              className="text-white"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Enroll Clinic
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEnroll} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-[#B9B6AF]">Select Clinic</label>
              <select
                required
                value={enrollClinicId}
                onChange={(e) => setEnrollClinicId(e.target.value)}
                className="w-full rounded-md border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-3 py-2 text-sm text-white outline-none focus:border-[#8FBDA3]"
              >
                <option value="">Choose a clinic...</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-[#8FBDA3] px-4 py-2 text-sm font-medium text-[#231F20] hover:bg-[#8FBDA3]/90 transition disabled:opacity-50"
            >
              {submitting ? "Enrolling..." : "Enroll Clinic"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="text-[#B9B6AF]">Loading sequences...</div>
      ) : sequences.length === 0 ? (
        <div className="rounded-xl border border-[rgba(215,211,205,0.07)] bg-[#2C2828] p-8 text-center text-[#B9B6AF]">
          No sequences yet. Create your first email sequence to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {sequences.map((seq) => (
            <div
              key={seq.id}
              className="rounded-xl border border-[rgba(215,211,205,0.07)] bg-[#2C2828] p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3
                    className="text-lg font-semibold text-white"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {seq.name}
                  </h3>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium text-[#231F20]"
                    style={{ backgroundColor: TRIGGER_COLORS[seq.trigger] || "#8FBDA3" }}
                  >
                    {TRIGGER_LABELS[seq.trigger] || seq.trigger}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#B9B6AF]">
                    {seq.enrolledClinicsCount} clinics enrolled
                  </span>
                  <button
                    onClick={() => {
                      setEnrollSequenceId(seq.id);
                      setEnrollOpen(true);
                    }}
                    className="rounded-lg border border-[#8FBDA3]/30 px-3 py-1.5 text-xs font-medium text-[#8FBDA3] hover:bg-[#8FBDA3]/10 transition"
                  >
                    Enroll Clinic
                  </button>
                  <button
                    onClick={() => setDeleteTarget(seq)}
                    className="p-1.5 rounded-md text-[#B9B6AF] hover:bg-red-500/10 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Visual Timeline */}
              <div className="flex items-center gap-0 overflow-x-auto py-2">
                {seq.steps.map((step, i) => (
                  <div key={i} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8FBDA3] text-xs font-bold text-[#231F20]">
                        {i + 1}
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-xs font-medium text-white">Day {step.dayOffset}</p>
                        <p className="max-w-[120px] truncate text-xs text-[#B9B6AF]">
                          {step.subject || step.templateName || "Untitled"}
                        </p>
                      </div>
                    </div>
                    {i < seq.steps.length - 1 && (
                      <div className="mx-2 h-0.5 w-12 bg-[#8FBDA3]/30" />
                    )}
                  </div>
                ))}
              </div>

              <p className="mt-2 text-xs text-[#B9B6AF]">
                {seq.steps.length} step{seq.steps.length !== 1 ? "s" : ""}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.07)] text-white">
          <DialogHeader>
            <DialogTitle className="text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Delete Sequence
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#B9B6AF]">
            Delete this sequence? All clinic enrollments will be removed.
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} className="text-[#B9B6AF]">
              Cancel
            </Button>
            <Button onClick={() => deleteTarget && handleDeleteSequence(deleteTarget.id)} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
