"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Award, Check, Copy, DollarSign, FileText, Mail, Pencil, Send, Trash2, UserCheck, UserPlus, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_STEPS = ["TENTATIVE", "CONFIRMED", "DEPOSIT_RECEIVED", "COMPLETED"];

interface EventDetail {
  id: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  priceCharged: string;
  depositAmount: string;
  totalRevenue: string;
  travelCost: string;
  attendeeCount: number;
  notes: string;
  postEventFollowUpSent: boolean;
  rebookingPitched: boolean;
  rebookedForNextYear: boolean;
  course: { id: string; title: string; shortCode: string };
  clinic: { id: string; name: string; city: string; state: string };
  instructor: { id: string; firstName: string; lastName: string; credentials: string } | null;
  // Pricing fields
  standardPrice: string;
  earlyBirdPrice: string;
  earlyBirdCutoffDays: number;
  hostKickbackPerHead: string;
  minAttendees: number;
  maxAttendees: number;
  flatRate: string;
}

interface LinkedFinancial {
  id: string;
  type: string;
  amount: string;
  date: string;
  description: string;
  paymentMethod: string;
}

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  credentials: string;
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [linkedFinancials, setLinkedFinancials] = useState<LinkedFinancial[]>([]);

  async function fetchEvent() {
    const res = await fetch(`/api/events/${id}`);
    setEvent(await res.json());
  }

  async function fetchLinkedFinancials() {
    const res = await fetch(`/api/finances?courseEventId=${id}`);
    if (res.ok) setLinkedFinancials(await res.json());
  }

  useEffect(() => { fetchEvent(); fetchLinkedFinancials(); }, [id]);

  async function updateField(data: Record<string, unknown>) {
    await fetch(`/api/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchEvent();
    toast.success("Updated");
  }

  async function handleCopyRegistrationLink() {
    const url = `${window.location.origin}/register/${event!.id}`;
    await navigator.clipboard.writeText(url);
    toast.success("Registration link copied!");
  }

  async function handleCancelEvent() {
    if (!confirm("Cancel this event? Attendees will not be automatically notified.")) return;
    await updateField({ status: "CANCELLED" });
  }

  async function handleDeleteEvent() {
    if (!confirm("Permanently delete this event and all attendee records? This cannot be undone.")) return;
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Event deleted");
      router.push(`/courses/${event!.course.id}`);
    } else {
      toast.error("Failed to delete event");
    }
  }

  if (!event) return <div className="text-[#B9B6AF]">Loading...</div>;

  const currentStep = STATUS_STEPS.indexOf(event.status);
  const showRegistrationLink = event.status === "CONFIRMED" || event.status === "DEPOSIT_RECEIVED";
  const showCancelDelete = event.status !== "COMPLETED" && event.status !== "CANCELLED";

  return (
    <div className="space-y-6">
      <Link href={`/courses/${event.course.id}`} className="flex items-center gap-2 text-sm text-[#B9B6AF] hover:text-[#D7D3CD]">
        <ArrowLeft className="h-4 w-4" /> Back to {event.course.title}
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#D7D3CD]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            {event.course.title}
          </h1>
          <p className="text-sm text-[#B9B6AF] mt-1">
            {formatDate(event.eventDate)} at{" "}
            <Link href={`/clinics/${event.clinic.id}`} className="text-[#8FBDA3] hover:underline">
              {event.clinic.name}
            </Link>
          </p>
        </div>
        {showRegistrationLink && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyRegistrationLink}
            className="border-[rgba(215,211,205,0.15)] text-[#D7D3CD] hover:bg-[#363130]"
          >
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Copy Registration Link
          </Button>
        )}
      </div>

      {/* Status Progress */}
      <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    i <= currentStep ? "bg-[#8FBDA3] text-[#231F20]" : "bg-[#363130] text-[#B9B6AF]"
                  }`}>
                    {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <p className="text-[10px] mt-2 text-[#B9B6AF] text-center">
                    {step.replace(/_/g, " ")}
                  </p>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${i < currentStep ? "bg-[#8FBDA3]" : "bg-[#363130]"}`} />
                )}
              </div>
            ))}
          </div>
          {event.status !== "COMPLETED" && event.status !== "CANCELLED" && (
            <div className="mt-4 flex gap-2">
              {STATUS_STEPS.slice(currentStep + 1).map((nextStatus) => (
                <Button
                  key={nextStatus}
                  size="sm"
                  variant="outline"
                  onClick={() => updateField({ status: nextStatus })}
                  className="border-[rgba(215,211,205,0.15)] text-[#D7D3CD] hover:bg-[#363130]"
                >
                  Mark as {nextStatus.replace(/_/g, " ")}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Info */}
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-[#D7D3CD]" style={{ fontFamily: "var(--font-space-grotesk)" }}>Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-[#B9B6AF] text-xs">Date</p><p className="text-[#D7D3CD]">{formatDate(event.eventDate)}</p></div>
              <div><p className="text-[#B9B6AF] text-xs">Time</p><p className="text-[#D7D3CD]">{event.startTime} – {event.endTime}</p></div>
              <div><p className="text-[#B9B6AF] text-xs">Type</p><Badge className="bg-[#363130] text-[#D7D3CD] border-0">{event.type}</Badge></div>
              <div><p className="text-[#B9B6AF] text-xs">Attendees</p><p className="text-[#D7D3CD]">{event.attendeeCount} / {event.maxAttendees}</p></div>
              <div className="col-span-2">
                <p className="text-[#B9B6AF] text-xs">Instructor</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[#D7D3CD]">
                    {event.instructor
                      ? `${event.instructor.firstName} ${event.instructor.lastName}${event.instructor.credentials ? `, ${event.instructor.credentials}` : ""}`
                      : "Not assigned"}
                  </p>
                  <InstructorAssignDialog
                    eventId={event.id}
                    currentInstructorId={event.instructor?.id ?? null}
                    onAssigned={fetchEvent}
                  />
                </div>
              </div>
            </div>

            {/* Pricing Model */}
            <Separator className="bg-[rgba(215,211,205,0.07)]" />
            {event.type === "PUBLIC" ? (
              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF]">Public Pricing</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-[#B9B6AF] text-xs">Standard</p><p className="text-[#D7D3CD]">{formatCurrency(event.standardPrice)}/person</p></div>
                  <div><p className="text-[#B9B6AF] text-xs">Early Bird</p><p className="text-[#8FBDA3]">{formatCurrency(event.earlyBirdPrice)}/person</p></div>
                  <div><p className="text-[#B9B6AF] text-xs">Early Bird Cutoff</p><p className="text-[#D7D3CD]">{event.earlyBirdCutoffDays} days before</p></div>
                  <div><p className="text-[#B9B6AF] text-xs">Host Kickback</p><p className="text-[#D7D3CD]">{formatCurrency(event.hostKickbackPerHead)}/paid registrant</p></div>
                </div>
                <p className="text-xs text-[#B9B6AF]">+ 1 free seat for host clinic</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF]">Private Pricing</p>
                <div className="text-sm">
                  <p className="text-[#B9B6AF] text-xs">Flat Rate</p>
                  <p className="text-[#D7D3CD] text-lg font-semibold">{formatCurrency(event.flatRate)}</p>
                </div>
              </div>
            )}

            {/* Minimum Not Met Warning */}
            {event.type === "PUBLIC" && event.attendeeCount < event.minAttendees && event.status !== "COMPLETED" && event.status !== "CANCELLED" && (() => {
              const daysOut = Math.ceil((new Date(event.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return daysOut <= event.earlyBirdCutoffDays;
            })() && (
              <div className="flex items-start gap-2 rounded-lg bg-yellow-500/10 px-3 py-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-yellow-500">Below Minimum</p>
                  <p className="text-[10px] text-yellow-500/80">
                    {event.attendeeCount} of {event.minAttendees} minimum registrants. Consider cancelling or pushing registration.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financials */}
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[#D7D3CD]" style={{ fontFamily: "var(--font-space-grotesk)" }}>Financials</h2>
              <Link href="/finances" className="text-xs text-[#8FBDA3] hover:underline">
                View all →
              </Link>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[#B9B6AF]">Price Charged</span><span className="text-[#D7D3CD]">{formatCurrency(event.priceCharged)}</span></div>
              <div className="flex justify-between"><span className="text-[#B9B6AF]">Deposit</span><span className="text-[#D7D3CD]">{formatCurrency(event.depositAmount)}</span></div>
              <div className="flex justify-between"><span className="text-[#B9B6AF]">Travel Cost</span><span className="text-red-400">-{formatCurrency(event.travelCost)}</span></div>
              {linkedFinancials.length > 0 && (
                <>
                  <Separator className="bg-[rgba(215,211,205,0.07)]" />
                  <p className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF]">Logged Transactions</p>
                  {linkedFinancials.map((fin) => (
                    <div key={fin.id} className="flex justify-between">
                      <span className="text-[#B9B6AF]">
                        {fin.description || fin.type.replace(/_/g, " ")}
                        <span className="text-[#B9B6AF]/50 ml-1.5 text-xs">
                          {new Date(fin.date).toLocaleDateString()}
                        </span>
                      </span>
                      <span className={Number(fin.amount) >= 0 ? "text-[#8FBDA3]" : "text-red-400"}>
                        {Number(fin.amount) >= 0 ? "+" : ""}{formatCurrency(fin.amount)}
                      </span>
                    </div>
                  ))}
                </>
              )}
              {/* Host Kickback Estimate for Public Events */}
              {event.type === "PUBLIC" && event.attendeeCount > 0 && (
                <>
                  <Separator className="bg-[rgba(215,211,205,0.07)]" />
                  <p className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF]">Host Kickback Estimate</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B9B6AF]">
                      {Math.max(0, event.attendeeCount - 1)} paid × {formatCurrency(event.hostKickbackPerHead)}
                    </span>
                    <span className="text-red-400">
                      -{formatCurrency(Math.max(0, event.attendeeCount - 1) * Number(event.hostKickbackPerHead))}
                    </span>
                  </div>
                </>
              )}
              <Separator className="bg-[rgba(215,211,205,0.07)]" />
              <div className="flex justify-between font-semibold">
                <span className="text-[#B9B6AF]">Total Revenue</span>
                <span className="text-[#8FBDA3]">
                  {formatCurrency(
                    linkedFinancials.length > 0
                      ? linkedFinancials.reduce((sum, f) => sum + Number(f.amount), 0)
                      : event.totalRevenue
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pre-Course Materials */}
      <SendMaterialsSection eventId={event.id} />

      {/* Attendees */}
      <AttendeesSection eventId={event.id} />

      {/* CEU Certificates */}
      {event.status === "COMPLETED" && <CertificatesSection eventId={event.id} />}

      {/* Post-Event Checklist */}
      {event.status === "COMPLETED" && (
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
          <CardContent className="p-6">
            <h2 className="font-semibold text-[#D7D3CD] mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>Post-Event Checklist</h2>
            <div className="space-y-3">
              {[
                { key: "postEventFollowUpSent", label: "Follow-up email sent" },
                { key: "rebookingPitched", label: "Rebooking pitched" },
                { key: "rebookedForNextYear", label: "Rebooked for next year" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={event[key as keyof EventDetail] as boolean}
                    onChange={(e) => updateField({ [key]: e.target.checked })}
                    className="h-4 w-4 rounded border-[rgba(215,211,205,0.2)] bg-[#363130] accent-[#8FBDA3]"
                  />
                  <span className="text-sm text-[#D7D3CD]">{label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel / Delete Event */}
      {(showCancelDelete || event.status === "CANCELLED") && (
        <div className="flex items-center gap-3 pt-2">
          {showCancelDelete && (
            <Button
              variant="outline"
              onClick={handleCancelEvent}
              className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
            >
              Cancel Event
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteEvent}
            className="border-red-500/30 text-red-500 hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete Event
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── INSTRUCTOR ASSIGNMENT DIALOG ───

function InstructorAssignDialog({
  eventId,
  currentInstructorId,
  onAssigned,
}: {
  eventId: string;
  currentInstructorId: string | null;
  onAssigned: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedId, setSelectedId] = useState<string>(currentInstructorId ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/instructors")
        .then((res) => res.json())
        .then((data) => setInstructors(data));
      setSelectedId(currentInstructorId ?? "");
    }
  }, [open, currentInstructorId]);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instructorId: selectedId || null }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Instructor assigned");
      setOpen(false);
      onAssigned();
    } else {
      toast.error("Failed to assign instructor");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          size="sm"
          variant="outline"
          className="h-6 px-2 text-[10px] border-[rgba(215,211,205,0.15)] text-[#B9B6AF] hover:bg-[#363130]"
        >
          <UserCheck className="h-3 w-3 mr-1" />
          Assign
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>Assign Instructor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-[#B9B6AF]">Instructor</Label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm mt-1"
            >
              <option value="">-- None --</option>
              {instructors.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.firstName} {inst.lastName}{inst.credentials ? `, ${inst.credentials}` : ""}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── ATTENDEES SECTION ───

interface Attendee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  credentials: string;
  registrationType: string;
  amountPaid: string;
  ceuCertificateIssued: boolean;
}

function AttendeesSection({ eventId }: { eventId: string }) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editAttendee, setEditAttendee] = useState<Attendee | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteAttendee, setDeleteAttendee] = useState<Attendee | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function fetchAttendees() {
    const res = await fetch(`/api/attendees?courseEventId=${eventId}`);
    setAttendees(await res.json());
  }

  useEffect(() => { fetchAttendees(); }, [eventId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      courseEventId: eventId,
      firstName: fd.get("firstName"),
      lastName: fd.get("lastName"),
      email: fd.get("email") || "",
      credentials: fd.get("credentials") || "",
      registrationType: fd.get("registrationType") || "PAID",
      amountPaid: fd.get("amountPaid") || "0",
    };
    const res = await fetch("/api/attendees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Attendee added");
      setOpen(false);
      fetchAttendees();
    } else {
      toast.error("Failed to add attendee");
    }
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editAttendee) return;
    setEditLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      firstName: fd.get("firstName"),
      lastName: fd.get("lastName"),
      email: fd.get("email") || "",
      credentials: fd.get("credentials") || "",
      registrationType: fd.get("registrationType") || "PAID",
      amountPaid: fd.get("amountPaid") || "0",
    };
    const res = await fetch(`/api/attendees/${editAttendee.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setEditLoading(false);
    if (res.ok) {
      toast.success("Attendee updated");
      setEditOpen(false);
      setEditAttendee(null);
      fetchAttendees();
    } else {
      toast.error("Failed to update attendee");
    }
  }

  async function handleDelete() {
    if (!deleteAttendee) return;
    const res = await fetch(`/api/attendees/${deleteAttendee.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Attendee removed");
      setDeleteOpen(false);
      setDeleteAttendee(null);
      fetchAttendees();
    } else {
      toast.error("Failed to remove attendee");
    }
  }

  return (
    <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#8FBDA3]" />
            <h2 className="font-semibold text-[#D7D3CD]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Attendees ({attendees.length})
            </h2>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90 transition-colors">
              <UserPlus className="h-3.5 w-3.5 mr-1" /> Add Attendee
            </DialogTrigger>
            <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]">
              <DialogHeader>
                <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>Add Attendee</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#B9B6AF]">First Name *</Label>
                    <Input name="firstName" required className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
                  </div>
                  <div>
                    <Label className="text-[#B9B6AF]">Last Name *</Label>
                    <Input name="lastName" required className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#B9B6AF]">Email</Label>
                    <Input name="email" type="email" className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
                  </div>
                  <div>
                    <Label className="text-[#B9B6AF]">Credentials</Label>
                    <Input name="credentials" placeholder="PT, DPT, ATC..." className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#B9B6AF]">Registration Type</Label>
                    <select name="registrationType" defaultValue="PAID" className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm">
                      <option value="PAID">Paid</option>
                      <option value="FREE_HOST_SEAT">Free Host Seat</option>
                      <option value="COMP">Comp</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-[#B9B6AF]">Amount Paid</Label>
                    <Input name="amountPaid" type="number" step="0.01" defaultValue="0" className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90">
                  {loading ? "Adding..." : "Add Attendee"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {attendees.length === 0 ? (
          <p className="text-sm text-[#B9B6AF] text-center py-4">No attendees registered yet</p>
        ) : (
          <div className="space-y-2">
            {attendees.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-[rgba(215,211,205,0.05)] last:border-0">
                <div>
                  <p className="text-sm text-[#D7D3CD]">{a.firstName} {a.lastName} {a.credentials && <span className="text-[#B9B6AF]">, {a.credentials}</span>}</p>
                  <p className="text-xs text-[#B9B6AF]">{a.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-[#363130] text-[#B9B6AF] border-0 text-[9px]">{a.registrationType.replace(/_/g, " ")}</Badge>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${a.ceuCertificateIssued ? "bg-[#8FBDA3]/20 text-[#8FBDA3]" : "bg-[#363130] text-[#B9B6AF]"}`}>
                    {a.ceuCertificateIssued ? "CEU Sent" : "Pending"}
                  </span>
                  <button
                    onClick={() => { setEditAttendee(a); setEditOpen(true); }}
                    className="opacity-50 hover:opacity-100 transition-opacity text-[#B9B6AF] hover:text-[#D7D3CD]"
                    title="Edit attendee"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => { setDeleteAttendee(a); setDeleteOpen(true); }}
                    className="opacity-50 hover:opacity-100 transition-opacity text-[#B9B6AF] hover:text-red-400"
                    title="Remove attendee"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Attendee Dialog */}
        <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) setEditAttendee(null); }}>
          <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>Edit Attendee</DialogTitle>
            </DialogHeader>
            {editAttendee && (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#B9B6AF]">First Name *</Label>
                    <Input name="firstName" required defaultValue={editAttendee.firstName} className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
                  </div>
                  <div>
                    <Label className="text-[#B9B6AF]">Last Name *</Label>
                    <Input name="lastName" required defaultValue={editAttendee.lastName} className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#B9B6AF]">Email</Label>
                    <Input name="email" type="email" defaultValue={editAttendee.email} className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
                  </div>
                  <div>
                    <Label className="text-[#B9B6AF]">Credentials</Label>
                    <Input name="credentials" defaultValue={editAttendee.credentials} className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#B9B6AF]">Registration Type</Label>
                    <select name="registrationType" defaultValue={editAttendee.registrationType} className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm">
                      <option value="PAID">Paid</option>
                      <option value="FREE_HOST_SEAT">Free Host Seat</option>
                      <option value="COMP">Comp</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-[#B9B6AF]">Amount Paid</Label>
                    <Input name="amountPaid" type="number" step="0.01" defaultValue={editAttendee.amountPaid} className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
                  </div>
                </div>
                <Button type="submit" disabled={editLoading} className="w-full bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90">
                  {editLoading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Attendee Confirmation Dialog */}
        <Dialog open={deleteOpen} onOpenChange={(v) => { setDeleteOpen(v); if (!v) setDeleteAttendee(null); }}>
          <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>Remove Attendee</DialogTitle>
            </DialogHeader>
            {deleteAttendee && (
              <div className="space-y-4">
                <p className="text-sm text-[#B9B6AF]">
                  Remove {deleteAttendee.firstName} {deleteAttendee.lastName} from this event?
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => { setDeleteOpen(false); setDeleteAttendee(null); }}
                    className="border-[rgba(215,211,205,0.15)] text-[#D7D3CD] hover:bg-[#363130]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDelete}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// ─── SEND PRE-COURSE MATERIALS SECTION ───

function SendMaterialsSection({ eventId }: { eventId: string }) {
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);

  async function handleOpenConfirm() {
    // Fetch attendee count first so user knows what they're about to send
    try {
      const res = await fetch(`/api/attendees?courseEventId=${eventId}`);
      if (res.ok) {
        const data = await res.json();
        const withEmail = Array.isArray(data) ? data.filter((a: { email?: string }) => a.email).length : 0;
        setAttendeeCount(withEmail);
      }
    } catch {
      setAttendeeCount(0);
    }
    setConfirmOpen(true);
  }

  async function handleSendMaterials() {
    setSending(true);
    setConfirmOpen(false);
    try {
      const res = await fetch(`/api/events/${eventId}/send-materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Pre-course materials sent to ${data.sent} attendee${data.sent !== 1 ? "s" : ""}`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to send materials");
      }
    } catch {
      toast.error("Failed to send materials");
    }
    setSending(false);
  }

  return (
    <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#8FBDA3]" />
            <h2 className="font-semibold text-[#D7D3CD]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Pre-Course Materials
            </h2>
          </div>
          <Button
            size="sm"
            onClick={handleOpenConfirm}
            disabled={sending}
            className="bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            {sending ? "Sending..." : "Send to All Attendees"}
          </Button>
        </div>
        <p className="text-xs text-[#B9B6AF] mt-2">
          Sends the slide deck and course prep info to all registered attendees via email.
        </p>
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Confirm: Send Pre-Course Materials
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-[#B9B6AF]">
              This will send the pre-course email with the slide deck and logistics info to{" "}
              <span className="text-[#D7D3CD] font-medium">{attendeeCount} attendee{attendeeCount !== 1 ? "s" : ""}</span>{" "}
              with email addresses on file.
            </p>
            <p className="text-sm text-[#B9B6AF]">
              You will be CC&apos;d on each email.
            </p>
            {attendeeCount === 0 && (
              <p className="text-sm text-amber-400">
                No attendees have email addresses. Add emails to attendee records first.
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 border-[rgba(215,211,205,0.15)] text-[#D7D3CD] hover:bg-[#363130]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendMaterials}
                disabled={attendeeCount === 0}
                className="flex-1 bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Send to {attendeeCount} Attendee{attendeeCount !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ─── CEU CERTIFICATES SECTION ───

interface CertAttendee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  ceuCertificateIssued: boolean;
  certificateNumber: string | null;
}

function CertificatesSection({ eventId }: { eventId: string }) {
  const [attendees, setAttendees] = useState<CertAttendee[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  async function fetchCertStatus() {
    const res = await fetch(`/api/certificates/${eventId}`);
    if (res.ok) {
      const data: CertAttendee[] = await res.json();
      setAttendees(data);
      // Pre-select attendees who haven't received certs yet and have email
      const pending = new Set(
        data.filter((a) => !a.ceuCertificateIssued && a.email).map((a) => a.id)
      );
      setSelected(pending);
    }
  }

  useEffect(() => { fetchCertStatus(); }, [eventId]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(attendees.filter((a) => a.email).map((a) => a.id)));
  }

  async function handleSend(ids?: string[]) {
    setSending(true);
    try {
      const body: { courseEventId: string; attendeeIds?: string[] } = { courseEventId: eventId };
      if (ids) body.attendeeIds = ids;
      const res = await fetch("/api/certificates/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.sent} certificate${data.sent !== 1 ? "s" : ""} sent`);
        fetchCertStatus();
      } else {
        toast.error("Failed to send certificates");
      }
    } catch {
      toast.error("Failed to send certificates");
    }
    setSending(false);
  }

  const pendingCount = attendees.filter((a) => !a.ceuCertificateIssued && a.email).length;
  const sentCount = attendees.filter((a) => a.ceuCertificateIssued).length;

  return (
    <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-[#8FBDA3]" />
            <h2 className="font-semibold text-[#D7D3CD]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              CEU Certificates
            </h2>
            <span className="text-xs text-[#B9B6AF] ml-1">
              {sentCount} sent / {attendees.length} total
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSend(Array.from(selected))}
              disabled={sending || selected.size === 0}
              className="border-[rgba(215,211,205,0.15)] text-[#D7D3CD] hover:bg-[#363130]"
            >
              <Mail className="h-3.5 w-3.5 mr-1.5" />
              {sending ? "Sending..." : `Send Selected (${selected.size})`}
            </Button>
            {pendingCount > 0 && (
              <Button
                size="sm"
                onClick={() => handleSend()}
                disabled={sending}
                className="bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Send All
              </Button>
            )}
          </div>
        </div>

        {attendees.length === 0 ? (
          <p className="text-sm text-[#B9B6AF] text-center py-4">No attendees for this event</p>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-2 pb-2 mb-2 border-b border-[rgba(215,211,205,0.07)]">
              <input
                type="checkbox"
                checked={selected.size === attendees.filter((a) => a.email).length}
                onChange={(e) => {
                  if (e.target.checked) selectAll();
                  else setSelected(new Set());
                }}
                className="h-3.5 w-3.5 rounded border-[rgba(215,211,205,0.2)] bg-[#363130] accent-[#8FBDA3]"
              />
              <span className="text-[10px] text-[#B9B6AF] uppercase tracking-wider">Select All</span>
            </div>
            {attendees.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between py-2 border-b border-[rgba(215,211,205,0.05)] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(a.id)}
                    onChange={() => toggleSelect(a.id)}
                    disabled={!a.email}
                    className="h-3.5 w-3.5 rounded border-[rgba(215,211,205,0.2)] bg-[#363130] accent-[#8FBDA3]"
                  />
                  <div>
                    <p className="text-sm text-[#D7D3CD]">
                      {a.firstName} {a.lastName}
                    </p>
                    <p className="text-xs text-[#B9B6AF]">
                      {a.email || "No email"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {a.ceuCertificateIssued ? (
                    <>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#8FBDA3]/20 text-[#8FBDA3] flex items-center gap-1">
                        <Check className="h-3 w-3" /> Sent
                      </span>
                      {a.certificateNumber && (
                        <span className="text-[9px] text-[#B9B6AF]">{a.certificateNumber}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#363130] text-[#B9B6AF]">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
