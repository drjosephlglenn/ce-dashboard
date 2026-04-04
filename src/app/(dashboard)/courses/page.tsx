"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Course {
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
  _count: { courseEvents: number };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function fetchCourses() {
    const res = await fetch("/api/courses");
    const data = await res.json();
    setCourses(data);
  }

  useEffect(() => { fetchCourses(); }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      title: fd.get("title"),
      shortCode: fd.get("shortCode"),
      description: fd.get("description") || "",
      ceuHours: parseInt(fd.get("ceuHours") as string) || 0,
      targetAudience: fd.get("targetAudience") || "PTs, PTAs, ATCs",
      format: fd.get("format") || "LIVE_PRIVATE",
      maxAttendees: parseInt(fd.get("maxAttendees") as string) || 30,
      defaultPrice: parseFloat(fd.get("defaultPrice") as string) || 10000,
    };
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Course created");
      setOpen(false);
      fetchCourses();
    } else {
      toast.error("Failed to create course");
    }
  }

  const formatLabel = (f: string) => f.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#D7D3CD]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Course Catalog
          </h1>
          <p className="text-sm text-[#B9B6AF] mt-1">{courses.length} courses</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90 transition-colors">
            <Plus className="h-4 w-4 mr-2" /> Add Course
          </DialogTrigger>
          <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>New Course</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#B9B6AF]">Title *</Label>
                  <Input name="title" required className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
                </div>
                <div>
                  <Label className="text-[#B9B6AF]">Short Code *</Label>
                  <Input name="shortCode" required placeholder="ACL-BFR" className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
                </div>
              </div>
              <div>
                <Label className="text-[#B9B6AF]">Description</Label>
                <Textarea name="description" rows={2} className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-[#B9B6AF]">CEU Hours</Label>
                  <Input name="ceuHours" type="number" defaultValue="8" className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
                </div>
                <div>
                  <Label className="text-[#B9B6AF]">Max Attendees</Label>
                  <Input name="maxAttendees" type="number" defaultValue="30" className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
                </div>
                <div>
                  <Label className="text-[#B9B6AF]">Default Price</Label>
                  <Input name="defaultPrice" type="number" defaultValue="10000" className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#B9B6AF]">Format</Label>
                  <select name="format" defaultValue="LIVE_PRIVATE" className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm">
                    <option value="LIVE_PRIVATE">Live Private</option>
                    <option value="LIVE_PUBLIC">Live Public</option>
                    <option value="ONLINE_SELF_PACED">Online Self-Paced</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
                <div>
                  <Label className="text-[#B9B6AF]">Target Audience</Label>
                  <Input name="targetAudience" defaultValue="PTs, PTAs, ATCs" className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90">
                {loading ? "Creating..." : "Create Course"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {courses.length === 0 ? (
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <GraduationCap className="h-10 w-10 text-[#B9B6AF]/30 mb-3" />
            <p className="text-[#B9B6AF]">No courses yet</p>
            <p className="text-xs text-[#B9B6AF]/60 mt-1">Add your first course to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)] hover:border-[#8FBDA3]/30 transition-colors cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="bg-[#363130] text-[#D7D3CD] border-0 text-[10px]">{course.shortCode}</Badge>
                    {course.isActive && <div className="h-2 w-2 rounded-full bg-[#8FBDA3]" />}
                  </div>
                  <h3 className="font-semibold text-[#D7D3CD] mb-1" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    {course.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-xs text-[#B9B6AF] mt-3">
                    <span>{course.ceuHours} CEU hrs</span>
                    <span>{formatLabel(course.format)}</span>
                    <span>${Number(course.defaultPrice).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-[#B9B6AF]/60 mt-2">
                    {course._count.courseEvents} event{course._count.courseEvents !== 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
