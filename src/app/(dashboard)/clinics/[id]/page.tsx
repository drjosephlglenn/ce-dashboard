"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: string | null;
}

interface OutreachLog {
  id: string;
  date: string;
  type: string;
  notes: string | null;
  contact: Contact | null;
}

interface Attendee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  credentials: string;
  ceuCertificateIssued: boolean;
}

interface CourseEvent {
  id: string;
  eventDate: string;
  status: string;
  attendeeCount: number;
  course: {
    id: string;
    title: string;
    shortCode: string;
  };
  attendees: Attendee[];
}

interface ClinicFinancial {
  id: string;
  type: string;
  amount: string;
  date: string;
  description: string;
  paymentMethod: string;
  courseEvent?: { course: { title: string }; eventDate: string } | null;
}

interface Clinic {
  id: string;
  name: string;
  city: string;
  state: string;
  status: string;
  type: string | null;
  source: string | null;
  phone: string | null;
  website: string | null;
  estimatedSize: string | null;
  notes: string | null;
  tags: string[];
  contacts: Contact[];
  courseEvents: CourseEvent[];
  outreachLogs: OutreachLog[];
}

const STATUSES = [
  "LEAD",
  "CONTACTED",
  "INTERESTED",
  "BOOKED",
  "ACTIVE",
  "CHURNED",
];

export default function ClinicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [financials, setFinancials] = useState<ClinicFinancial[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });

  const fetchClinic = useCallback(async () => {
    try {
      const [clinicRes, finRes] = await Promise.all([
        fetch(`/api/clinics/${id}`),
        fetch(`/api/finances?clinicId=${id}`),
      ]);
      if (!clinicRes.ok) throw new Error("Not found");
      setClinic(await clinicRes.json());
      if (finRes.ok) setFinancials(await finRes.json());
    } catch (error) {
      console.error("Failed to fetch clinic:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchClinic();
  }, [id, fetchClinic]);

  async function handleStatusChange(status: string | null) {
    if (!status) return;
    try {
      await fetch(`/api/clinics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchClinic();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  }

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contactForm, clinicId: id }),
      });

      if (!res.ok) throw new Error("Failed to add contact");

      setContactForm({ firstName: "", lastName: "", email: "", role: "" });
      fetchClinic();
    } catch (error) {
      console.error("Failed to add contact:", error);
    }
  }

  if (loading) {
    return <p className="text-gray-400">Loading...</p>;
  }

  if (!clinic) {
    return <p className="text-gray-400">Clinic not found.</p>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Overview */}
      <section className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{clinic.name}</h1>
            <p className="text-gray-400">
              {clinic.city}, {clinic.state}
            </p>
          </div>
          <Select value={clinic.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[160px] bg-[#2C2828] border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4 text-sm text-gray-400">
          {clinic.source && <span>Source: {clinic.source}</span>}
          {clinic.type && <span>Type: {clinic.type}</span>}
          {clinic.phone && <span>Phone: {clinic.phone}</span>}
          {clinic.website && <span>Web: {clinic.website}</span>}
          {clinic.estimatedSize && <span>Size: {clinic.estimatedSize}</span>}
        </div>

        {clinic.tags.length > 0 && (
          <div className="flex gap-2">
            {clinic.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {clinic.notes && (
          <div className="bg-[#2C2828] rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Notes</h3>
            <p className="text-sm text-white whitespace-pre-wrap">
              {clinic.notes}
            </p>
          </div>
        )}
      </section>

      <Separator className="bg-gray-800" />

      {/* Contacts */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Contacts</h2>

        {clinic.contacts.length > 0 ? (
          <div className="space-y-2">
            {clinic.contacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-[#2C2828] rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-white font-medium">
                    {contact.firstName} {contact.lastName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {[contact.role, contact.email, contact.phone]
                      .filter(Boolean)
                      .join(" | ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No contacts yet.</p>
        )}

        <form
          onSubmit={handleAddContact}
          className="grid grid-cols-2 gap-3 bg-[#1E1B1B] rounded-lg p-4"
        >
          <div className="space-y-1">
            <Label className="text-xs">First Name</Label>
            <Input
              value={contactForm.firstName}
              onChange={(e) =>
                setContactForm({ ...contactForm, firstName: e.target.value })
              }
              required
              className="bg-[#2C2828] border-gray-700 text-white text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Last Name</Label>
            <Input
              value={contactForm.lastName}
              onChange={(e) =>
                setContactForm({ ...contactForm, lastName: e.target.value })
              }
              required
              className="bg-[#2C2828] border-gray-700 text-white text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Email</Label>
            <Input
              type="email"
              value={contactForm.email}
              onChange={(e) =>
                setContactForm({ ...contactForm, email: e.target.value })
              }
              className="bg-[#2C2828] border-gray-700 text-white text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Role</Label>
            <Input
              value={contactForm.role}
              onChange={(e) =>
                setContactForm({ ...contactForm, role: e.target.value })
              }
              placeholder="e.g., Owner, AT, Admin"
              className="bg-[#2C2828] border-gray-700 text-white text-sm"
            />
          </div>
          <div className="col-span-2">
            <Button
              type="submit"
              size="sm"
              className="bg-[#8FBDA3] hover:bg-[#8FBDA3]/80 text-black"
            >
              Add Contact
            </Button>
          </div>
        </form>
      </section>

      <Separator className="bg-gray-800" />

      {/* Course History + Attendees */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Course History</h2>
        {clinic.courseEvents.length > 0 ? (
          <div className="space-y-4">
            {clinic.courseEvents.map((event) => (
              <div
                key={event.id}
                className="bg-[#2C2828] rounded-lg overflow-hidden"
              >
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white font-medium">
                      {event.course.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(event.eventDate).toLocaleDateString()} · {event.attendees.length} attendees
                    </p>
                  </div>
                  <Badge variant="secondary">{event.status}</Badge>
                </div>

                {event.attendees.length > 0 && (
                  <div className="border-t border-[rgba(215,211,205,0.07)] px-4 py-3">
                    <p className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF] mb-2">
                      Roster
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                      {event.attendees.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center justify-between bg-[#231F20] rounded-md px-3 py-2"
                        >
                          <div className="min-w-0">
                            <span className="text-sm text-[#D7D3CD]">
                              {att.firstName} {att.lastName}
                            </span>
                            {att.credentials && (
                              <span className="text-xs text-[#8FBDA3] ml-1.5">
                                {att.credentials}
                              </span>
                            )}
                            {att.email && (
                              <p className="text-[11px] text-[#B9B6AF]/60 truncate">
                                {att.email}
                              </p>
                            )}
                          </div>
                          {att.ceuCertificateIssued && (
                            <Badge className="bg-[#8FBDA3]/15 text-[#8FBDA3] border-0 text-[10px] shrink-0">
                              CEU Issued
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No course events yet.</p>
        )}
      </section>

      {/* Financials */}
      {financials.length > 0 && (
        <>
          <Separator className="bg-gray-800" />
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Financials</h2>
            <div className="space-y-2">
              {financials.map((fin) => (
                <div key={fin.id} className="bg-[#2C2828] rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white font-medium">
                      {fin.description || fin.type.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(fin.date).toLocaleDateString()} · {fin.paymentMethod.replace(/_/g, " ")}
                      {fin.courseEvent && ` · ${fin.courseEvent.course.title}`}
                    </p>
                  </div>
                  <p className={`text-sm font-medium ${Number(fin.amount) >= 0 ? "text-[#8FBDA3]" : "text-red-400"}`}>
                    {Number(fin.amount) >= 0 ? "+" : ""}{formatCurrency(fin.amount)}
                  </p>
                </div>
              ))}
            </div>
            <div className="bg-[#2C2828] rounded-lg p-3 flex items-center justify-between">
              <p className="text-sm text-gray-400 font-medium">Total Revenue from this Clinic</p>
              <p className="text-sm font-bold text-[#8FBDA3]">
                {formatCurrency(financials.reduce((sum, f) => sum + Number(f.amount), 0))}
              </p>
            </div>
          </section>
        </>
      )}

      <Separator className="bg-gray-800" />

      {/* Outreach History */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Outreach History</h2>
        {clinic.outreachLogs.length > 0 ? (
          <div className="space-y-2">
            {clinic.outreachLogs.map((log) => (
              <div key={log.id} className="bg-[#2C2828] rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs">
                    {log.type}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(log.date).toLocaleDateString()}
                  </span>
                </div>
                {log.contact && (
                  <p className="text-xs text-gray-400">
                    Contact: {log.contact.firstName} {log.contact.lastName}
                  </p>
                )}
                {log.notes && (
                  <p className="text-sm text-gray-300 mt-1">{log.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No outreach logs yet.</p>
        )}
      </section>
    </div>
  );
}
