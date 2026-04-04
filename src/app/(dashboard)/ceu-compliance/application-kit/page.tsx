"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Upload,
  Download,
  Eye,
  ArrowLeft,
  FileText,
  Briefcase,
  GraduationCap,
} from "lucide-react";

interface MaterialRef {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  tags: string[];
  course: { id: string; title: string; shortCode: string } | null;
}

interface DocumentItem {
  key: string;
  title: string;
  tag: string;
  uploaded: boolean;
  material: MaterialRef | null;
}

interface CourseGroup {
  courseId: string;
  courseTitle: string;
  shortCode: string;
  ceuHours: number;
  documents: DocumentItem[];
  completedCount: number;
  totalCount: number;
}

interface KitData {
  providerDocuments: DocumentItem[];
  courseDocuments: CourseGroup[];
  completionPercentage: number;
  totalCompleted: number;
  totalDocuments: number;
}

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

export default function ApplicationKitPage() {
  const [kitData, setKitData] = useState<KitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<{
    tag: string;
    courseId: string | null;
    title: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchKit() {
    try {
      const res = await fetch("/api/ceu/application-kit");
      const data = await res.json();
      setKitData(data);
    } catch {
      toast.error("Failed to load application kit data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchKit();
  }, []);

  function openUpload(tag: string, courseId: string | null, title: string) {
    setUploadTarget({ tag, courseId, title });
    setUploadOpen(true);
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!uploadTarget) return;

    const fd = new FormData(e.currentTarget);
    const file = fd.get("file") as File;
    if (!file || !file.name) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);

    try {
      // Upload file to storage
      const uploadFd = new FormData();
      uploadFd.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadFd });

      if (!uploadRes.ok) {
        toast.error("File upload failed");
        setUploading(false);
        return;
      }

      const uploadData = await uploadRes.json();

      // Create material record with tags
      const materialBody = {
        title: fd.get("title") || uploadTarget.title,
        type: (fd.get("type") as string) || "OTHER",
        courseId: uploadTarget.courseId || null,
        fileUrl: uploadData.fileUrl,
        fileSize: uploadData.fileSize,
        mimeType: uploadData.mimeType,
        version: "v1.0",
        isTemplate: false,
        tags: ["ceu-kit", uploadTarget.tag],
      };

      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(materialBody),
      });

      if (res.ok) {
        toast.success("Document uploaded successfully");
        setUploadOpen(false);
        setUploadTarget(null);
        fetchKit();
      } else {
        toast.error("Failed to save material record");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleGenerateTemplate(templateType: string) {
    try {
      const res = await fetch("/api/ceu/application-kit/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateType }),
      });
      if (res.ok) {
        toast.success("Template generated");
        fetchKit();
      } else {
        toast.error("Failed to generate template");
      }
    } catch {
      toast.error("Failed to generate template");
    }
  }

  if (loading) {
    return (
      <div className="text-[#B9B6AF] p-8">Loading application kit data...</div>
    );
  }

  if (!kitData) {
    return (
      <div className="text-[#B9B6AF] p-8">Failed to load application kit.</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/ceu-compliance"
            className="inline-flex items-center justify-center rounded-lg p-2 text-[#B9B6AF] hover:bg-[#363130] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1
              className="text-2xl font-bold text-[#D7D3CD]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              CEU Application Kit
            </h1>
            <p className="text-sm text-[#B9B6AF] mt-1">
              Reusable documents for state CEU board applications
            </p>
          </div>
        </div>
      </div>

      {/* Completion Overview */}
      <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-semibold text-[#D7D3CD]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Overall Completion
            </h2>
            <span className="text-2xl font-bold text-[#8FBDA3]">
              {kitData.completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-[#363130] rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-[#8FBDA3] rounded-full transition-all duration-500"
              style={{ width: `${kitData.completionPercentage}%` }}
            />
          </div>
          <p className="text-sm text-[#B9B6AF] mt-2">
            {kitData.totalCompleted} of {kitData.totalDocuments} documents
            uploaded
          </p>
        </CardContent>
      </Card>

      {/* Provider Documents Section */}
      <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="h-5 w-5 text-[#8FBDA3]" />
            <h2
              className="text-lg font-semibold text-[#D7D3CD]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Provider Documents
            </h2>
            <Badge className="bg-[#8FBDA3]/20 text-[#8FBDA3] border-0 text-xs">
              Reusable across all applications
            </Badge>
          </div>
          <div className="space-y-3">
            {kitData.providerDocuments.map((doc) => (
              <DocumentRow
                key={doc.key}
                doc={doc}
                onUpload={() => openUpload(doc.tag, null, doc.title)}
                onGenerateTemplate={
                  ["release-of-liability", "participant-evaluation"].includes(doc.key)
                    ? () => handleGenerateTemplate(doc.key)
                    : undefined
                }
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Per-Course Documents */}
      {kitData.courseDocuments.map((courseGroup) => (
        <Card
          key={courseGroup.courseId}
          className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-[#8FBDA3]" />
                <div>
                  <h2
                    className="text-lg font-semibold text-[#D7D3CD]"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {courseGroup.courseTitle}
                  </h2>
                  <p className="text-xs text-[#B9B6AF]">
                    {courseGroup.shortCode} &middot; {courseGroup.ceuHours} CEU
                    hours
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-[#D7D3CD]">
                  {courseGroup.completedCount}/{courseGroup.totalCount}
                </span>
                <div className="w-24 bg-[#363130] rounded-full h-2 mt-1 overflow-hidden">
                  <div
                    className="h-full bg-[#8FBDA3] rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        courseGroup.totalCount > 0
                          ? (courseGroup.completedCount / courseGroup.totalCount) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {courseGroup.documents.map((doc) => (
                <DocumentRow
                  key={doc.key}
                  doc={doc}
                  onUpload={() =>
                    openUpload(doc.tag, courseGroup.courseId, `${doc.title} - ${courseGroup.shortCode}`)
                  }
                  onGenerateTemplate={
                    doc.key === "certificate-template"
                      ? () => handleGenerateTemplate("certificate-template")
                      : undefined
                  }
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Upload Document
            </DialogTitle>
          </DialogHeader>
          {uploadTarget && (
            <form onSubmit={handleUpload} className="space-y-4">
              <p className="text-sm text-[#B9B6AF]">{uploadTarget.title}</p>
              <div>
                <Label className="text-[#B9B6AF]">Title</Label>
                <input
                  name="title"
                  defaultValue={uploadTarget.title}
                  className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm"
                />
              </div>
              <div>
                <Label className="text-[#B9B6AF]">Document Type</Label>
                <select
                  name="type"
                  defaultValue="OTHER"
                  className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm"
                >
                  {MATERIAL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-[#B9B6AF]">File</Label>
                <input
                  ref={fileInputRef}
                  name="file"
                  type="file"
                  required
                  className="w-full text-sm text-[#B9B6AF] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-[rgba(215,211,205,0.1)] file:text-sm file:font-medium file:bg-[#363130] file:text-[#D7D3CD] hover:file:bg-[#3a3535]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUploadOpen(false)}
                  className="flex-1 border-[rgba(215,211,205,0.1)] text-[#B9B6AF] hover:bg-[#363130]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90 font-medium"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DocumentRow({
  doc,
  onUpload,
  onGenerateTemplate,
}: {
  doc: DocumentItem;
  onUpload: () => void;
  onGenerateTemplate?: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-[#231F20] border border-[rgba(215,211,205,0.05)]">
      <div className="flex items-center gap-3">
        {doc.uploaded ? (
          <CheckCircle className="h-5 w-5 text-[#8FBDA3] flex-shrink-0" />
        ) : (
          <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
        )}
        <div>
          <p className="text-sm text-[#D7D3CD]">{doc.title}</p>
          {doc.material && (
            <p className="text-xs text-[#B9B6AF] mt-0.5">
              {doc.material.title}
              {doc.material.fileSize > 0 &&
                ` (${formatFileSize(doc.material.fileSize)})`}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {doc.uploaded && doc.material ? (
          <>
            <a
              href={doc.material.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg p-2 text-[#B9B6AF] hover:bg-[#363130] hover:text-[#D7D3CD] transition-colors"
              title="View / Download"
            >
              <Eye className="h-4 w-4" />
            </a>
            <a
              href={doc.material.fileUrl}
              download
              className="inline-flex items-center justify-center rounded-lg p-2 text-[#B9B6AF] hover:bg-[#363130] hover:text-[#D7D3CD] transition-colors"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </a>
          </>
        ) : (
          <>
            {onGenerateTemplate && (
              <button
                onClick={onGenerateTemplate}
                className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium border border-[#8FBDA3]/30 text-[#8FBDA3] hover:bg-[#8FBDA3]/10 transition-colors"
                title="Generate template"
              >
                <FileText className="h-3.5 w-3.5 mr-1" />
                Template
              </button>
            )}
            <button
              onClick={onUpload}
              className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium border border-[rgba(215,211,205,0.1)] text-[#B9B6AF] hover:bg-[#363130] hover:text-[#D7D3CD] transition-colors"
              title="Upload document"
            >
              <Upload className="h-3.5 w-3.5 mr-1" />
              Upload
            </button>
          </>
        )}
      </div>
    </div>
  );
}
