"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";

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

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then((r) => r.json())
      .then(setCourse);
  }, [id]);

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
      {activeTab === "events" && <EventsTab events={course.courseEvents} />}
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
}: {
  events: CourseDetail["courseEvents"];
}) {
  const formatLabel = (f: string) =>
    f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-lg font-semibold text-[#D7D3CD]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Scheduled Events ({events.length})
        </h2>
        <Button size="sm" className="bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90">
          <CalendarPlus className="h-4 w-4 mr-2" /> Schedule Event
        </Button>
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
