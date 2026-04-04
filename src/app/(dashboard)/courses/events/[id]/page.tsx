"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Award, Check, FileText, Mail, Send, UserPlus, Users } from "lucide-react";
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
}

interface LinkedFinancial {
  id: string;
  type: string;
  amount: string;
  date: string;
  description: string;
  paymentMethod: string;
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
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

  if (!event) return <div className="text-[#B9B6AF]">Loading...</div>;

  const currentStep = STATUS_STEPS.indexOf(event.status);

  return (
    <div className="space-y-6">
      <Link href={`/courses/${event.course.id}`} className="flex items-center gap-2 text-sm text-[#B9B6AF] hover:text-[#D7D3CD]">
        <ArrowLeft className="h-4 w-4" /> Back to {event.course.title}
      </Link>

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
              <div><p className="text-[#B9B6AF] text-xs">Attendees</p><p className="text-[#D7D3CD]">{event.attendeeCount}</p></div>
            </div>
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
    </div>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── SEND PRE-COURSE MATERIALS SECTION ───

function SendMaterialsSection({ eventId }: { eventId: string }) {
  const [sending, setSending] = useState(false);

  async function handleSendMaterials() {
    setSending(true);
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
            onClick={handleSendMaterials}
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
