"use client";

import { useEffect, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  getDay,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface CalEvent {
  id: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  course: { title: string; shortCode: string };
  clinic: { name: string };
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    const from = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const to = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    fetch(`/api/events?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then(setEvents);
  }, [currentMonth]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart); // 0=Sun

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.eventDate), day));

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#D7D3CD]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          Calendar
        </h1>
      </div>

      <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
        <CardContent className="p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="text-[#B9B6AF] hover:text-[#D7D3CD]">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-[#D7D3CD]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="text-[#B9B6AF] hover:text-[#D7D3CD]">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-[10px] tracking-[0.12em] uppercase text-[#B9B6AF] py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} className="h-20" />
            ))}
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const isToday = isSameDay(day, new Date());
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={`h-20 rounded-lg p-2 text-left transition-colors ${
                    isSelected
                      ? "bg-[#8FBDA3]/10 border border-[#8FBDA3]/30"
                      : "hover:bg-[#363130] border border-transparent"
                  }`}
                >
                  <span className={`text-sm ${isToday ? "text-[#8FBDA3] font-bold" : isSameMonth(day, currentMonth) ? "text-[#D7D3CD]" : "text-[#B9B6AF]/40"}`}>
                    {format(day, "d")}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {dayEvents.map((e) => (
                        <div
                          key={e.id}
                          className={`h-1.5 w-1.5 rounded-full ${e.type === "PUBLIC" ? "bg-[#8FBDA3]" : "bg-blue-400"}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Events */}
      {selectedDay && (
        <div>
          <h3 className="text-sm font-medium text-[#D7D3CD] mb-3">
            Events on {formatDate(selectedDay)}
          </h3>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-[#B9B6AF]">No events on this day</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((event) => (
                <Link key={event.id} href={`/courses/events/${event.id}`}>
                  <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)] hover:border-[#8FBDA3]/30 cursor-pointer transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#D7D3CD]">{event.course.title}</p>
                        <p className="text-xs text-[#B9B6AF]">{event.clinic.name} &middot; {event.startTime}–{event.endTime}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`border-0 text-[10px] ${event.type === "PUBLIC" ? "bg-[#8FBDA3]/20 text-[#8FBDA3]" : "bg-blue-500/20 text-blue-400"}`}>
                          {event.type}
                        </Badge>
                        <Badge className="bg-[#363130] text-[#D7D3CD] border-0 text-[10px]">
                          {event.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
