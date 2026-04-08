"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarPlus,
  BookOpen,
  Clock,
  Target,
  FileText,
  ExternalLink,
  Coffee,
  Beaker,
  GraduationCap,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface ScheduleItem {
  module: number | null;
  title: string;
  startTime: string;
  endTime: string;
  duration: number;
  format: string;
  topics: string[];
}

interface BibEntry {
  id: number;
  authors: string;
  year: number;
  title: string;
  journal: string;
  doi: string;
  category: string;
}

interface CourseDetail {
  id: string;
  title: string;
  shortCode: string;
  description: string;
  ceuHours: number;
  targetAudience: string;
  format: string;
  maxAttendees: number;
  defaultPrice: string;
  isActive: boolean;
  version: string;
  prerequisites: string;
  instructionalLevel: string;
  learningObjectives: string[];
  schedule: ScheduleItem[] | null;
  bibliography: BibEntry[] | null;
  courseEvents: Array<{
    id: string;
    eventDate: string;
    status: string;
    type: string;
    totalRevenue: string;
    clinic: { id: string; name: string; city: string; state: string };
    financialRecords?: Array<{ id: string; amount: string; type: string }>;
  }>;
}

type Tab = "overview" | "schedule" | "objectives" | "bibliography" | "events";

const COURSE_FORMATS = ["LIVE_PRIVATE", "LIVE_PUBLIC", "ONLINE_SELF_PACED", "HYBRID"] as const;

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: "",
    shortCode: "",
    description: "",
    ceuHours: 0,
    targetAudience: "",
    format: "",
    maxAttendees: 0,
    defaultPrice: "",
    prerequisites: "",
    instructionalLevel: "",
    version: "",
    isActive: true,
  });

  const fetchCourse = () => {
    fetch(`/api/courses/${id}`)
      .then((r) => r.json())
      .then(setCourse);
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  // Sync edit form when course loads or edit dialog opens
  useEffect(() => {
    if (course && editOpen) {
      setEditForm({
        title: course.title,
        shortCode: course.shortCode,
        description: course.description || "",
        ceuHours: course.ceuHours,
        targetAudience: course.targetAudience,
        format: course.format,
        maxAttendees: course.maxAttendees,
        defaultPrice: String(course.defaultPrice),
        prerequisites: course.prerequisites || "",
        instructionalLevel: course.instructionalLevel || "",
        version: course.version || "",
        isActive: course.isActive,
      });
    }
  }, [course, editOpen]);

  async function handleEditSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          ceuHours: Number(editForm.ceuHours),
          maxAttendees: Number(editForm.maxAttendees),
          defaultPrice: Number(editForm.defaultPrice),
        }),
      });
      if (res.ok) {
        toast.success("Course updated");
        setEditOpen(false);
        fetchCourse();
      } else {
        toast.error("Failed to update course");
      }
    } catch {
      toast.error("Failed to update course");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Course deleted");
        router.push("/courses");
      } else {
        toast.error("Failed to delete course");
      }
    } catch {
      toast.error("Failed to delete course");
    } finally {
      setDeleting(false);
    }
  }

  if (!course) return <div className="text-[#B9B6AF]">Loading...</div>;

  const formatLabel = (f: string) =>
    f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const tabs: { key: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { key: "overview", label: "Overview", icon: BookOpen },
    { key: "schedule", label: "Schedule", icon: Clock, count: course.schedule?.filter((s) => s.module !== null).length },
    { key: "objectives", label: "Objectives", icon: Target, count: (course.learningObjectives ?? []).length },
    { key: "bibliography", label: "Bibliography", icon: FileText, count: course.bibliography?.length },
    { key: "events", label: "Events", icon: CalendarPlus, count: course.courseEvents?.length ?? 0 },
  ];

  const objectives = course.learningObjectives ?? [];
  const hasContent = true; // Always show tabs so Events tab is accessible

  return (
    <div className="space-y-6">
      <Link
        href="/courses"
        className="flex items-center gap-2 text-sm text-[#B9B6AF] hover:text-[#D7D3CD] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Courses
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1
              className="text-2xl font-bold text-[#D7D3CD]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {course.title}
            </h1>
            <Badge className="bg-[#363130] text-[#D7D3CD] border-0">
              {course.shortCode}
            </Badge>
            {course.isActive && (
              <Badge className="bg-[#8FBDA3]/20 text-[#8FBDA3] border-0">Active</Badge>
            )}
          </div>
          <p className="text-sm text-[#B9B6AF] max-w-3xl">{course.description || "No description"}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Edit Course Button */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger>
              <Button
                variant="outline"
                size="sm"
                className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] hover:bg-[#8FBDA3]/20 hover:text-[#8FBDA3]"
              >
                <Pencil className="h-4 w-4 mr-2" /> Edit Course
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Edit Course
                </DialogTitle>
                <DialogDescription className="text-[#B9B6AF]">
                  Update course details below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {/* Row 1: Title + Short Code */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#B9B6AF]">Title</Label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#B9B6AF]">Short Code</Label>
                    <Input
                      value={editForm.shortCode}
                      onChange={(e) => setEditForm({ ...editForm, shortCode: e.target.value })}
                      className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                    />
                  </div>
                </div>

                {/* Description (full width) */}
                <div className="space-y-2">
                  <Label className="text-[#B9B6AF]">Description</Label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                  />
                </div>

                {/* Row 2: CEU Hours + Target Audience */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#B9B6AF]">CEU Hours</Label>
                    <Input
                      type="number"
                      value={editForm.ceuHours}
                      onChange={(e) => setEditForm({ ...editForm, ceuHours: Number(e.target.value) })}
                      className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#B9B6AF]">Target Audience</Label>
                    <Input
                      value={editForm.targetAudience}
                      onChange={(e) => setEditForm({ ...editForm, targetAudience: e.target.value })}
                      className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                    />
                  </div>
                </div>

                {/* Row 3: Format + Max Attendees */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#B9B6AF]">Format</Label>
                    <select
                      value={editForm.format}
                      onChange={(e) => setEditForm({ ...editForm, format: e.target.value })}
                      className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm"
                    >
                      {COURSE_FORMATS.map((f) => (
                        <option key={f} value={f}>
                          {f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#B9B6AF]">Max Attendees</Label>
                    <Input
                      type="number"
                      value={editForm.maxAttendees}
                      onChange={(e) => setEditForm({ ...editForm, maxAttendees: Number(e.target.value) })}
                      className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                    />
                  </div>
                </div>

                {/* Row 4: Default Price + Instructional Level */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#B9B6AF]">Default Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editForm.defaultPrice}
                      onChange={(e) => setEditForm({ ...editForm, defaultPrice: e.target.value })}
                      className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#B9B6AF]">Instructional Level</Label>
                    <Input
                      value={editForm.instructionalLevel}
                      onChange={(e) => setEditForm({ ...editForm, instructionalLevel: e.target.value })}
                      className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                    />
                  </div>
                </div>

                {/* Row 5: Version + isActive */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#B9B6AF]">Version</Label>
                    <Input
                      value={editForm.version}
                      onChange={(e) => setEditForm({ ...editForm, version: e.target.value })}
                      className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.isActive}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                        className="h-4 w-4 rounded border-[rgba(215,211,205,0.2)] bg-[#363130] accent-[#8FBDA3]"
                      />
                      <span className="text-sm text-[#B9B6AF]">Active</span>
                    </label>
                  </div>
                </div>

                {/* Prerequisites (full width) */}
                <div className="space-y-2">
                  <Label className="text-[#B9B6AF]">Prerequisites</Label>
                  <Textarea
                    value={editForm.prerequisites}
                    onChange={(e) => setEditForm({ ...editForm, prerequisites: e.target.value })}
                    rows={2}
                    className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] hover:bg-[#363130]/80"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditSave}
                  disabled={saving}
                  className="bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Course Button */}
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger>
              <Button
                variant="outline"
                size="sm"
                className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-red-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] max-w-md">
              <DialogHeader>
                <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Delete Course
                </DialogTitle>
                <DialogDescription className="text-[#B9B6AF]">
                  Are you sure you want to delete <span className="font-semibold text-[#D7D3CD]">{course.title}</span>? This will remove the course and all associated data.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                  className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] hover:bg-[#363130]/80"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {deleting ? "Deleting..." : "Delete Course"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Course Info KPIs */}
      <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <p className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF] mb-1">CEU Hours</p>
              <p className="text-lg font-semibold text-[#D7D3CD]">{course.ceuHours}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF] mb-1">Format</p>
              <p className="text-lg font-semibold text-[#D7D3CD]">{formatLabel(course.format)}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF] mb-1">Level</p>
              <p className="text-lg font-semibold text-[#D7D3CD]">{course.instructionalLevel || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF] mb-1">Default Price</p>
              <p className="text-lg font-semibold text-[#D7D3CD]">{formatCurrency(course.defaultPrice)}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF] mb-1">Max Attendees</p>
              <p className="text-lg font-semibold text-[#D7D3CD]">{course.maxAttendees}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      {hasContent && (
        <div className="flex gap-1 border-b border-[rgba(215,211,205,0.07)] pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                activeTab === tab.key
                  ? "border-[#8FBDA3] text-[#8FBDA3]"
                  : "border-transparent text-[#B9B6AF] hover:text-[#D7D3CD]"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="text-[10px] bg-[#363130] text-[#B9B6AF] px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab course={course} />}
      {activeTab === "schedule" && <ScheduleTab schedule={course.schedule} />}
      {activeTab === "objectives" && <ObjectivesTab objectives={objectives} />}
      {activeTab === "bibliography" && <BibliographyTab bibliography={course.bibliography} />}
      {activeTab === "events" && (
        <EventsTab
          events={course.courseEvents}
          courseId={course.id}
          onCreated={() =>
            fetch(`/api/courses/${id}`)
              .then((r) => r.json())
              .then(setCourse)
          }
        />
      )}
    </div>
  );
}

function OverviewTab({ course }: { course: CourseDetail }) {
  const objectives = course.learningObjectives ?? [];
  const lectureHours = course.schedule
    ?.filter((s) => s.format !== "Break" && !s.format.includes("Practical"))
    .reduce((sum, s) => sum + s.duration, 0);
  const labHours = course.schedule
    ?.filter((s) => s.format.includes("Practical"))
    .reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      {course.schedule && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-[#8FBDA3]/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-[#8FBDA3]" />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF]">Lecture</p>
                <p className="text-lg font-semibold text-[#D7D3CD]">
                  {lectureHours ? `${(lectureHours / 60).toFixed(1)} hrs` : "—"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Beaker className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF]">Hands-On Labs</p>
                <p className="text-lg font-semibold text-[#D7D3CD]">
                  {labHours ? `${(labHours / 60).toFixed(1)} hrs` : "—"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF]">References</p>
                <p className="text-lg font-semibold text-[#D7D3CD]">
                  {course.bibliography?.length || 0} sources
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Target Audience & Prerequisites */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
          <CardContent className="p-5">
            <h3
              className="text-sm font-semibold text-[#D7D3CD] mb-3"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Target Audience
            </h3>
            <div className="flex flex-wrap gap-2">
              {course.targetAudience.split(",").map((a) => (
                <Badge key={a.trim()} className="bg-[#363130] text-[#B9B6AF] border-0">
                  {a.trim()}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        {course.prerequisites && (
          <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
            <CardContent className="p-5">
              <h3
                className="text-sm font-semibold text-[#D7D3CD] mb-3"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Prerequisites
              </h3>
              <p className="text-sm text-[#B9B6AF] leading-relaxed">{course.prerequisites}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Objectives Preview */}
      {objectives.length > 0 && (
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
          <CardContent className="p-5">
            <h3
              className="text-sm font-semibold text-[#D7D3CD] mb-3"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Learning Objectives ({objectives.length})
            </h3>
            <ul className="space-y-2">
              {objectives.slice(0, 4).map((obj, i) => (
                <li key={i} className="flex gap-3 text-sm text-[#B9B6AF]">
                  <span className="text-[#8FBDA3] font-mono text-xs mt-0.5 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="leading-relaxed">{obj}</span>
                </li>
              ))}
              {objectives.length > 4 && (
                <li className="text-sm text-[#8FBDA3] pl-8">
                  +{objectives.length - 4} more...
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ScheduleTab({ schedule }: { schedule: ScheduleItem[] | null }) {
  if (!schedule || schedule.length === 0) {
    return (
      <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
        <CardContent className="py-12 text-center">
          <Clock className="h-8 w-8 text-[#B9B6AF] mx-auto mb-3" />
          <p className="text-sm text-[#B9B6AF]">No schedule defined for this course yet</p>
        </CardContent>
      </Card>
    );
  }

  const getItemStyle = (item: ScheduleItem) => {
    if (item.format === "Break") return { bg: "bg-[#1B1919]", accent: "text-[#B9B6AF]", icon: Coffee };
    if (item.format.includes("Practical")) return { bg: "bg-amber-500/5", accent: "text-amber-400", icon: Beaker };
    return { bg: "bg-[#2C2828]", accent: "text-[#8FBDA3]", icon: BookOpen };
  };

  return (
    <div className="space-y-2">
      {schedule.map((item, i) => {
        const style = getItemStyle(item);
        const Icon = style.icon;
        const isBreak = item.format === "Break";

        return (
          <Card
            key={i}
            className={`${style.bg} border-[rgba(215,211,205,0.07)] ${isBreak ? "opacity-60" : ""}`}
          >
            <CardContent className={`${isBreak ? "py-3 px-5" : "p-5"}`}>
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-3 shrink-0 w-[140px]">
                  <Icon className={`h-4 w-4 ${style.accent}`} />
                  <span className="text-xs font-mono text-[#B9B6AF]">
                    {item.startTime} – {item.endTime}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className={`text-sm font-semibold ${isBreak ? "text-[#B9B6AF]" : "text-[#D7D3CD]"}`}>
                      {item.module !== null && (
                        <span className={`${style.accent} mr-2`}>Module {item.module}:</span>
                      )}
                      {item.title}
                    </h4>
                    {!isBreak && (
                      <Badge className="bg-[#363130] text-[#B9B6AF] border-0 text-[10px]">
                        {item.duration} min
                      </Badge>
                    )}
                    {!isBreak && (
                      <Badge className="bg-[#363130] text-[#B9B6AF] border-0 text-[10px]">
                        {item.format}
                      </Badge>
                    )}
                  </div>
                  {item.topics.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {item.topics.map((topic, ti) => (
                        <li key={ti} className="flex gap-2 text-sm text-[#B9B6AF]">
                          <span className="text-[#8FBDA3]/50 shrink-0">•</span>
                          <span className="leading-relaxed">{topic}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ObjectivesTab({ objectives }: { objectives: string[] }) {
  if (objectives.length === 0) {
    return (
      <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
        <CardContent className="py-12 text-center">
          <Target className="h-8 w-8 text-[#B9B6AF] mx-auto mb-3" />
          <p className="text-sm text-[#B9B6AF]">No learning objectives defined yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#B9B6AF] mb-4">
        Upon completion of this course, participants will be able to:
      </p>
      {objectives.map((obj, i) => {
        const verb = obj.split(" ")[0];
        return (
          <Card key={i} className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
            <CardContent className="p-4 flex gap-4">
              <div className="h-8 w-8 rounded-lg bg-[#8FBDA3]/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-[#8FBDA3]">{i + 1}</span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8FBDA3] mb-1 block">
                  {verb}
                </span>
                <p className="text-sm text-[#B9B6AF] leading-relaxed">{obj}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function BibliographyTab({ bibliography }: { bibliography: BibEntry[] | null }) {
  if (!bibliography || bibliography.length === 0) {
    return (
      <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
        <CardContent className="py-12 text-center">
          <FileText className="h-8 w-8 text-[#B9B6AF] mx-auto mb-3" />
          <p className="text-sm text-[#B9B6AF]">No bibliography added yet</p>
        </CardContent>
      </Card>
    );
  }

  const categories = [...new Set(bibliography.map((b) => b.category))];

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#B9B6AF]">
        {bibliography.length} references · Grouped by topic
      </p>
      {categories.map((cat) => {
        const refs = bibliography.filter((b) => b.category === cat);
        return (
          <div key={cat}>
            <h3
              className="text-sm font-semibold text-[#8FBDA3] mb-3 uppercase tracking-wider"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {cat} ({refs.length})
            </h3>
            <div className="space-y-2">
              {refs.map((ref) => (
                <Card key={ref.id} className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-mono text-[#B9B6AF] shrink-0 mt-0.5">
                        [{ref.id}]
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-[#D7D3CD] leading-relaxed">
                          {ref.authors} ({ref.year}). {ref.title}.{" "}
                          <span className="italic text-[#B9B6AF]">{ref.journal}</span>.
                        </p>
                        {ref.doi && (
                          <a
                            href={`https://doi.org/${ref.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#8FBDA3] hover:underline mt-1"
                          >
                            doi:{ref.doi}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EventsTab({
  events,
  courseId,
  onCreated,
}: {
  events: CourseDetail["courseEvents"];
  courseId: string;
  onCreated: () => void;
}) {
  const formatLabel = (f: string) =>
    f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const [open, setOpen] = useState(false);
  const [clinics, setClinics] = useState<{ id: string; name: string; city: string; state: string }[]>([]);
  const [creating, setCreating] = useState(false);
  const [eventType, setEventType] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");

  useEffect(() => {
    fetch("/api/clinics").then((r) => r.json()).then(setClinics);
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      courseId,
      clinicId: fd.get("clinicId"),
      eventDate: fd.get("eventDate"),
      startTime: fd.get("startTime") || "08:00",
      endTime: fd.get("endTime") || "16:00",
      type: eventType,
      status: "TENTATIVE",
    };

    if (eventType === "PRIVATE") {
      body.flatRate = parseFloat(fd.get("flatRate") as string) || 10000;
    } else {
      body.standardPrice = parseFloat(fd.get("standardPrice") as string) || 599;
      body.earlyBirdPrice = parseFloat(fd.get("earlyBirdPrice") as string) || 499;
      body.hostKickbackPerHead = parseFloat(fd.get("hostKickbackPerHead") as string) || 50;
      body.minAttendees = parseInt(fd.get("minAttendees") as string) || 8;
      body.maxAttendees = parseInt(fd.get("maxAttendees") as string) || 30;
    }

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setCreating(false);
    if (res.ok) {
      toast.success("Event scheduled");
      setOpen(false);
      onCreated();
    } else {
      toast.error("Failed to schedule event");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-lg font-semibold text-[#D7D3CD]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Scheduled Events ({events.length})
        </h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90 transition-colors">
            <CalendarPlus className="h-4 w-4 mr-2" /> Schedule Event
          </DialogTrigger>
          <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] max-w-lg">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>Schedule Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Type Toggle */}
              <div className="space-y-2">
                <Label className="text-[#B9B6AF]">Event Type</Label>
                <div className="flex gap-2">
                  {(["PUBLIC", "PRIVATE"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEventType(t)}
                      className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                        eventType === t
                          ? "bg-[#8FBDA3] text-[#231F20]"
                          : "bg-[#363130] text-[#B9B6AF] hover:text-[#D7D3CD]"
                      }`}
                    >
                      {t === "PUBLIC" ? "Public" : "Private"}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#B9B6AF]">
                  {eventType === "PUBLIC"
                    ? "Open registration • $599/$499 early bird • $50 kickback to host • 1 free host seat"
                    : "Closed to host clinic staff • $10,000 flat rate • Up to 30 attendees"}
                </p>
              </div>

              {/* Clinic */}
              <div className="space-y-2">
                <Label className="text-[#B9B6AF]">Host Clinic *</Label>
                <select
                  name="clinicId"
                  required
                  className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm"
                >
                  <option value="">Select clinic...</option>
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.city}, {c.state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-[#B9B6AF]">Date *</Label>
                  <Input name="eventDate" type="date" required className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#B9B6AF]">Start</Label>
                  <Input name="startTime" type="time" defaultValue="08:00" className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#B9B6AF]">End</Label>
                  <Input name="endTime" type="time" defaultValue="16:00" className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
                </div>
              </div>

              {/* Pricing Fields */}
              {eventType === "PUBLIC" ? (
                <div className="space-y-3 rounded-lg bg-[#363130]/50 p-3">
                  <p className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF]">Public Pricing</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[#B9B6AF] text-xs">Standard Price</Label>
                      <Input name="standardPrice" type="number" step="0.01" defaultValue="599" className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[#B9B6AF] text-xs">Early Bird Price</Label>
                      <Input name="earlyBirdPrice" type="number" step="0.01" defaultValue="499" className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[#B9B6AF] text-xs">Host Kickback / Head</Label>
                      <Input name="hostKickbackPerHead" type="number" step="0.01" defaultValue="50" className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[#B9B6AF] text-xs">Min Attendees</Label>
                      <Input name="minAttendees" type="number" defaultValue="8" className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] h-8 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[#B9B6AF] text-xs">Max Attendees</Label>
                    <Input name="maxAttendees" type="number" defaultValue="30" className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] h-8 text-sm" />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 rounded-lg bg-[#363130]/50 p-3">
                  <p className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF]">Private Pricing</p>
                  <div className="space-y-1">
                    <Label className="text-[#B9B6AF] text-xs">Flat Rate</Label>
                    <Input name="flatRate" type="number" step="0.01" defaultValue="10000" className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] h-8 text-sm" />
                  </div>
                </div>
              )}

              <Button type="submit" disabled={creating} className="w-full bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90">
                {creating ? "Scheduling..." : "Schedule Event"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {events.length === 0 ? (
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-[#B9B6AF]">No events scheduled yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <Link key={event.id} href={`/courses/events/${event.id}`}>
              <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)] hover:border-[#8FBDA3]/30 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-[#D7D3CD]">
                      {formatDate(event.eventDate)}
                    </div>
                    <div className="text-sm text-[#B9B6AF]">{event.clinic.name}</div>
                    <Badge className="bg-[#363130] text-[#D7D3CD] border-0 text-[10px]">
                      {event.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-[#363130] text-[#D7D3CD] border-0 text-[10px]">
                      {formatLabel(event.status)}
                    </Badge>
                    <span className="text-sm text-[#8FBDA3]">
                      {formatCurrency(
                        event.financialRecords && event.financialRecords.length > 0
                          ? event.financialRecords.reduce((sum, f) => sum + Number(f.amount), 0)
                          : event.totalRevenue
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
