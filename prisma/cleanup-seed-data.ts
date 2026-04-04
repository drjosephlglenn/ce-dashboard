import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // The only real clinic is Movement Orthopedics (imported by Joey)
  const realClinicNames = ["Movement Orthopedics"];

  // Find all fake clinics
  const allClinics = await prisma.clinic.findMany();
  const fakeClinics = allClinics.filter(
    (c) => !realClinicNames.includes(c.name)
  );
  const fakeClinicIds = fakeClinics.map((c) => c.id);

  console.log(`Found ${fakeClinics.length} fake clinics to delete:`);
  fakeClinics.forEach((c) => console.log(`  - ${c.name} (${c.city}, ${c.state})`));

  // Delete in order: attendees -> financial records -> course events -> outreach logs -> contacts -> clinics
  // First get fake course events (linked to fake clinics)
  const fakeEvents = await prisma.courseEvent.findMany({
    where: { clinicId: { in: fakeClinicIds } },
  });
  const fakeEventIds = fakeEvents.map((e) => e.id);
  console.log(`\nFound ${fakeEvents.length} fake course events`);

  // Delete attendees for fake events
  const deletedAttendees = await prisma.attendee.deleteMany({
    where: { courseEventId: { in: fakeEventIds } },
  });
  console.log(`Deleted ${deletedAttendees.count} fake attendees`);

  // Delete financial records for fake events
  const deletedFinancials = await prisma.financialRecord.deleteMany({
    where: { courseEventId: { in: fakeEventIds } },
  });
  console.log(`Deleted ${deletedFinancials.count} fake financial records`);

  // Delete fake course events
  const deletedEvents = await prisma.courseEvent.deleteMany({
    where: { id: { in: fakeEventIds } },
  });
  console.log(`Deleted ${deletedEvents.count} fake course events`);

  // Delete outreach logs for fake clinics
  const deletedOutreach = await prisma.outreachLog.deleteMany({
    where: { clinicId: { in: fakeClinicIds } },
  });
  console.log(`Deleted ${deletedOutreach.count} fake outreach logs`);

  // Delete contacts for fake clinics
  const deletedContacts = await prisma.contact.deleteMany({
    where: { clinicId: { in: fakeClinicIds } },
  });
  console.log(`Deleted ${deletedContacts.count} fake contacts`);

  // Delete fake clinics
  const deletedClinics = await prisma.clinic.deleteMany({
    where: { id: { in: fakeClinicIds } },
  });
  console.log(`Deleted ${deletedClinics.count} fake clinics`);

  // Verify what's left
  const remaining = await prisma.clinic.findMany();
  console.log(`\n✅ Remaining clinics: ${remaining.length}`);
  remaining.forEach((c) => console.log(`  ✓ ${c.name} (${c.city}, ${c.state})`));

  const remainingEvents = await prisma.courseEvent.findMany({ include: { course: true, clinic: true, attendees: true } });
  console.log(`\nRemaining events: ${remainingEvents.length}`);
  remainingEvents.forEach((e) => console.log(`  ✓ ${e.course.shortCode} at ${e.clinic.name} (${e.eventDate.toLocaleDateString()}) — ${e.attendees.length} attendees`));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
