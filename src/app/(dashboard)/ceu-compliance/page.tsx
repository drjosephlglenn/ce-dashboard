"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, AlertTriangle, CheckCircle, Clock, FileText, ExternalLink, Zap, FolderOpen } from "lucide-react";

// All 50 US states
const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
];

interface CourseOption {
  id: string;
  title: string;
  shortCode: string;
  ceuHours: number;
}

interface Approval {
  id: string;
  courseId: string;
  stateRequirementId: string;
  status: string;
  providerNumber: string;
  approvedCeuHours: number;
  applicationDate: string | null;
  approvalDate: string | null;
  expirationDate: string | null;
  cost: string;
  notes: string;
  documentUrl: string;
  course: { id: string; title: string; shortCode: string };
  stateRequirement: { id: string; stateCode: string; stateName: string };
}

interface StateReq {
  id: string;
  stateCode: string;
  stateName: string;
  boardName: string;
  boardUrl: string;
  requiresPreApproval: boolean;
  acceptsOtherStates: boolean;
  acceptedBodies: string[];
  ceuRequiredPerCycle: number;
  renewalCycleYears: number;
  applicationFee: string;
  applicationUrl: string;
  notes: string;
  approvals: Approval[];
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  NOT_STARTED: { color: "text-[#B9B6AF]", bg: "bg-[#363130]", label: "Not Started" },
  IN_PROGRESS: { color: "text-amber-400", bg: "bg-amber-500/20", label: "In Progress" },
  SUBMITTED: { color: "text-blue-400", bg: "bg-blue-500/20", label: "Submitted" },
  APPROVED: { color: "text-[#8FBDA3]", bg: "bg-[#8FBDA3]/20", label: "Approved" },
  DENIED: { color: "text-red-400", bg: "bg-red-500/20", label: "Denied" },
  EXPIRED: { color: "text-orange-400", bg: "bg-orange-500/20", label: "Expired" },
};

const MAP_COLORS: Record<string, string> = {
  APPROVED: "#8FBDA3",
  SUBMITTED: "#3B82F6",
  IN_PROGRESS: "#D97706",
  NOT_STARTED: "#363130",
  DENIED: "#EF4444",
  EXPIRED: "#F97316",
};

export default function CeuCompliancePage() {
  const [states, setStates] = useState<StateReq[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [addStateOpen, setAddStateOpen] = useState(false);
  const [addApprovalOpen, setAddApprovalOpen] = useState(false);
  const [detailState, setDetailState] = useState<StateReq | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [stateForm, setStateForm] = useState({
    stateCode: "",
    stateName: "",
    boardName: "",
    boardUrl: "",
    requiresPreApproval: false,
    acceptsOtherStates: false,
    acceptedBodies: "",
    ceuRequiredPerCycle: 0,
    renewalCycleYears: 2,
    applicationFee: 0,
    applicationUrl: "",
    notes: "",
  });

  const [approvalForm, setApprovalForm] = useState({
    courseId: "",
    stateRequirementId: "",
    status: "NOT_STARTED",
    providerNumber: "",
    approvedCeuHours: 0,
    applicationDate: "",
    approvalDate: "",
    expirationDate: "",
    cost: 0,
    notes: "",
  });

  const [cascadePreview, setCascadePreview] = useState<{
    sourceState?: { stateCode: string; stateName: string; bodyId: string };
    cascadeStates: { stateCode: string; stateName: string; alreadyApproved: boolean }[];
    newApprovals: number;
  } | null>(null);

  async function fetchCascadePreview(stateReqId: string, courseId: string) {
    if (!stateReqId) { setCascadePreview(null); return; }
    try {
      const params = new URLSearchParams({ stateRequirementId: stateReqId });
      if (courseId) params.set("courseId", courseId);
      const res = await fetch(`/api/ceu/cascade-preview?${params}`);
      const data = await res.json();
      setCascadePreview(data);
    } catch {
      setCascadePreview(null);
    }
  }

  async function fetchData() {
    try {
      const [statesRes, coursesRes] = await Promise.all([
        fetch("/api/ceu/states"),
        fetch("/api/courses"),
      ]);
      setStates(await statesRes.json());
      setCourses(await coursesRes.json());
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleAddState(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/ceu/states", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...stateForm,
          acceptedBodies: stateForm.acceptedBodies ? stateForm.acceptedBodies.split(",").map((s) => s.trim()) : [],
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${stateForm.stateName} added`);
      setAddStateOpen(false);
      setStateForm({ stateCode: "", stateName: "", boardName: "", boardUrl: "", requiresPreApproval: false, acceptsOtherStates: false, acceptedBodies: "", ceuRequiredPerCycle: 0, renewalCycleYears: 2, applicationFee: 0, applicationUrl: "", notes: "" });
      fetchData();
    } catch {
      toast.error("Failed to add state");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddApproval(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/ceu/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(approvalForm),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      if (result.cascaded && result.cascaded.length > 0) {
        toast.success(`Approval saved + auto-approved ${result.cascaded.length} additional state${result.cascaded.length === 1 ? "" : "s"}`);
      } else {
        toast.success("Approval record saved");
      }
      setAddApprovalOpen(false);
      setApprovalForm({ courseId: "", stateRequirementId: "", status: "NOT_STARTED", providerNumber: "", approvedCeuHours: 0, applicationDate: "", approvalDate: "", expirationDate: "", cost: 0, notes: "" });
      setCascadePreview(null);
      fetchData();
    } catch {
      toast.error("Failed to save approval");
    } finally {
      setSubmitting(false);
    }
  }

  // Build state map for visual grid
  function getStateStatus(stateCode: string): string {
    const stateReq = states.find((s) => s.stateCode === stateCode);
    if (!stateReq || stateReq.approvals.length === 0) return "NOT_STARTED";

    const approvals = selectedCourse === "all"
      ? stateReq.approvals
      : stateReq.approvals.filter((a) => a.courseId === selectedCourse);

    if (approvals.length === 0) return "NOT_STARTED";

    // Return the "best" status
    if (approvals.some((a) => a.status === "APPROVED")) return "APPROVED";
    if (approvals.some((a) => a.status === "SUBMITTED")) return "SUBMITTED";
    if (approvals.some((a) => a.status === "IN_PROGRESS")) return "IN_PROGRESS";
    if (approvals.some((a) => a.status === "EXPIRED")) return "EXPIRED";
    if (approvals.some((a) => a.status === "DENIED")) return "DENIED";
    return "NOT_STARTED";
  }

  // Stats
  const approvedCount = US_STATES.filter((s) => getStateStatus(s.code) === "APPROVED").length;
  const pendingCount = US_STATES.filter((s) => ["IN_PROGRESS", "SUBMITTED"].includes(getStateStatus(s.code))).length;
  const allApprovals = states.flatMap((s) => s.approvals);
  const expiringSoon = allApprovals.filter((a) => {
    if (!a.expirationDate || a.status !== "APPROVED") return false;
    const exp = new Date(a.expirationDate);
    const now = new Date();
    const days = (exp.getTime() - now.getTime()) / 86400000;
    return days > 0 && days <= 90;
  });

  if (loading) {
    return <div className="text-[#B9B6AF]">Loading CEU compliance data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-[#D7D3CD]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            CEU Compliance
          </h1>
          <p className="text-sm text-[#B9B6AF] mt-1">Track state approvals for your courses</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/ceu-compliance/application-kit"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium border border-[rgba(215,211,205,0.15)] text-[#D7D3CD] hover:bg-[#363130] transition-colors"
          >
            <FolderOpen className="h-4 w-4 mr-2" /> Application Kit
          </Link>
          <Dialog open={addApprovalOpen} onOpenChange={setAddApprovalOpen}>
            <DialogTrigger className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium border border-[#8FBDA3]/30 text-[#8FBDA3] hover:bg-[#8FBDA3]/10 transition-colors">
              <FileText className="h-4 w-4 mr-2" /> Log Approval
            </DialogTrigger>
            <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] max-w-lg">
              <DialogHeader>
                <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>Log Course Approval</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddApproval} className="space-y-4">
                <div>
                  <Label className="text-[#B9B6AF]">Course *</Label>
                  <select
                    required
                    value={approvalForm.courseId}
                    onChange={(e) => setApprovalForm({ ...approvalForm, courseId: e.target.value })}
                    className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm"
                  >
                    <option value="">Select course...</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title} ({c.ceuHours} CEU hrs)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-[#B9B6AF]">State *</Label>
                  <select
                    required
                    value={approvalForm.stateRequirementId}
                    onChange={(e) => {
                      setApprovalForm({ ...approvalForm, stateRequirementId: e.target.value });
                      fetchCascadePreview(e.target.value, approvalForm.courseId);
                    }}
                    className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm"
                  >
                    <option value="">Select state...</option>
                    {states.map((s) => (
                      <option key={s.id} value={s.id}>{s.stateName} ({s.stateCode})</option>
                    ))}
                  </select>
                </div>

                {/* Cascade Preview */}
                {cascadePreview && cascadePreview.newApprovals > 0 && approvalForm.status === "APPROVED" && (
                  <div className="rounded-lg border border-[#8FBDA3]/30 bg-[#8FBDA3]/5 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-[#8FBDA3]" />
                      <p className="text-sm font-medium text-[#8FBDA3]">
                        Cascade: +{cascadePreview.newApprovals} state{cascadePreview.newApprovals === 1 ? "" : "s"} auto-approved
                      </p>
                    </div>
                    <p className="text-xs text-[#B9B6AF] mb-2">
                      These states accept {cascadePreview.sourceState?.bodyId} and will be auto-approved:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {cascadePreview.cascadeStates
                        .filter((s) => !s.alreadyApproved)
                        .map((s) => (
                          <span key={s.stateCode} className="rounded bg-[#8FBDA3]/20 px-2 py-0.5 text-xs text-[#8FBDA3]">
                            {s.stateCode}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#B9B6AF]">Status</Label>
                    <select
                      value={approvalForm.status}
                      onChange={(e) => {
                        setApprovalForm({ ...approvalForm, status: e.target.value });
                        if (e.target.value === "APPROVED" && approvalForm.stateRequirementId) {
                          fetchCascadePreview(approvalForm.stateRequirementId, approvalForm.courseId);
                        }
                      }}
                      className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm"
                    >
                      {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                        <option key={val} value={val}>{cfg.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-[#B9B6AF]">Approved CEU Hours</Label>
                    <Input
                      type="number"
                      value={approvalForm.approvedCeuHours}
                      onChange={(e) => setApprovalForm({ ...approvalForm, approvedCeuHours: parseInt(e.target.value) || 0 })}
                      className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[#B9B6AF]">Provider / Approval Number</Label>
                  <Input
                    value={approvalForm.providerNumber}
                    onChange={(e) => setApprovalForm({ ...approvalForm, providerNumber: e.target.value })}
                    className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-[#B9B6AF]">Applied</Label>
                    <Input
                      type="date"
                      value={approvalForm.applicationDate}
                      onChange={(e) => setApprovalForm({ ...approvalForm, applicationDate: e.target.value })}
                      className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                    />
                  </div>
                  <div>
                    <Label className="text-[#B9B6AF]">Approved</Label>
                    <Input
                      type="date"
                      value={approvalForm.approvalDate}
                      onChange={(e) => setApprovalForm({ ...approvalForm, approvalDate: e.target.value })}
                      className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                    />
                  </div>
                  <div>
                    <Label className="text-[#B9B6AF]">Expires</Label>
                    <Input
                      type="date"
                      value={approvalForm.expirationDate}
                      onChange={(e) => setApprovalForm({ ...approvalForm, expirationDate: e.target.value })}
                      className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[#B9B6AF]">Cost ($)</Label>
                  <Input
                    type="number"
                    value={approvalForm.cost}
                    onChange={(e) => setApprovalForm({ ...approvalForm, cost: parseFloat(e.target.value) || 0 })}
                    className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                  />
                </div>
                <div>
                  <Label className="text-[#B9B6AF]">Notes</Label>
                  <Textarea
                    value={approvalForm.notes}
                    onChange={(e) => setApprovalForm({ ...approvalForm, notes: e.target.value })}
                    rows={2}
                    className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90">
                  {submitting ? "Saving..." : "Save Approval"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={addStateOpen} onOpenChange={setAddStateOpen}>
            <DialogTrigger className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90 transition-colors">
              <Plus className="h-4 w-4 mr-2" /> Add State
            </DialogTrigger>
            <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>Add State Requirements</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddState} className="space-y-4">
                <div>
                  <Label className="text-[#B9B6AF]">State *</Label>
                  <select
                    required
                    value={stateForm.stateCode}
                    onChange={(e) => {
                      const st = US_STATES.find((s) => s.code === e.target.value);
                      setStateForm({ ...stateForm, stateCode: e.target.value, stateName: st?.name || "" });
                    }}
                    className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm"
                  >
                    <option value="">Select state...</option>
                    {US_STATES.filter((s) => !states.find((st) => st.stateCode === s.code)).map((s) => (
                      <option key={s.code} value={s.code}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-[#B9B6AF]">Board Name</Label>
                  <Input
                    value={stateForm.boardName}
                    onChange={(e) => setStateForm({ ...stateForm, boardName: e.target.value })}
                    placeholder="e.g. Tennessee Board of Physical Therapy"
                    className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                  />
                </div>
                <div>
                  <Label className="text-[#B9B6AF]">Board Website URL</Label>
                  <Input
                    value={stateForm.boardUrl}
                    onChange={(e) => setStateForm({ ...stateForm, boardUrl: e.target.value })}
                    placeholder="https://..."
                    className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#B9B6AF]">CEUs Required / Cycle</Label>
                    <Input
                      type="number"
                      value={stateForm.ceuRequiredPerCycle}
                      onChange={(e) => setStateForm({ ...stateForm, ceuRequiredPerCycle: parseInt(e.target.value) || 0 })}
                      className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                    />
                  </div>
                  <div>
                    <Label className="text-[#B9B6AF]">Renewal Cycle (years)</Label>
                    <Input
                      type="number"
                      value={stateForm.renewalCycleYears}
                      onChange={(e) => setStateForm({ ...stateForm, renewalCycleYears: parseInt(e.target.value) || 2 })}
                      className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-[#D7D3CD]">
                    <input
                      type="checkbox"
                      checked={stateForm.requiresPreApproval}
                      onChange={(e) => setStateForm({ ...stateForm, requiresPreApproval: e.target.checked })}
                      className="rounded border-[rgba(215,211,205,0.1)]"
                    />
                    Requires pre-approval before teaching
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#D7D3CD]">
                    <input
                      type="checkbox"
                      checked={stateForm.acceptsOtherStates}
                      onChange={(e) => setStateForm({ ...stateForm, acceptsOtherStates: e.target.checked })}
                      className="rounded border-[rgba(215,211,205,0.1)]"
                    />
                    Accepts approvals from other states
                  </label>
                </div>
                <div>
                  <Label className="text-[#B9B6AF]">Accepted Bodies (comma-separated)</Label>
                  <Input
                    value={stateForm.acceptedBodies}
                    onChange={(e) => setStateForm({ ...stateForm, acceptedBodies: e.target.value })}
                    placeholder="e.g. APTA, BOC, TX-PT"
                    className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#B9B6AF]">Application Fee ($)</Label>
                    <Input
                      type="number"
                      value={stateForm.applicationFee}
                      onChange={(e) => setStateForm({ ...stateForm, applicationFee: parseFloat(e.target.value) || 0 })}
                      className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                    />
                  </div>
                  <div>
                    <Label className="text-[#B9B6AF]">Application URL</Label>
                    <Input
                      value={stateForm.applicationUrl}
                      onChange={(e) => setStateForm({ ...stateForm, applicationUrl: e.target.value })}
                      className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[#B9B6AF]">Notes</Label>
                  <Textarea
                    value={stateForm.notes}
                    onChange={(e) => setStateForm({ ...stateForm, notes: e.target.value })}
                    rows={2}
                    placeholder="Any specific requirements, quirks, tips..."
                    className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90">
                  {submitting ? "Saving..." : "Add State"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-[#8FBDA3]" />
              <div>
                <p className="text-2xl font-bold text-[#8FBDA3]" style={{ fontFamily: "var(--font-space-grotesk)" }}>{approvedCount}</p>
                <p className="text-xs text-[#B9B6AF]">States Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-2xl font-bold text-amber-400" style={{ fontFamily: "var(--font-space-grotesk)" }}>{pendingCount}</p>
                <p className="text-xs text-[#B9B6AF]">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-blue-400" style={{ fontFamily: "var(--font-space-grotesk)" }}>{states.length}</p>
                <p className="text-xs text-[#B9B6AF]">States Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-orange-400" style={{ fontFamily: "var(--font-space-grotesk)" }}>{expiringSoon.length}</p>
                <p className="text-xs text-[#B9B6AF]">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#B9B6AF]">Filter by course:</span>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm"
        >
          <option value="all">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.shortCode} — {c.title}</option>
          ))}
        </select>
      </div>

      {/* State Grid Map */}
      <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
        <CardContent className="p-5">
          <h2
            className="mb-4 text-lg font-semibold text-[#D7D3CD]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            State Approval Map
          </h2>
          <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
            {US_STATES.map((state) => {
              const status = getStateStatus(state.code);
              const stateReq = states.find((s) => s.stateCode === state.code);
              const cfg = STATUS_CONFIG[status];
              return (
                <button
                  key={state.code}
                  onClick={() => stateReq && setDetailState(stateReq)}
                  className="relative flex flex-col items-center justify-center rounded-lg p-1.5 sm:p-2 transition-all hover:scale-110 hover:z-10"
                  style={{ backgroundColor: MAP_COLORS[status] || "#363130" }}
                  title={`${state.name}: ${cfg.label}`}
                >
                  <span className="text-[10px] sm:text-xs font-bold text-white">{state.code}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: MAP_COLORS[key] }} />
                <span className="text-xs text-[#B9B6AF]">{cfg.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expiring Soon Alert */}
      {expiringSoon.length > 0 && (
        <Card className="border-orange-500/30 bg-[#2C2828]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider">Expiring Within 90 Days</h3>
            </div>
            <div className="space-y-2">
              {expiringSoon.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg bg-[#231F20] px-4 py-2">
                  <div>
                    <p className="text-sm text-[#D7D3CD]">{a.course.shortCode} — {a.stateRequirement.stateName}</p>
                    <p className="text-xs text-[#B9B6AF]">Provider #{a.providerNumber}</p>
                  </div>
                  <p className="text-sm text-orange-400">Expires {new Date(a.expirationDate!).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* State Detail Table */}
      {states.length === 0 ? (
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
          <CardContent className="p-8 text-center text-[#B9B6AF]">
            No states tracked yet. Click &quot;Add State&quot; to start tracking CEU requirements and approvals.
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
          <CardContent className="p-5">
            <h2
              className="mb-4 text-lg font-semibold text-[#D7D3CD]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              State Details
            </h2>
            <div className="space-y-2">
              {states.map((state) => (
                <button
                  key={state.id}
                  onClick={() => setDetailState(state)}
                  className="w-full text-left rounded-lg border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-4 py-3 hover:border-[#8FBDA3]/30 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{ backgroundColor: MAP_COLORS[getStateStatus(state.stateCode)] }}
                      >
                        {state.stateCode}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-[#D7D3CD]">{state.stateName}</p>
                        <p className="text-xs text-[#B9B6AF]">
                          {state.boardName || "Board info not set"} &middot; {state.ceuRequiredPerCycle} CEUs / {state.renewalCycleYears}yr
                          {state.requiresPreApproval && " · Pre-approval required"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {state.approvals.length > 0 ? (
                        state.approvals.map((a) => {
                          const cfg = STATUS_CONFIG[a.status];
                          return (
                            <Badge key={a.id} className={`border-0 text-[10px] ${cfg.bg} ${cfg.color}`}>
                              {a.course.shortCode}: {cfg.label}
                            </Badge>
                          );
                        })
                      ) : (
                        <span className="text-xs text-[#B9B6AF]">No approvals yet</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* State Detail Dialog */}
      <Dialog open={!!detailState} onOpenChange={(open) => !open && setDetailState(null)}>
        <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] max-w-lg max-h-[85vh] overflow-y-auto">
          {detailState && (
            <>
              <DialogHeader>
                <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {detailState.stateName} ({detailState.stateCode})
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="rounded-lg bg-[#231F20] p-4 space-y-2">
                  <p className="text-sm text-[#D7D3CD]"><strong>Board:</strong> {detailState.boardName || "—"}</p>
                  {detailState.boardUrl && (
                    <a href={detailState.boardUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-[#8FBDA3] hover:underline">
                      <ExternalLink className="h-3 w-3" /> Board Website
                    </a>
                  )}
                  <p className="text-sm text-[#D7D3CD]"><strong>CEUs Required:</strong> {detailState.ceuRequiredPerCycle} per {detailState.renewalCycleYears}-year cycle</p>
                  <p className="text-sm text-[#D7D3CD]"><strong>Pre-approval:</strong> {detailState.requiresPreApproval ? "Required" : "Not required"}</p>
                  <p className="text-sm text-[#D7D3CD]"><strong>Accepts other states:</strong> {detailState.acceptsOtherStates ? "Yes" : "No"}</p>
                  {detailState.acceptedBodies.length > 0 && (
                    <p className="text-sm text-[#D7D3CD]"><strong>Accepted bodies:</strong> {detailState.acceptedBodies.join(", ")}</p>
                  )}
                  {detailState.applicationFee && Number(detailState.applicationFee) > 0 && (
                    <p className="text-sm text-[#D7D3CD]"><strong>Application fee:</strong> ${Number(detailState.applicationFee)}</p>
                  )}
                  {detailState.applicationUrl && (
                    <a href={detailState.applicationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-[#8FBDA3] hover:underline">
                      <ExternalLink className="h-3 w-3" /> Apply Here
                    </a>
                  )}
                  {detailState.notes && <p className="text-xs text-[#B9B6AF] mt-2">{detailState.notes}</p>}
                </div>

                <h3 className="text-sm font-semibold text-[#D7D3CD]">Course Approvals</h3>
                {detailState.approvals.length === 0 ? (
                  <p className="text-sm text-[#B9B6AF]">No approvals logged for this state yet.</p>
                ) : (
                  <div className="space-y-2">
                    {detailState.approvals.map((a) => {
                      const cfg = STATUS_CONFIG[a.status];
                      return (
                        <div key={a.id} className="rounded-lg bg-[#231F20] p-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-[#D7D3CD]">{a.course.title}</p>
                            <Badge className={`border-0 text-[10px] ${cfg.bg} ${cfg.color}`}>{cfg.label}</Badge>
                          </div>
                          {a.providerNumber && <p className="text-xs text-[#B9B6AF]">Provider #{a.providerNumber}</p>}
                          {a.approvedCeuHours > 0 && <p className="text-xs text-[#B9B6AF]">{a.approvedCeuHours} CEU hours approved</p>}
                          <div className="flex gap-4 mt-1">
                            {a.approvalDate && <p className="text-xs text-[#B9B6AF]">Approved: {new Date(a.approvalDate).toLocaleDateString()}</p>}
                            {a.expirationDate && <p className="text-xs text-[#B9B6AF]">Expires: {new Date(a.expirationDate).toLocaleDateString()}</p>}
                          </div>
                          {a.notes && <p className="text-xs text-[#B9B6AF] mt-1">{a.notes}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
