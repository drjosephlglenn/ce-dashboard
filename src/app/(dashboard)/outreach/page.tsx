"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle, Send, UserX, CheckCircle, Plus, Mail, Paperclip, X } from "lucide-react";
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
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface OutreachItem {
  id: string;
  date: string;
  method: string;
  direction: string;
  subject: string;
  notes: string;
  outcome: string;
  followUpDate: string | null;
  followUpCompleted: boolean;
  clinic: { id: string; name: string; city: string; state: string };
  contact: { firstName: string; lastName: string } | null;
}

interface ClinicOption {
  id: string;
  name: string;
  city: string;
  state: string;
  status: string;
}

interface ContactOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  clinicId: string;
}

interface RecipientOption {
  email: string;
  label: string;
  type: "contact" | "attendee";
  courseName?: string;
}

const EMAIL_TEMPLATES = [
  { value: "follow_up", label: "Follow-Up Reminder" },
  { value: "booking_confirmation", label: "Booking Confirmation" },
  { value: "post_course", label: "Post-Course Thank You" },
  { value: "bfr_l1_to_acl", label: "BFR L1 → ACL+BFR Upgrade Pitch (Directors)" },
  { value: "bfr_attendee_teaser", label: "BFR → ACL+BFR Teaser (Attendees)" },
  { value: "rebooking_pitch", label: "Rebooking Pitch" },
  { value: "invoice_reminder", label: "Invoice Reminder" },
  { value: "custom", label: "Custom Email" },
];

export default function OutreachPage() {
  const [overdue, setOverdue] = useState<OutreachItem[]>([]);
  const [today, setToday] = useState<OutreachItem[]>([]);
  const [recent, setRecent] = useState<OutreachItem[]>([]);
  const [clinics, setClinics] = useState<ClinicOption[]>([]);
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [open, setOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailForm, setEmailForm] = useState({
    clinicId: "",
    to: "",
    template: "follow_up",
    subject: "",
    body: "",
  });
  const [emailPreview, setEmailPreview] = useState("");
  const [recipients, setRecipients] = useState<RecipientOption[]>([]);
  const [recipientMode, setRecipientMode] = useState<"select" | "custom" | "all">("select");
  const [sendAllProgress, setSendAllProgress] = useState({ sent: 0, total: 0, active: false });
  const [materials, setMaterials] = useState<{ id: string; title: string; type: string; fileUrl: string; course?: { title: string } | null }[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [attachOpen, setAttachOpen] = useState(false);

  async function fetchData() {
    const [overdueRes, todayRes, recentRes, clinicsRes, contactsRes, materialsRes] = await Promise.all([
      fetch("/api/outreach?overdue=true"),
      fetch("/api/outreach?today=true"),
      fetch("/api/outreach"),
      fetch("/api/clinics"),
      fetch("/api/contacts"),
      fetch("/api/materials"),
    ]);
    setOverdue(await overdueRes.json());
    setToday(await todayRes.json());
    setRecent(await recentRes.json());
    setClinics(await clinicsRes.json());
    const contactData = await contactsRes.json();
    if (Array.isArray(contactData)) setContacts(contactData);
    const matData = await materialsRes.json();
    if (Array.isArray(matData)) setMaterials(matData);
  }

  useEffect(() => { fetchData(); }, []);

  function generateEmailContent(template: string, clinicName: string, contactName: string) {
    switch (template) {
      case "follow_up":
        return {
          subject: `Following Up: Continuing Education for ${clinicName}`,
          body: `Hi ${contactName},\n\nI wanted to follow up regarding continuing education opportunities for ${clinicName}. We offer hands-on courses in ACL+BFR rehabilitation, Strength & Conditioning for PTs, and Force Plate testing.\n\nWould your team be interested in scheduling a course? I'm happy to walk through the options and find the best fit.\n\nLooking forward to hearing from you!\n\nJoey Glenn, DC, CSCS\nSIDELINE Continuing Education`,
        };
      case "booking_confirmation":
        return {
          subject: `Booking Confirmed — ${clinicName}`,
          body: `Hi ${contactName},\n\nGreat news! Your continuing education course has been confirmed. We'll send additional details and materials as the date approaches.\n\nIf you have any questions in the meantime, just reply to this email.\n\nJoey Glenn, DC, CSCS\nSIDELINE Continuing Education`,
        };
      case "post_course":
        return {
          subject: `Thank You — ${clinicName}`,
          body: `Hi ${contactName},\n\nThank you for hosting us at ${clinicName}! It was a great session and we appreciate the opportunity to work with your team.\n\nCEU certificates will be sent within 48 hours. We'd love to hear your feedback and discuss upcoming courses for next year.\n\nJoey Glenn, DC, CSCS\nSIDELINE Continuing Education`,
        };
      case "bfr_l1_to_acl":
        return {
          subject: `Ready for the next step with BFR? - ${clinicName}`,
          body: `Hi ${contactName},\n\nI hope you're doing well. I wanted to reach out because I really enjoyed teaching the Smart Tools BFR Level 1 course at ${clinicName}. Your team was engaged, asked great questions, and it was obvious they're serious about improving their clinical skills.\n\nSince that course, the most common question I've gotten from clinicians who completed L1 is: "I know how to use BFR now, but how do I actually program it into my rehab protocols?"\n\nThat question is exactly why I built a new course:\n\nACL+BFR Mastery: From Rehab to Return\n8 CEU Hours | Live, In-Person | 5 Hands-On Labs\n\nThis course picks up where L1 left off and gives your team a complete, phase-by-phase BFR protocol for ACL reconstruction rehab, from early post-op all the way through return-to-sport clearance.\n\nHere's what the protocol covers:\n\n▸ Early Post-Op (Weeks 1-6)\nLow-load BFR exercises to preserve quad mass during the window when your patient can't load heavy. This is where BFR makes the biggest difference.\n\n▸ Mid Rehab (Weeks 6-16)\nCombining BFR with progressive loading. Closed chain exercises, single-leg work, and addressing the persistent quad inhibition that standard rehab often misses.\n\n▸ Late Phase (4-9+ Months)\nBFR paired with heavy loading, plyometric readiness, sport-specific progression, and knowing when to move past BFR entirely.\n\n▸ Return-to-Sport Testing\nObjective clearance using strength testing, hop test batteries, landing quality, and psychological readiness. Your team will practice every test hands-on during the course.\n\nA few things that set this course apart:\n• Over half the course is hands-on, with a lab after every lecture module\n• A pre-req video is sent beforehand so we can skip the basics and maximize practice time\n• Your team walks away with a protocol they can start using immediately\n• All content is backed by current peer-reviewed research (2022-2025)\n\nSince your team already has the BFR foundation from L1, they're the perfect fit for this. It's designed to be the next step.\n\nWould ${clinicName} be interested in hosting? I have limited dates available and would love to get your team on the calendar. Just reply and we can figure out what works.\n\nJoey Glenn, DC, CSCS\nSIDELINE Continuing Education`,
        };
      case "bfr_attendee_teaser":
        return {
          subject: `Enjoyed the BFR course? There's a next step`,
          body: `Hi ${contactName},\n\nI hope you've been doing well since the BFR Level 1 course at ${clinicName}. I really enjoyed working with your group and could tell everyone was hungry to learn.\n\nI wanted to reach out because I've built a new course that picks up right where L1 left off. It's called ACL+BFR Mastery, and it's all about taking BFR from "I know how to use this" to "I have an exact protocol for my ACL patients from day one through return-to-sport."\n\nThe course is 8 CEU hours, mostly hands-on, and covers the full rehab timeline with BFR programming at every phase. If you've been wondering how to fit BFR into your post-op protocols more consistently, this is exactly that.\n\nIf that sounds like something you'd be into, would you mind passing this along to whoever handles CE scheduling at your clinic? I'd love to come back and work with your team again.\n\nFeel free to reply with any questions. Always happy to chat.\n\nJoey Glenn, DC, CSCS\nSIDELINE Continuing Education`,
        };
      case "rebooking_pitch":
        return {
          subject: `Rebook for ${new Date().getFullYear() + 1}? — ${clinicName}`,
          body: `Hi ${contactName},\n\nThank you again for hosting us at ${clinicName}. The feedback from your team was great and we'd love to come back.\n\nA few reasons to rebook early:\n• Lock in your preferred date before the calendar fills up\n• Keep your staff's CEUs on track — consistent annual education builds on itself\n• New content: courses are updated each year with the latest evidence\n\nWe can rebook the same course for new staff, or bring something different this time. Our current offerings:\n\n• ACL+BFR Mastery: From Rehab to Return (8 CEU hours)\n• Strength + Conditioning for Physical Therapists (8 CEU hours)\n• Force Plates + Data in the Clinic (4 CEU hours)\n\nWant to lock in a date? Just reply with a few options that work for your team and we'll get it scheduled.\n\nJoey Glenn, DC, CSCS\nSIDELINE Continuing Education`,
        };
      case "invoice_reminder":
        return {
          subject: `Invoice Reminder — ${clinicName}`,
          body: `Hi ${contactName},\n\nThis is a friendly reminder regarding the outstanding invoice for your recent continuing education course. If payment has already been sent, please disregard this message.\n\nQuestions? Just reply to this email.\n\nJoey Glenn, DC, CSCS\nSIDELINE Continuing Education`,
        };
      default:
        return { subject: "", body: "" };
    }
  }

  function handleTemplateChange(template: string) {
    const clinic = clinics.find((c) => c.id === emailForm.clinicId);
    const contact = contacts.find((c) => c.clinicId === emailForm.clinicId);
    const clinicName = clinic?.name || "your clinic";
    const contactName = contact?.firstName || "there";

    if (template === "custom") {
      setEmailForm({ ...emailForm, template, subject: "", body: "" });
    } else {
      const content = generateEmailContent(template, clinicName, contactName);
      setEmailForm({ ...emailForm, template, subject: content.subject, body: content.body });
    }
  }

  async function handleClinicChange(clinicId: string) {
    const contact = contacts.find((c) => c.clinicId === clinicId);
    const clinic = clinics.find((c) => c.id === clinicId);
    const toEmail = contact?.email || "";
    const contactName = contact?.firstName || "there";
    const clinicName = clinic?.name || "your clinic";

    // Build recipient options from contacts
    const recipientOpts: RecipientOption[] = [];
    const clinicContacts = contacts.filter((c) => c.clinicId === clinicId && c.email);
    clinicContacts.forEach((c) => {
      recipientOpts.push({
        email: c.email,
        label: `${c.firstName} ${c.lastName}`,
        type: "contact",
      });
    });

    // Fetch attendees for this clinic
    if (clinicId) {
      try {
        const res = await fetch(`/api/clinics/${clinicId}`);
        if (res.ok) {
          const clinicData = await res.json();
          const seenEmails = new Set(recipientOpts.map((r) => r.email.toLowerCase()));
          (clinicData.courseEvents || []).forEach((event: { course: { title: string }; attendees: { firstName: string; lastName: string; email: string; credentials: string }[] }) => {
            (event.attendees || []).forEach((att) => {
              if (att.email && !seenEmails.has(att.email.toLowerCase())) {
                seenEmails.add(att.email.toLowerCase());
                recipientOpts.push({
                  email: att.email,
                  label: `${att.firstName} ${att.lastName}${att.credentials ? `, ${att.credentials}` : ""}`,
                  type: "attendee",
                  courseName: event.course.title,
                });
              }
            });
          });
        }
      } catch {
        // Silently fail — contacts still available
      }
    }

    setRecipients(recipientOpts);
    setRecipientMode(recipientOpts.length > 0 ? "select" : "custom");

    if (emailForm.template !== "custom") {
      const content = generateEmailContent(emailForm.template, clinicName, contactName);
      setEmailForm({ ...emailForm, clinicId, to: toEmail, subject: content.subject, body: content.body });
    } else {
      setEmailForm({ ...emailForm, clinicId, to: toEmail });
    }
  }

  async function sendOneEmail(toEmail: string, subject: string, body: string, materialIds?: string[]) {
    const html = body
      .split("\n")
      .map((line) => (line.trim() === "" ? "<br/>" : `<p style="margin:0 0 8px 0;color:#333;font-family:sans-serif;">${line}</p>`))
      .join("");

    const payload: Record<string, unknown> = { to: toEmail, subject, html };
    if (materialIds && materialIds.length > 0) payload.materialIds = materialIds;

    const res = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to send");
    return res;
  }

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();

    // Send to all attendees mode
    if (recipientMode === "all") {
      const attendeeEmails = recipients.filter((r) => r.email).map((r) => r.email);
      if (attendeeEmails.length === 0) {
        toast.error("No recipients with email addresses");
        return;
      }
      if (!emailForm.subject || !emailForm.body) {
        toast.error("Please fill in subject and message");
        return;
      }

      setSending(true);
      setSendAllProgress({ sent: 0, total: attendeeEmails.length, active: true });

      let successCount = 0;
      let failCount = 0;

      for (const email of attendeeEmails) {
        try {
          // Personalize the greeting if possible
          const recipient = recipients.find((r) => r.email === email);
          const firstName = recipient?.label.split(" ")[0] || "there";
          const personalizedBody = emailForm.body.replace(/^Hi .+,/m, `Hi ${firstName},`);

          await sendOneEmail(email, emailForm.subject, personalizedBody, selectedMaterials);
          successCount++;
          setSendAllProgress((prev) => ({ ...prev, sent: prev.sent + 1 }));
        } catch {
          failCount++;
        }
      }

      // Log one outreach entry for the batch
      if (emailForm.clinicId) {
        await fetch("/api/outreach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clinicId: emailForm.clinicId,
            method: "EMAIL",
            direction: "OUTBOUND",
            subject: emailForm.subject,
            notes: `Batch email sent to ${successCount} recipients${failCount > 0 ? ` (${failCount} failed)` : ""}`,
            outcome: "NO_RESPONSE",
            followUpDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
          }),
        });
      }

      toast.success(`Sent to ${successCount} of ${attendeeEmails.length} recipients`);
      if (failCount > 0) toast.error(`${failCount} emails failed to send`);

      setEmailOpen(false);
      setEmailForm({ clinicId: "", to: "", template: "follow_up", subject: "", body: "" });
      setRecipients([]);
      setRecipientMode("select");
      setSelectedMaterials([]);
      setSendAllProgress({ sent: 0, total: 0, active: false });
      setSending(false);
      fetchData();
      return;
    }

    // Single email mode
    if (!emailForm.to || !emailForm.subject || !emailForm.body) {
      toast.error("Please fill in all fields");
      return;
    }
    setSending(true);
    try {
      await sendOneEmail(emailForm.to, emailForm.subject, emailForm.body, selectedMaterials);

      // Also log as outreach activity
      if (emailForm.clinicId) {
        await fetch("/api/outreach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clinicId: emailForm.clinicId,
            method: "EMAIL",
            direction: "OUTBOUND",
            subject: emailForm.subject,
            notes: `Sent via dashboard to ${emailForm.to}`,
            outcome: "NO_RESPONSE",
            followUpDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
          }),
        });
      }

      toast.success(`Email sent to ${emailForm.to}`);
      setEmailOpen(false);
      setEmailForm({ clinicId: "", to: "", template: "follow_up", subject: "", body: "" });
      setRecipients([]);
      setRecipientMode("select");
      setSelectedMaterials([]);
      fetchData();
    } catch {
      toast.error("Failed to send email");
    } finally {
      setSending(false);
    }
  }

  async function markComplete(id: string) {
    await fetch(`/api/outreach/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followUpCompleted: true }),
    });
    toast.success("Marked complete");
    fetchData();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      clinicId: fd.get("clinicId"),
      method: fd.get("method") || "EMAIL",
      direction: fd.get("direction") || "OUTBOUND",
      subject: fd.get("subject") || "",
      notes: fd.get("notes") || "",
      outcome: fd.get("outcome") || "NO_RESPONSE",
      followUpDate: fd.get("followUpDate") || null,
    };
    const res = await fetch("/api/outreach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Outreach logged");
      setOpen(false);
      fetchData();
    } else {
      toast.error("Failed to log outreach");
    }
  }

  const methodColors: Record<string, string> = {
    EMAIL: "bg-blue-500/20 text-blue-400",
    PHONE: "bg-purple-500/20 text-purple-400",
    IN_PERSON: "bg-[#8FBDA3]/20 text-[#8FBDA3]",
    TEXT: "bg-amber-500/20 text-amber-400",
    SOCIAL_MEDIA: "bg-pink-500/20 text-pink-400",
    OTHER: "bg-[#363130] text-[#D7D3CD]",
  };

  const outcomeColors: Record<string, string> = {
    NO_RESPONSE: "bg-[#363130] text-[#B9B6AF]",
    INTERESTED: "bg-[#8FBDA3]/20 text-[#8FBDA3]",
    NOT_INTERESTED: "bg-red-500/20 text-red-400",
    FOLLOW_UP_NEEDED: "bg-amber-500/20 text-amber-400",
    BOOKED: "bg-purple-500/20 text-purple-400",
    REFERRED: "bg-blue-500/20 text-blue-400",
  };

  function OutreachList({ items, showMarkComplete = false }: { items: OutreachItem[]; showMarkComplete?: boolean }) {
    if (items.length === 0) return <p className="text-sm text-[#B9B6AF] py-4">Nothing here</p>;
    return (
      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.id} className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#D7D3CD]">{item.clinic.name}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`border-0 text-[10px] ${methodColors[item.method] || methodColors.OTHER}`}>
                      {item.method}
                    </Badge>
                    <Badge className={`border-0 text-[10px] ${outcomeColors[item.outcome] || outcomeColors.NO_RESPONSE}`}>
                      {item.outcome.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs text-[#B9B6AF]">{formatDate(item.date)}</span>
                  </div>
                  {item.subject && <p className="text-xs text-[#B9B6AF]">{item.subject}</p>}
                  {item.followUpDate && !item.followUpCompleted && (
                    <p className="text-xs text-amber-400">Follow up: {formatDate(item.followUpDate)}</p>
                  )}
                </div>
                {showMarkComplete && !item.followUpCompleted && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markComplete(item.id)}
                    className="text-[#8FBDA3] hover:bg-[#8FBDA3]/10"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" /> Done
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const untouchedLeads = clinics.filter(
    (c) => c.status === "LEAD" && !recent.some((r) => r.clinic.id === c.id)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#D7D3CD]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Outreach
          </h1>
          <p className="text-sm text-[#B9B6AF] mt-1">Your daily action queue</p>
        </div>
        <div className="flex items-center gap-3">
        <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium border border-[#8FBDA3]/30 text-[#8FBDA3] hover:bg-[#8FBDA3]/10 transition-colors">
            <Mail className="h-4 w-4 mr-2" /> Send Email
          </DialogTrigger>
          <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>Send Email</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <Label className="text-[#B9B6AF]">Clinic</Label>
                <select
                  value={emailForm.clinicId}
                  onChange={(e) => handleClinicChange(e.target.value)}
                  className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm"
                >
                  <option value="">Select clinic...</option>
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.city}, {c.state})</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-[#B9B6AF]">To *</Label>
                {recipientMode === "all" ? (
                  <div className="space-y-2">
                    <div className="bg-[#8FBDA3]/10 border border-[#8FBDA3]/30 rounded-md px-3 py-2">
                      <p className="text-sm text-[#8FBDA3] font-medium">
                        Sending to all {recipients.filter((r) => r.email).length} recipients
                      </p>
                      <div className="mt-1.5 max-h-[100px] overflow-y-auto space-y-0.5">
                        {recipients.filter((r) => r.email).map((r) => (
                          <p key={r.email} className="text-xs text-[#B9B6AF]">
                            {r.label} — {r.email}
                          </p>
                        ))}
                      </div>
                    </div>
                    {sendAllProgress.active && (
                      <div className="space-y-1">
                        <div className="w-full bg-[#363130] rounded-full h-2">
                          <div
                            className="bg-[#8FBDA3] h-2 rounded-full transition-all"
                            style={{ width: `${(sendAllProgress.sent / sendAllProgress.total) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-[#B9B6AF]">
                          {sendAllProgress.sent} of {sendAllProgress.total} sent...
                        </p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setRecipientMode("select")}
                      className="text-xs text-[#8FBDA3] hover:underline"
                    >
                      ← Pick individual recipient instead
                    </button>
                  </div>
                ) : recipients.length > 0 && recipientMode === "select" ? (
                  <div className="space-y-2">
                    <select
                      value={emailForm.to}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setRecipientMode("custom");
                          setEmailForm({ ...emailForm, to: "" });
                        } else if (e.target.value === "__all__") {
                          setRecipientMode("all");
                          setEmailForm({ ...emailForm, to: "" });
                        } else {
                          setEmailForm({ ...emailForm, to: e.target.value });
                        }
                      }}
                      className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm"
                    >
                      <option value="">Select recipient...</option>
                      {recipients.length > 1 && (
                        <option value="__all__">📨 Send to All ({recipients.filter((r) => r.email).length} recipients)</option>
                      )}
                      {recipients.some((r) => r.type === "contact") && (
                        <optgroup label="Clinic Contacts">
                          {recipients.filter((r) => r.type === "contact").map((r) => (
                            <option key={`contact-${r.email}`} value={r.email}>
                              {r.label} — {r.email}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {recipients.some((r) => r.type === "attendee") && (
                        <optgroup label="Past Attendees">
                          {recipients.filter((r) => r.type === "attendee").map((r) => (
                            <option key={`att-${r.email}`} value={r.email}>
                              {r.label} — {r.email}{r.courseName ? ` (${r.courseName})` : ""}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <option value="__custom__">Other (type manually)</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      required
                      type="email"
                      value={emailForm.to}
                      onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                      placeholder="contact@clinic.com"
                      className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                    />
                    {recipients.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setRecipientMode("select")}
                        className="text-xs text-[#8FBDA3] hover:underline"
                      >
                        ← Back to recipient list
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-[#B9B6AF]">Template</Label>
                <select
                  value={emailForm.template}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm"
                >
                  {EMAIL_TEMPLATES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-[#B9B6AF]">Subject *</Label>
                <Input
                  required
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
                />
              </div>
              <div>
                <Label className="text-[#B9B6AF]">Message *</Label>
                <Textarea
                  required
                  rows={8}
                  value={emailForm.body}
                  onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                  className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] max-h-[250px] overflow-y-auto resize-none"
                />
              </div>
              {/* Attachments */}
              <div>
                <Label className="text-[#B9B6AF]">Attachments</Label>
                {selectedMaterials.length > 0 && (
                  <div className="space-y-1.5 mb-2">
                    {selectedMaterials.map((matId) => {
                      const mat = materials.find((m) => m.id === matId);
                      return mat ? (
                        <div key={matId} className="flex items-center justify-between bg-[#363130] rounded-md px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Paperclip className="h-3.5 w-3.5 text-[#8FBDA3] shrink-0" />
                            <span className="text-xs text-[#D7D3CD] truncate">{mat.title}</span>
                            <Badge className="bg-[#8FBDA3]/10 text-[#8FBDA3] border-0 text-[9px] shrink-0">
                              {mat.type.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedMaterials(selectedMaterials.filter((id) => id !== matId))}
                            className="text-[#B9B6AF] hover:text-red-400 ml-2 shrink-0"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
                {attachOpen ? (
                  <div className="bg-[#363130] rounded-md p-3 space-y-2">
                    <p className="text-[10px] tracking-[0.14em] uppercase text-[#B9B6AF]">Select from Materials</p>
                    <div className="max-h-[150px] overflow-y-auto space-y-1">
                      {materials.filter((m) => !selectedMaterials.includes(m.id)).length === 0 ? (
                        <p className="text-xs text-[#B9B6AF] py-2 text-center">No more materials available</p>
                      ) : (
                        materials.filter((m) => !selectedMaterials.includes(m.id)).map((mat) => (
                          <button
                            key={mat.id}
                            type="button"
                            onClick={() => {
                              setSelectedMaterials([...selectedMaterials, mat.id]);
                              setAttachOpen(false);
                            }}
                            className="w-full flex items-center gap-2 text-left px-2 py-1.5 rounded hover:bg-[#2C2828] transition-colors"
                          >
                            <Paperclip className="h-3 w-3 text-[#B9B6AF] shrink-0" />
                            <span className="text-xs text-[#D7D3CD] truncate">{mat.title}</span>
                            {mat.course && (
                              <span className="text-[9px] text-[#B9B6AF] shrink-0">{mat.course.title}</span>
                            )}
                            <Badge className="bg-[#363130] text-[#B9B6AF] border border-[rgba(215,211,205,0.1)] text-[9px] ml-auto shrink-0">
                              {mat.type.replace(/_/g, " ")}
                            </Badge>
                          </button>
                        ))
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachOpen(false)}
                      className="text-xs text-[#B9B6AF] hover:text-[#D7D3CD]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAttachOpen(true)}
                    className="flex items-center gap-1.5 text-xs text-[#8FBDA3] hover:text-[#8FBDA3]/80 mt-1"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    Attach from Materials
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={sending}
                  className="flex-1 bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90"
                >
                  {sending
                    ? (sendAllProgress.active ? `Sending ${sendAllProgress.sent}/${sendAllProgress.total}...` : "Sending...")
                    : (recipientMode === "all" ? `Send to All (${recipients.filter((r) => r.email).length})` : "Send Email")}
                </Button>
              </div>
              <p className="text-xs text-[#B9B6AF] text-center">
                Sends from dr.josephlglenn@gmail.com &middot; Auto-logs as outreach with 7-day follow-up
              </p>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90 transition-colors">
            <Plus className="h-4 w-4 mr-2" /> Log Outreach
          </DialogTrigger>
          <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>Log Outreach</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-[#B9B6AF]">Clinic *</Label>
                <select name="clinicId" required className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm">
                  <option value="">Select clinic...</option>
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.city}, {c.state})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#B9B6AF]">Method</Label>
                  <select name="method" defaultValue="EMAIL" className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm">
                    {["EMAIL", "PHONE", "IN_PERSON", "SOCIAL_MEDIA", "TEXT", "OTHER"].map((m) => (
                      <option key={m} value={m}>{m.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-[#B9B6AF]">Direction</Label>
                  <select name="direction" defaultValue="OUTBOUND" className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm">
                    <option value="OUTBOUND">Outbound</option>
                    <option value="INBOUND">Inbound</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-[#B9B6AF]">Subject</Label>
                <Input name="subject" className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
              </div>
              <div>
                <Label className="text-[#B9B6AF]">Notes</Label>
                <Textarea name="notes" rows={2} className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#B9B6AF]">Outcome</Label>
                  <select name="outcome" defaultValue="NO_RESPONSE" className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm">
                    {["NO_RESPONSE", "INTERESTED", "NOT_INTERESTED", "FOLLOW_UP_NEEDED", "BOOKED", "REFERRED"].map((o) => (
                      <option key={o} value={o}>{o.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-[#B9B6AF]">Follow-up Date</Label>
                  <Input name="followUpDate" type="date" className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]" />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90">
                {loading ? "Saving..." : "Log Outreach"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Overdue */}
      {overdue.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider">
              Overdue Follow-Ups ({overdue.length})
            </h2>
          </div>
          <OutreachList items={overdue} showMarkComplete />
        </div>
      )}

      {/* Today */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-[#8FBDA3]" />
          <h2 className="text-sm font-semibold text-[#8FBDA3] uppercase tracking-wider">
            Today&apos;s Follow-Ups ({today.length})
          </h2>
        </div>
        <OutreachList items={today} showMarkComplete />
      </div>

      {/* Untouched Leads */}
      {untouchedLeads.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <UserX className="h-4 w-4 text-[#B9B6AF]" />
            <h2 className="text-sm font-semibold text-[#B9B6AF] uppercase tracking-wider">
              Untouched Leads ({untouchedLeads.length})
            </h2>
          </div>
          <div className="space-y-2">
            {untouchedLeads.map((clinic) => (
              <Card key={clinic.id} className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#D7D3CD]">{clinic.name}</p>
                    <p className="text-xs text-[#B9B6AF]">{clinic.city}, {clinic.state}</p>
                  </div>
                  <Badge className="bg-[#363130] text-[#B9B6AF] border-0 text-[10px]">Never contacted</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Send className="h-4 w-4 text-[#B9B6AF]" />
          <h2 className="text-sm font-semibold text-[#B9B6AF] uppercase tracking-wider">
            Recent Activity
          </h2>
        </div>
        <OutreachList items={recent.slice(0, 10)} />
      </div>
    </div>
  );
}
