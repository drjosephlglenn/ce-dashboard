"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  credentials: string | null;
  notes: string | null;
  isPrimaryContact: boolean;
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
  address: string;
  city: string;
  state: string;
  zip: string;
  region: string;
  status: string;
  type: string | null;
  source: string | null;
  phone: string | null;
  website: string | null;
  estimatedSize: number | null;
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

const CLINIC_TYPES = [
  "PRIVATE_PRACTICE",
  "HOSPITAL_SYSTEM",
  "OUTPATIENT",
  "SNF",
  "OTHER",
];

const CLINIC_SOURCES = [
  "EXISTING_NETWORK",
  "REFERRAL",
  "COLD_OUTREACH",
  "CONFERENCE",
  "INBOUND",
  "OTHER",
];

const CONTACT_ROLES = [
  "OWNER",
  "CLINIC_DIRECTOR",
  "EDUCATION_COORD",
  "MANAGER",
  "CLINICIAN",
  "OTHER",
];

export default function ClinicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [financials, setFinancials] = useState<ClinicFinancial[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });

  // Edit clinic dialog state
  const [editClinicOpen, setEditClinicOpen] = useState(false);
  const [editClinicForm, setEditClinicForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    website: "",
    type: "",
    source: "",
    estimatedSize: "",
    notes: "",
    region: "",
  });

  // Delete clinic dialog state
  const [deleteClinicOpen, setDeleteClinicOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit contact dialog state
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editContactForm, setEditContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    credentials: "",
    notes: "",
    isPrimaryContact: false,
  });

  // Delete contact dialog state
  const [deleteContactOpen, setDeleteContactOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

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

  // Populate edit clinic form when opening dialog
  function openEditClinic() {
    if (!clinic) return;
    setEditClinicForm({
      name: clinic.name,
      address: clinic.address || "",
      city: clinic.city,
      state: clinic.state,
      zip: clinic.zip || "",
      phone: clinic.phone || "",
      website: clinic.website || "",
      type: clinic.type || "",
      source: clinic.source || "",
      estimatedSize: clinic.estimatedSize != null ? String(clinic.estimatedSize) : "",
      notes: clinic.notes || "",
      region: clinic.region || "",
    });
    setEditClinicOpen(true);
  }

  async function handleEditClinic(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload: Record<string, unknown> = {
        name: editClinicForm.name,
        address: editClinicForm.address,
        city: editClinicForm.city,
        state: editClinicForm.state,
        zip: editClinicForm.zip,
        phone: editClinicForm.phone,
        website: editClinicForm.website || null,
        type: editClinicForm.type || null,
        source: editClinicForm.source || null,
        estimatedSize: editClinicForm.estimatedSize ? parseInt(editClinicForm.estimatedSize) : null,
        notes: editClinicForm.notes,
        region: editClinicForm.region,
      };

      const res = await fetch(`/api/clinics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update clinic");

      toast.success("Clinic updated");
      setEditClinicOpen(false);
      fetchClinic();
    } catch (error) {
      console.error("Failed to update clinic:", error);
      toast.error("Failed to update clinic");
    }
  }

  async function handleDeleteClinic() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/clinics/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete clinic");
      toast.success("Clinic deleted");
      router.push("/clinics");
    } catch (error) {
      console.error("Failed to delete clinic:", error);
      toast.error("Failed to delete clinic");
      setDeleting(false);
    }
  }

  function openEditContact(contact: Contact) {
    setEditingContact(contact);
    setEditContactForm({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email || "",
      phone: contact.phone || "",
      role: contact.role || "",
      credentials: contact.credentials || "",
      notes: contact.notes || "",
      isPrimaryContact: contact.isPrimaryContact,
    });
    setEditContactOpen(true);
  }

  async function handleEditContact(e: React.FormEvent) {
    e.preventDefault();
    if (!editingContact) return;
    try {
      const res = await fetch(`/api/contacts/${editingContact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: editContactForm.firstName,
          lastName: editContactForm.lastName,
          email: editContactForm.email,
          phone: editContactForm.phone || null,
          role: editContactForm.role || null,
          credentials: editContactForm.credentials || null,
          notes: editContactForm.notes,
          isPrimaryContact: editContactForm.isPrimaryContact,
        }),
      });

      if (!res.ok) throw new Error("Failed to update contact");

      toast.success("Contact updated");
      setEditContactOpen(false);
      setEditingContact(null);
      fetchClinic();
    } catch (error) {
      console.error("Failed to update contact:", error);
      toast.error("Failed to update contact");
    }
  }

  function openDeleteContact(contact: Contact) {
    setDeletingContact(contact);
    setDeleteContactOpen(true);
  }

  async function handleDeleteContact() {
    if (!deletingContact) return;
    try {
      const res = await fetch(`/api/contacts/${deletingContact.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete contact");
      toast.success("Contact deleted");
      setDeleteContactOpen(false);
      setDeletingContact(null);
      fetchClinic();
    } catch (error) {
      console.error("Failed to delete contact:", error);
      toast.error("Failed to delete contact");
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
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white">{clinic.name}</h1>
              <p className="text-gray-400">
                {clinic.city}, {clinic.state}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openEditClinic}
              className="border-gray-700 text-[#D7D3CD] hover:bg-[#8FBDA3]/10 hover:text-[#8FBDA3]"
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit Clinic
            </Button>
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
                    {contact.isPrimaryContact && (
                      <Badge className="ml-2 bg-[#8FBDA3]/15 text-[#8FBDA3] border-0 text-[10px]">
                        Primary
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">
                    {[contact.role, contact.email, contact.phone]
                      .filter(Boolean)
                      .join(" | ")}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditContact(contact)}
                    className="h-7 w-7 text-[#D7D3CD] hover:text-[#8FBDA3] hover:bg-[#8FBDA3]/10"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteContact(contact)}
                    className="h-7 w-7 text-[#D7D3CD] hover:text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
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

      <Separator className="bg-gray-800" />

      {/* Danger Zone */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
        <div className="border border-red-400/20 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-white font-medium">Delete this clinic</p>
            <p className="text-xs text-gray-400">
              Permanently remove this clinic and all associated data.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteClinicOpen(true)}
            className="border-red-400/30 text-red-400 hover:bg-red-400/10 hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete Clinic
          </Button>
        </div>
      </section>

      {/* ── Edit Clinic Dialog ── */}
      <Dialog open={editClinicOpen} onOpenChange={setEditClinicOpen}>
        <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Clinic</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditClinic} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs text-[#B9B6AF]">Name</Label>
              <Input
                value={editClinicForm.name}
                onChange={(e) => setEditClinicForm({ ...editClinicForm, name: e.target.value })}
                required
                className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[#B9B6AF]">Address</Label>
              <Input
                value={editClinicForm.address}
                onChange={(e) => setEditClinicForm({ ...editClinicForm, address: e.target.value })}
                className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-[#B9B6AF]">City</Label>
                <Input
                  value={editClinicForm.city}
                  onChange={(e) => setEditClinicForm({ ...editClinicForm, city: e.target.value })}
                  required
                  className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#B9B6AF]">State</Label>
                <Input
                  value={editClinicForm.state}
                  onChange={(e) => setEditClinicForm({ ...editClinicForm, state: e.target.value })}
                  required
                  className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#B9B6AF]">Zip</Label>
                <Input
                  value={editClinicForm.zip}
                  onChange={(e) => setEditClinicForm({ ...editClinicForm, zip: e.target.value })}
                  className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-[#B9B6AF]">Phone</Label>
                <Input
                  value={editClinicForm.phone}
                  onChange={(e) => setEditClinicForm({ ...editClinicForm, phone: e.target.value })}
                  className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#B9B6AF]">Website</Label>
                <Input
                  value={editClinicForm.website}
                  onChange={(e) => setEditClinicForm({ ...editClinicForm, website: e.target.value })}
                  className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-[#B9B6AF]">Type</Label>
                <select
                  value={editClinicForm.type}
                  onChange={(e) => setEditClinicForm({ ...editClinicForm, type: e.target.value })}
                  className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm"
                >
                  <option value="">Select type...</option>
                  {CLINIC_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#B9B6AF]">Source</Label>
                <select
                  value={editClinicForm.source}
                  onChange={(e) => setEditClinicForm({ ...editClinicForm, source: e.target.value })}
                  className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm"
                >
                  <option value="">Select source...</option>
                  {CLINIC_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-[#B9B6AF]">Estimated Size</Label>
                <Input
                  type="number"
                  value={editClinicForm.estimatedSize}
                  onChange={(e) => setEditClinicForm({ ...editClinicForm, estimatedSize: e.target.value })}
                  className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#B9B6AF]">Region</Label>
                <Input
                  value={editClinicForm.region}
                  onChange={(e) => setEditClinicForm({ ...editClinicForm, region: e.target.value })}
                  className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[#B9B6AF]">Notes</Label>
              <Textarea
                value={editClinicForm.notes}
                onChange={(e) => setEditClinicForm({ ...editClinicForm, notes: e.target.value })}
                rows={3}
                className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditClinicOpen(false)}
                className="border-gray-700 text-[#D7D3CD]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-[#8FBDA3] hover:bg-[#8FBDA3]/80 text-black"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Clinic Dialog ── */}
      <Dialog open={deleteClinicOpen} onOpenChange={setDeleteClinicOpen}>
        <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete Clinic</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#B9B6AF]">
            Are you sure you want to delete <span className="font-semibold text-white">{clinic.name}</span>?
            This will also delete all associated contacts, outreach logs, and event links.
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteClinicOpen(false)}
              className="border-gray-700 text-[#D7D3CD]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={deleting}
              onClick={handleDeleteClinic}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit Contact Dialog ── */}
      <Dialog open={editContactOpen} onOpenChange={(open) => { setEditContactOpen(open); if (!open) setEditingContact(null); }}>
        <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditContact} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-[#B9B6AF]">First Name</Label>
                <Input
                  value={editContactForm.firstName}
                  onChange={(e) => setEditContactForm({ ...editContactForm, firstName: e.target.value })}
                  required
                  className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#B9B6AF]">Last Name</Label>
                <Input
                  value={editContactForm.lastName}
                  onChange={(e) => setEditContactForm({ ...editContactForm, lastName: e.target.value })}
                  required
                  className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-[#B9B6AF]">Email</Label>
                <Input
                  type="email"
                  value={editContactForm.email}
                  onChange={(e) => setEditContactForm({ ...editContactForm, email: e.target.value })}
                  className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#B9B6AF]">Phone</Label>
                <Input
                  value={editContactForm.phone}
                  onChange={(e) => setEditContactForm({ ...editContactForm, phone: e.target.value })}
                  className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-[#B9B6AF]">Role</Label>
                <select
                  value={editContactForm.role}
                  onChange={(e) => setEditContactForm({ ...editContactForm, role: e.target.value })}
                  className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm"
                >
                  <option value="">Select role...</option>
                  {CONTACT_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#B9B6AF]">Credentials</Label>
                <Input
                  value={editContactForm.credentials}
                  onChange={(e) => setEditContactForm({ ...editContactForm, credentials: e.target.value })}
                  placeholder="e.g., DPT, ATC"
                  className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[#B9B6AF]">Notes</Label>
              <Textarea
                value={editContactForm.notes}
                onChange={(e) => setEditContactForm({ ...editContactForm, notes: e.target.value })}
                rows={2}
                className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrimaryContact"
                checked={editContactForm.isPrimaryContact}
                onChange={(e) => setEditContactForm({ ...editContactForm, isPrimaryContact: e.target.checked })}
                className="rounded border-gray-700 bg-[#363130] text-[#8FBDA3]"
              />
              <Label htmlFor="isPrimaryContact" className="text-xs text-[#B9B6AF] cursor-pointer">
                Primary contact
              </Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => { setEditContactOpen(false); setEditingContact(null); }}
                className="border-gray-700 text-[#D7D3CD]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-[#8FBDA3] hover:bg-[#8FBDA3]/80 text-black"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Contact Dialog ── */}
      <Dialog open={deleteContactOpen} onOpenChange={(open) => { setDeleteContactOpen(open); if (!open) setDeletingContact(null); }}>
        <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete Contact</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#B9B6AF]">
            Delete this contact? This action cannot be undone.
          </p>
          {deletingContact && (
            <p className="text-sm text-white font-medium">
              {deletingContact.firstName} {deletingContact.lastName}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setDeleteContactOpen(false); setDeletingContact(null); }}
              className="border-gray-700 text-[#D7D3CD]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDeleteContact}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
