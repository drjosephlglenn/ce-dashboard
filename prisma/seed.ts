import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { stateRequirements } from "./state-requirements-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding SIDELINE CE Dashboard...\n");

  // ─── COURSES ───
  const aclBfr = await prisma.course.upsert({
    where: { shortCode: "ACL-BFR" },
    update: {},
    create: {
      title: "ACL+BFR Mastery: From Rehab to Return",
      shortCode: "ACL-BFR",
      description:
        "A complete system for integrating Blood Flow Restriction and progressing ACL athletes from early recovery to full performance. Covers BFR science, safe implementation across recovery stages, strength preservation, muscle hypertrophy during restricted loading, progression strategies, and real-world protocols with case examples.",
      ceuHours: 8,
      targetAudience: "PTs, PTAs, ATCs, Sports Rehab Professionals",
      format: "LIVE_PRIVATE",
      maxAttendees: 30,
      defaultPrice: 10000,
      isActive: true,
      version: "v1.0",
    },
  });
  console.log("✓ Course: ACL+BFR Mastery");

  const sc = await prisma.course.upsert({
    where: { shortCode: "S-AND-C" },
    update: {},
    create: {
      title: "Strength + Conditioning for Physical Therapists",
      shortCode: "S-AND-C",
      description:
        "Practical strength and conditioning principles adapted for clinical settings. Learn to train high-level athletes beyond basic rehabilitation — designing programs, load management, periodization, and using gym-based tools like barbells, plyometrics, and isometrics.",
      ceuHours: 8,
      targetAudience: "PTs, PTAs, ATCs, S&C Coaches",
      format: "LIVE_PRIVATE",
      maxAttendees: 30,
      defaultPrice: 10000,
      isActive: true,
      version: "v1.0",
    },
  });
  console.log("✓ Course: Strength + Conditioning for PTs");

  const fp = await prisma.course.upsert({
    where: { shortCode: "FORCE-PLATES" },
    update: {},
    create: {
      title: "Force Plates + Data in the Clinic",
      shortCode: "FORCE-PLATES",
      description:
        "Using force plate testing and objective data to guide rehabilitation decisions and confidently clear athletes for return to sport. Covers measurement protocols for jumps, isometrics, and change-of-direction, translating data into training decisions, and communicating readiness metrics.",
      ceuHours: 4,
      targetAudience: "PTs, PTAs, ATCs, Sports Medicine Professionals",
      format: "LIVE_PRIVATE",
      maxAttendees: 25,
      defaultPrice: 6000,
      isActive: true,
      version: "v1.0",
    },
  });
  console.log("✓ Course: Force Plates + Data");

  // ─── SAMPLE CLINICS (different pipeline stages for demo) ───
  const clinics = [
    {
      name: "Peak Performance Physical Therapy",
      city: "Nashville",
      state: "TN",
      type: "PRIVATE_PRACTICE" as const,
      status: "ACTIVE" as const,
      source: "EXISTING_NETWORK" as const,
      region: "Southeast",
      phone: "(615) 555-0101",
      estimatedSize: 12,
      tags: ["BFR-interested", "S&C-interested"],
    },
    {
      name: "Vanderbilt Sports Medicine",
      city: "Nashville",
      state: "TN",
      type: "HOSPITAL_SYSTEM" as const,
      status: "INTERESTED" as const,
      source: "EXISTING_NETWORK" as const,
      region: "Southeast",
      phone: "(615) 555-0202",
      estimatedSize: 45,
      tags: ["BFR-interested", "force-plates"],
    },
    {
      name: "Elite Rehab & Sports Therapy",
      city: "Atlanta",
      state: "GA",
      type: "PRIVATE_PRACTICE" as const,
      status: "BOOKED" as const,
      source: "REFERRAL" as const,
      region: "Southeast",
      phone: "(404) 555-0303",
      estimatedSize: 8,
      tags: ["S&C-interested"],
    },
    {
      name: "Midwest Ortho & PT",
      city: "Chicago",
      state: "IL",
      type: "OUTPATIENT" as const,
      status: "CONTACTED" as const,
      source: "COLD_OUTREACH" as const,
      region: "Midwest",
      phone: "(312) 555-0404",
      estimatedSize: 20,
      tags: ["BFR-interested"],
    },
    {
      name: "Texas Sports Rehab",
      city: "Dallas",
      state: "TX",
      type: "PRIVATE_PRACTICE" as const,
      status: "LEAD" as const,
      source: "CONFERENCE" as const,
      region: "South",
      phone: "(214) 555-0505",
      estimatedSize: 15,
      tags: ["S&C-interested", "force-plates"],
    },
    {
      name: "Front Range PT",
      city: "Denver",
      state: "CO",
      type: "PRIVATE_PRACTICE" as const,
      status: "LEAD" as const,
      source: "INBOUND" as const,
      region: "Mountain West",
      phone: "(303) 555-0606",
      estimatedSize: 6,
      tags: ["BFR-interested"],
    },
    {
      name: "Carolina Sports & Spine",
      city: "Charlotte",
      state: "NC",
      type: "PRIVATE_PRACTICE" as const,
      status: "ACTIVE" as const,
      source: "EXISTING_NETWORK" as const,
      region: "Southeast",
      phone: "(704) 555-0707",
      estimatedSize: 10,
      lifetimeRevenue: 10000,
      tags: ["BFR-interested", "S&C-interested"],
    },
    {
      name: "Bay Area Performance Health",
      city: "San Francisco",
      state: "CA",
      type: "PRIVATE_PRACTICE" as const,
      status: "INTERESTED" as const,
      source: "REFERRAL" as const,
      region: "West",
      phone: "(415) 555-0808",
      estimatedSize: 18,
      tags: ["force-plates", "S&C-interested"],
    },
  ];

  for (const clinic of clinics) {
    await prisma.clinic.create({ data: clinic });
  }
  console.log(`✓ ${clinics.length} sample clinics added`);

  // ─── SAMPLE CONTACTS ───
  const allClinics = await prisma.clinic.findMany();
  for (const clinic of allClinics.slice(0, 4)) {
    await prisma.contact.create({
      data: {
        clinicId: clinic.id,
        firstName: "Sarah",
        lastName: "Johnson",
        email: `contact@${clinic.name.toLowerCase().replace(/\s+/g, "")}.com`,
        role: "EDUCATION_COORD",
        isPrimaryContact: true,
        credentials: "PT, DPT",
      },
    });
  }
  console.log("✓ Sample contacts added");

  // ─── PRE-BUILT EMAIL SEQUENCES ───
  await prisma.emailSequence.create({
    data: {
      name: "New Lead Intro",
      trigger: "NEW_LEAD",
      steps: JSON.stringify([
        { dayOffset: 0, templateName: "intro_email", subject: "Continuing Education Opportunities for Your Team" },
        { dayOffset: 7, templateName: "follow_up", subject: "Following up — CE courses for {{clinic_name}}" },
        { dayOffset: 14, templateName: "phone_call", subject: "Phone call scheduled" },
        { dayOffset: 21, templateName: "final_email", subject: "One more thought for {{clinic_name}}" },
      ]),
    },
  });

  await prisma.emailSequence.create({
    data: {
      name: "Post-Course Follow-Up",
      trigger: "POST_COURSE",
      steps: JSON.stringify([
        { dayOffset: 2, templateName: "thank_you", subject: "Thank you + CEU Certificates" },
        { dayOffset: 7, templateName: "survey", subject: "Quick feedback on your course experience" },
        { dayOffset: 14, templateName: "rebooking", subject: "Ready to level up? Next year's courses" },
      ]),
    },
  });

  await prisma.emailSequence.create({
    data: {
      name: "Annual Rebooking",
      trigger: "ANNUAL_REBOOKING",
      steps: JSON.stringify([
        { dayOffset: 0, templateName: "course_menu", subject: "2026-2027 Course Menu for {{clinic_name}}" },
        { dayOffset: 7, templateName: "follow_up_call", subject: "Follow-up call to discuss courses" },
        { dayOffset: 21, templateName: "early_bird", subject: "Early-bird deadline approaching" },
      ]),
    },
  });

  await prisma.emailSequence.create({
    data: {
      name: "Re-Engagement (Churned)",
      trigger: "RE_ENGAGEMENT",
      steps: JSON.stringify([
        { dayOffset: 0, templateName: "check_in", subject: "Checking in — new courses from SIDELINE" },
        { dayOffset: 30, templateName: "new_course", subject: "New: Force Plates + Data course now available" },
        { dayOffset: 60, templateName: "special_offer", subject: "Special offer for returning clinics" },
      ]),
    },
  });

  console.log("✓ 4 email sequences created");

  // ─── STATE CEU REQUIREMENTS (50 states + DC) ───
  for (const state of stateRequirements) {
    await prisma.stateRequirement.upsert({
      where: { stateCode: state.stateCode },
      update: {
        stateName: state.stateName,
        boardName: state.boardName,
        boardUrl: state.boardUrl,
        requiresPreApproval: state.requiresPreApproval,
        acceptsOtherStates: state.acceptsOtherStates,
        acceptedBodies: state.acceptedBodies,
        ceuRequiredPerCycle: state.ceuRequiredPerCycle,
        renewalCycleYears: state.renewalCycleYears,
        notes: state.notes,
      },
      create: {
        stateCode: state.stateCode,
        stateName: state.stateName,
        boardName: state.boardName,
        boardUrl: state.boardUrl,
        requiresPreApproval: state.requiresPreApproval,
        acceptsOtherStates: state.acceptsOtherStates,
        acceptedBodies: state.acceptedBodies,
        ceuRequiredPerCycle: state.ceuRequiredPerCycle,
        renewalCycleYears: state.renewalCycleYears,
        notes: state.notes,
      },
    });
  }
  console.log(`✓ ${stateRequirements.length} state CEU requirements seeded`);

  console.log("\n✅ Seed complete! Your dashboard is ready to use.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
