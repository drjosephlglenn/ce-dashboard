"use client";

import { useEffect, useState, useRef } from "react";
import { FolderOpen, Upload, FileText, Image, Film, Presentation, File, Search, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface MaterialItem {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  version: string;
  tags: string[];
  isTemplate: boolean;
  courseId: string | null;
  course: { id: string; title: string; shortCode: string } | null;
  createdAt: string;
}

interface CourseOption {
  id: string;
  title: string;
  shortCode: string;
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  SLIDE_DECK: Presentation,
  HANDOUT: FileText,
  FLYER: Image,
  PHOTO: Image,
  VIDEO: Film,
  CERTIFICATE_TEMPLATE: FileText,
  CONTRACT: FileText,
  INVOICE_TEMPLATE: FileText,
};

const MATERIAL_TYPES = [
  "SLIDE_DECK", "HANDOUT", "FLYER", "CERTIFICATE_TEMPLATE",
  "MARKETING_EMAIL", "SOCIAL_MEDIA", "CONTRACT", "INVOICE_TEMPLATE",
  "PHOTO", "VIDEO", "OTHER",
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MaterialItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchMaterials() {
    const params = new URLSearchParams();
    if (filterType) params.set("type", filterType);
    if (filterCourse) params.set("courseId", filterCourse);
    if (search) params.set("search", search);
    const res = await fetch(`/api/materials?${params}`);
    setMaterials(await res.json());
  }

  async function fetchCourses() {
    const res = await fetch("/api/courses");
    setCourses(await res.json());
  }

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { fetchMaterials(); }, [filterType, filterCourse, search]);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file") as File;
    if (!file || !file.name) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);

    // Upload file
    const uploadFd = new FormData();
    uploadFd.append("file", file);
    const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadFd });

    if (!uploadRes.ok) {
      setUploading(false);
      toast.error("File upload failed");
      return;
    }

    const uploadData = await uploadRes.json();

    // Create material record
    const body = {
      title: fd.get("title") || file.name,
      type: fd.get("type") || "OTHER",
      courseId: fd.get("courseId") || null,
      fileUrl: uploadData.fileUrl,
      fileSize: uploadData.fileSize,
      mimeType: uploadData.mimeType,
      version: fd.get("version") || "v1.0",
      isTemplate: fd.get("isTemplate") === "on",
    };

    const res = await fetch("/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setUploading(false);
    if (res.ok) {
      toast.success("Material uploaded");
      setUploadOpen(false);
      fetchMaterials();
    } else {
      toast.error("Failed to save material");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/materials/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Material deleted");
      setDeleteTarget(null);
      fetchMaterials();
    } else {
      toast.error("Failed to delete material");
    }
  }

  // Group by course
  const grouped = materials.reduce<Record<string, MaterialItem[]>>((acc, m) => {
    const key = m.course ? m.course.shortCode : "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#D7D3CD]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Materials Library
          </h1>
          <p className="text-sm text-[#B9B6AF] mt-1">{materials.length} files</p>
        </div>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90 transition-colors">
            <Upload className="h-4 w-4 mr-2" /> Upload File
          </DialogTrigger>
          <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>Upload Material</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label className="text-[#B9B6AF]">File *</Label>
                <Input name="file" type="file" ref={fileInputRef} required className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] file:text-[#B9B6AF] file:bg-[#363130] file:border-0" />
              </div>
              <div>
                <Label className="text-[#B9B6AF]">Title</Label>
                <Input name="title" placeholder="Auto-filled from filename" className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#B9B6AF]">Type</Label>
                  <select name="type" defaultValue="OTHER" className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm">
                    {MATERIAL_TYPES.map(t => (
                      <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-[#B9B6AF]">Course</Label>
                  <select name="courseId" defaultValue="" className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm">
                    <option value="">General (no course)</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.shortCode} — {c.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#B9B6AF]">Version</Label>
                  <Input name="version" defaultValue="v1.0" className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input name="isTemplate" type="checkbox" className="h-4 w-4 rounded accent-[#8FBDA3]" />
                  <Label className="text-[#B9B6AF]">Template</Label>
                </div>
              </div>
              <Button type="submit" disabled={uploading} className="w-full bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90">
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#B9B6AF]" />
          <Input
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-9 rounded-md bg-[#2C2828] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm"
        >
          <option value="">All Types</option>
          {MATERIAL_TYPES.map(t => (
            <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
          ))}
        </select>
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="h-9 rounded-md bg-[#2C2828] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm"
        >
          <option value="">All Courses</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.shortCode}</option>
          ))}
        </select>
      </div>

      {/* Files Grid */}
      {materials.length === 0 ? (
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="h-10 w-10 text-[#B9B6AF]/30 mb-3" />
            <p className="text-[#B9B6AF]">No materials yet</p>
            <p className="text-xs text-[#B9B6AF]/60 mt-1">Upload your first file to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([groupName, items]) => (
            <div key={groupName}>
              <h3 className="text-xs tracking-[0.16em] uppercase text-[#B9B6AF] mb-3 flex items-center gap-2">
                <FolderOpen className="h-3.5 w-3.5" /> {groupName}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((m) => {
                  const IconComp = TYPE_ICONS[m.type] || File;
                  return (
                    <Card key={m.id} className="bg-[#2C2828] border-[rgba(215,211,205,0.07)] hover:border-[#8FBDA3]/30 transition-colors group relative">
                      <CardContent className="p-4">
                        <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 cursor-pointer">
                          <div className="p-2 rounded-lg bg-[#363130]">
                            <IconComp className="h-5 w-5 text-[#8FBDA3]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#D7D3CD] truncate">{m.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-[#363130] text-[#B9B6AF] border-0 text-[9px]">{m.type.replace(/_/g, " ")}</Badge>
                              <span className="text-[10px] text-[#B9B6AF]">{m.version}</span>
                            </div>
                            <p className="text-[10px] text-[#B9B6AF]/60 mt-1">
                              {formatFileSize(m.fileSize)} &middot; {formatDate(m.createdAt)}
                            </p>
                          </div>
                          {m.isTemplate && (
                            <Badge className="bg-[#8FBDA3]/20 text-[#8FBDA3] border-0 text-[9px]">Template</Badge>
                          )}
                        </a>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(m); }}
                          className="absolute top-3 right-3 p-1.5 rounded-md text-[#B9B6AF] opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>Delete Material</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#B9B6AF]">
            Delete {deleteTarget?.title ? `"${deleteTarget.title}"` : "this material"}? This cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} className="text-[#B9B6AF]">
              Cancel
            </Button>
            <Button onClick={() => deleteTarget && handleDelete(deleteTarget.id)} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
