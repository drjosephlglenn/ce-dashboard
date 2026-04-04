import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

interface ImportRow {
  firstName: string;
  lastName: string;
  email?: string;
  credentials?: string;
  clinicName?: string;
  clinicCity?: string;
  clinicState?: string;
  registrationType?: "PAID" | "FREE_HOST_SEAT" | "COMP";
  amountPaid?: number;
}

interface CreateEventInfo {
  courseId: string;
  eventDate: string;
  clinicName: string;
  clinicCity: string;
  clinicState: string;
}

interface ImportBody {
  rows: ImportRow[];
  courseEventId?: string;
  createEvent?: CreateEventInfo;
  createMissingClinics?: boolean;
}

export async function POST(req: Request) {
  try {
    const body: ImportBody = await req.json();
    const { rows, createMissingClinics = false } = body;
    let { courseEventId } = body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "No rows provided" },
        { status: 400 }
      );
    }

    let eventCreated = false;

    // If createEvent is provided, find-or-create the clinic and create the event
    if (body.createEvent && !courseEventId) {
      const { courseId, eventDate, clinicName, clinicCity, clinicState } =
        body.createEvent;

      if (!courseId || !eventDate || !clinicName || !clinicCity || !clinicState) {
        return NextResponse.json(
          { error: "Course, date, and clinic info are required for new events" },
          { status: 400 }
        );
      }

      // Find or create the host clinic
      let hostClinic = await prisma.clinic.findFirst({
        where: {
          name: { equals: clinicName, mode: "insensitive" },
          city: { equals: clinicCity, mode: "insensitive" },
          state: { equals: clinicState, mode: "insensitive" },
        },
      });

      if (!hostClinic) {
        hostClinic = await prisma.clinic.create({
          data: {
            name: clinicName,
            city: clinicCity,
            state: clinicState,
            status: "ACTIVE",
            source: "EXISTING_NETWORK",
          },
        });
      }

      // Create the course event
      const newEvent = await prisma.courseEvent.create({
        data: {
          courseId,
          clinicId: hostClinic.id,
          eventDate: new Date(eventDate),
          status: "COMPLETED",
          type: "PRIVATE",
        },
      });

      courseEventId = newEvent.id;
      eventCreated = true;
    }

    if (!courseEventId) {
      return NextResponse.json(
        { error: "courseEventId or createEvent info is required" },
        { status: 400 }
      );
    }

    let imported = 0;
    let skipped = 0;
    const clinicsCreated: string[] = [];
    const errors: string[] = [];

    // Cache clinic lookups to avoid repeated queries
    const clinicCache = new Map<string, string | null>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowLabel = `Row ${i + 1} (${row.firstName} ${row.lastName})`;

      try {
        if (!row.firstName || !row.lastName) {
          errors.push(`${rowLabel}: Missing first or last name`);
          skipped++;
          continue;
        }

        // Check for duplicates within the same courseEvent
        const existing = await prisma.attendee.findFirst({
          where: {
            courseEventId,
            firstName: { equals: row.firstName, mode: "insensitive" },
            lastName: { equals: row.lastName, mode: "insensitive" },
            email: { equals: row.email || "", mode: "insensitive" },
          },
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Resolve clinic
        let clinicId: string | undefined;

        if (row.clinicName && row.clinicCity && row.clinicState) {
          const cacheKey =
            `${row.clinicName}|${row.clinicCity}|${row.clinicState}`.toLowerCase();

          if (clinicCache.has(cacheKey)) {
            clinicId = clinicCache.get(cacheKey) || undefined;
          } else {
            const clinic = await prisma.clinic.findFirst({
              where: {
                name: { equals: row.clinicName, mode: "insensitive" },
                city: { equals: row.clinicCity, mode: "insensitive" },
                state: { equals: row.clinicState, mode: "insensitive" },
              },
            });

            if (clinic) {
              clinicId = clinic.id;
              clinicCache.set(cacheKey, clinic.id);
            } else if (createMissingClinics) {
              const newClinic = await prisma.clinic.create({
                data: {
                  name: row.clinicName,
                  city: row.clinicCity,
                  state: row.clinicState,
                  status: "ACTIVE",
                  source: "EXISTING_NETWORK",
                },
              });
              clinicId = newClinic.id;
              clinicCache.set(cacheKey, newClinic.id);
              clinicsCreated.push(
                `${row.clinicName} (${row.clinicCity}, ${row.clinicState})`
              );
            } else {
              clinicCache.set(cacheKey, null);
            }
          }
        }

        await prisma.attendee.create({
          data: {
            courseEventId,
            firstName: row.firstName.trim(),
            lastName: row.lastName.trim(),
            email: row.email?.trim() || "",
            credentials: row.credentials?.trim() || "",
            clinicId: clinicId || null,
            registrationType: row.registrationType || "PAID",
            amountPaid: row.amountPaid ?? 0,
          },
        });

        imported++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${rowLabel}: ${message}`);
        skipped++;
      }
    }

    // Update attendee count on the course event
    if (courseEventId && imported > 0) {
      const count = await prisma.attendee.count({
        where: { courseEventId },
      });
      await prisma.courseEvent.update({
        where: { id: courseEventId },
        data: { attendeeCount: count },
      });
    }

    return NextResponse.json({
      imported,
      skipped,
      clinicsCreated,
      errors,
      eventCreated,
      eventId: courseEventId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Import failed: ${message}` },
      { status: 500 }
    );
  }
}
