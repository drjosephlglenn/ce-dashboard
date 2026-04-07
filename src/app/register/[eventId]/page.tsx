"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface EventInfo {
  id: string;
  courseTitle: string;
  courseDescription: string;
  ceuHours: number;
  date: string;
  time: string;
  type: string;
  clinicName: string;
  clinicCity: string;
  clinicState: string;
  totalSeats: number;
  seatsRemaining: number;
  isOpen: boolean;
  // Pricing
  standardPrice: number;
  earlyBirdPrice: number;
  currentPrice: number;
  isEarlyBird: boolean;
  earlyBirdDeadline: string;
  daysUntilEvent: number;
}

export default function PublicRegistrationPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    credentials: "",
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/register/${eventId}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setEvent({
          id: data.id,
          courseTitle: data.course.title,
          courseDescription: data.course.description,
          ceuHours: data.course.ceuHours,
          date: data.eventDate,
          time: `${data.startTime} – ${data.endTime}`,
          type: data.type,
          clinicName: data.clinic.name,
          clinicCity: data.clinic.city,
          clinicState: data.clinic.state,
          totalSeats: data.maxAttendees,
          seatsRemaining: data.maxAttendees - data.attendeeCount,
          isOpen: true,
          standardPrice: data.standardPrice,
          earlyBirdPrice: data.earlyBirdPrice,
          currentPrice: data.currentPrice,
          isEarlyBird: data.isEarlyBird,
          earlyBirdDeadline: data.earlyBirdDeadline,
          daysUntilEvent: data.daysUntilEvent,
        });
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/register/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to register");
      setSubmitted(true);
      toast.success("Registration successful!");
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F4F0]">
      {/* Header */}
      <header className="border-b border-[#E5E3DE] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <span
            className="text-xl font-bold text-[#231F20]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            SIDELINE
          </span>
          <span className="text-sm text-[#B9B6AF]">by Joey Glenn</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        {loading ? (
          <div className="text-center text-[#B9B6AF]">Loading event details...</div>
        ) : notFound ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2
              className="mb-2 text-xl font-bold text-[#231F20]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Registration Not Available
            </h2>
            <p className="text-[#B9B6AF]">
              This event is not currently open for registration or does not exist.
            </p>
          </div>
        ) : submitted ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#8FBDA3]/20">
              <svg
                className="h-8 w-8 text-[#8FBDA3]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2
              className="mb-2 text-xl font-bold text-[#231F20]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Registration Confirmed
            </h2>
            <p className="text-[#B9B6AF]">
              You have been registered for {event?.courseTitle}. A confirmation email will be sent
              to {form.email}.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Event Info */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h1
                className="mb-1 text-2xl font-bold text-[#231F20]"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {event!.courseTitle}
              </h1>
              <p className="mb-4 text-[#B9B6AF]">{event!.courseDescription}</p>

              <div className="grid grid-cols-2 gap-4 border-t border-[#E5E3DE] pt-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs font-medium text-[#B9B6AF]">CEU Hours</p>
                  <p className="text-sm font-semibold text-[#231F20]">{event!.ceuHours}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#B9B6AF]">Date</p>
                  <p className="text-sm font-semibold text-[#231F20]">
                    {new Date(event!.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#B9B6AF]">Time</p>
                  <p className="text-sm font-semibold text-[#231F20]">{event!.time}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#B9B6AF]">Location</p>
                  <p className="text-sm font-semibold text-[#231F20]">
                    {event!.clinicName}
                  </p>
                  <p className="text-xs text-[#B9B6AF]">
                    {event!.clinicCity}, {event!.clinicState}
                  </p>
                </div>
              </div>

              {/* Seats */}
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#8FBDA3]/10 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-[#8FBDA3]" />
                <span className="text-sm font-medium text-[#8FBDA3]">
                  {event!.seatsRemaining} of {event!.totalSeats} seats remaining
                </span>
              </div>

              {/* Pricing for Public Events */}
              {event!.type === "PUBLIC" && (
                <div className="mt-4 rounded-lg border border-[#E5E3DE] p-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      {event!.isEarlyBird ? (
                        <>
                          <span className="text-2xl font-bold text-[#231F20]">${event!.earlyBirdPrice}</span>
                          <span className="ml-2 text-sm text-[#B9B6AF] line-through">${event!.standardPrice}</span>
                          <span className="ml-2 inline-block rounded-full bg-[#8FBDA3]/20 px-2 py-0.5 text-xs font-semibold text-[#8FBDA3]">
                            Early Bird
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-[#231F20]">${event!.standardPrice}</span>
                      )}
                      <span className="ml-1 text-sm text-[#B9B6AF]">per person</span>
                    </div>
                  </div>
                  {event!.isEarlyBird && (
                    <p className="mt-2 text-xs text-[#B9B6AF]">
                      Early bird pricing ends {new Date(event!.earlyBirdDeadline).toLocaleDateString()} — save ${event!.standardPrice - event!.earlyBirdPrice}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Registration Form */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2
                className="mb-4 text-lg font-semibold text-[#231F20]"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Register
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-[#B9B6AF]">First Name</label>
                    <input
                      required
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="w-full rounded-md border border-[#E5E3DE] bg-white px-3 py-2 text-sm text-[#231F20] outline-none focus:border-[#8FBDA3]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-[#B9B6AF]">Last Name</label>
                    <input
                      required
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="w-full rounded-md border border-[#E5E3DE] bg-white px-3 py-2 text-sm text-[#231F20] outline-none focus:border-[#8FBDA3]"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[#B9B6AF]">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-md border border-[#E5E3DE] bg-white px-3 py-2 text-sm text-[#231F20] outline-none focus:border-[#8FBDA3]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[#B9B6AF]">Credentials</label>
                  <input
                    value={form.credentials}
                    onChange={(e) => setForm({ ...form, credentials: e.target.value })}
                    placeholder="e.g., DPT, OT, ATC"
                    className="w-full rounded-md border border-[#E5E3DE] bg-white px-3 py-2 text-sm text-[#231F20] outline-none placeholder:text-[#B9B6AF]/50 focus:border-[#8FBDA3]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || event!.seatsRemaining <= 0}
                  className="w-full rounded-lg bg-[#8FBDA3] px-4 py-3 text-sm font-semibold text-[#231F20] hover:bg-[#8FBDA3]/90 transition disabled:opacity-50"
                >
                  {submitting
                    ? "Registering..."
                    : event!.seatsRemaining <= 0
                    ? "Event Full"
                    : "Complete Registration"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
