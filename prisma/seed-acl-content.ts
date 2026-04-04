import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Updating ACL-BFR course with revised schedule (v2)...\n");

  const updated = await prisma.course.update({
    where: { shortCode: "ACL-BFR" },
    data: {
      prerequisites:
        "Current licensure/certification in PT, PTA, ATC, or equivalent. Participants must complete the Pre-Req Video Module (~45-60 min) covering BFR physiology, cuff types, dosing parameters, evidence overview, and contraindication screening before attending the in-person course.",
      schedule: [
        {
          module: null,
          title: "Pre-Req Video Module (Sent Before Course)",
          startTime: "",
          endTime: "",
          duration: 60,
          format: "Self-Paced Video",
          topics: [
            "BFR Physiology: metabolic stress, mechanical tension, cell swelling, mTOR pathway, GH response, type II fiber recruitment at low loads",
            "BFR Parameters: cuff types (elastic vs. pneumatic), limb occlusion pressure, individualized vs. arbitrary pressure, width, continuous vs. intermittent",
            "Evidence Overview: systematic reviews — hypertrophy comparable to high-load, strength gains meaningful but generally inferior to high-load",
            "Safety & Contraindications: absolute/relative contraindications, DVT risk screening, adverse event rates from surveys",
          ],
        },
        {
          module: null,
          title: "Pre-Req Review + Q&A",
          startTime: "8:00 AM",
          endTime: "8:20 AM",
          duration: 20,
          format: "Discussion",
          topics: [
            "Quick knowledge check on pre-req video content",
            "Address questions from video module",
            "Course overview and day structure",
          ],
        },
        {
          module: 1,
          title: "The ACL Quad Problem + Why BFR",
          startTime: "8:20 AM",
          endTime: "8:50 AM",
          duration: 30,
          format: "Lecture",
          topics: [
            "Arthrogenic muscle inhibition (AMI) after ACLR — persistent quad strength deficits (>10% at 1yr, >20% vs uninjured controls)",
            "Why BFR for ACL? Evidence from recent SRs — safe, accelerates early quad recovery (weeks 1-12), benefits clearest with individualized high occlusion pressures",
            "Patient selection criteria and communication with referring surgeon",
          ],
        },
        {
          module: null,
          title: "Lab 1: BFR Setup, LOP Assessment & Cuff Application",
          startTime: "8:50 AM",
          endTime: "9:40 AM",
          duration: 50,
          format: "Supervised Practical",
          topics: [
            "Equipment demo: pneumatic tourniquet systems (Delfi, Smart Cuffs, etc.), cuff sizing, device operation",
            "LOP Assessment: partner practice determining individual limb occlusion pressure using Doppler or device-automated protocols",
            "Cuff placement on thigh, setting pressure (40-80% LOP), performing basic exercises (quad sets, SLR, knee extension) with BFR",
            "Experience BFR as both clinician and patient — troubleshoot numbness, cuff migration, patient anxiety",
          ],
        },
        {
          module: null,
          title: "Break",
          startTime: "9:40 AM",
          endTime: "9:55 AM",
          duration: 15,
          format: "Break",
          topics: [],
        },
        {
          module: 2,
          title: "Early Phase Protocols (Weeks 1-6)",
          startTime: "9:55 AM",
          endTime: "10:25 AM",
          duration: 30,
          format: "Lecture",
          topics: [
            "Low-load BFR exercises during protected weight-bearing — quad sets, SLR, mini squats, leg press at 20-30% 1RM",
            "Dosing: 30-15-15-15 rep scheme, 30-60s rest, 40-60% LOP",
            "Managing early post-op considerations: swelling, ROM restrictions, pain monitoring",
          ],
        },
        {
          module: null,
          title: "Lab 2: Early Phase BFR Exercises",
          startTime: "10:25 AM",
          endTime: "11:15 AM",
          duration: 50,
          format: "Supervised Practical",
          topics: [
            "Partner practice: apply BFR cuff and perform early-phase exercises at correct dosing parameters",
            "Quad sets + SLR with BFR — practice the 30-15-15-15 protocol with timer",
            "Leg press at 20-30% 1RM with BFR — experience the metabolic demand",
            "Document: record LOP, pressure used, RPE, and exercise parameters on tracking sheet",
          ],
        },
        {
          module: 3,
          title: "Mid Phase Protocols (Weeks 6-16)",
          startTime: "11:15 AM",
          endTime: "11:45 AM",
          duration: 30,
          format: "Lecture",
          topics: [
            "Transitioning from BFR-only to combined BFR + progressive loading",
            "Closed chain exercises, single-leg work, progressive resistance at 60-80% LOP",
            "Addressing persistent quad inhibition — when and how to increase occlusion pressure",
          ],
        },
        {
          module: null,
          title: "Lab 3: Mid Phase Progressions",
          startTime: "11:45 AM",
          endTime: "12:35 PM",
          duration: 50,
          format: "Supervised Practical",
          topics: [
            "Single-leg squat variations with BFR at mid-phase parameters",
            "Step-up progressions with BFR — adjusting load and occlusion for progression",
            "Partner case challenge: given a patient scenario at week 10, design the next 2 weeks of BFR programming",
            "Instructor circulates for individual troubleshooting and feedback",
          ],
        },
        {
          module: null,
          title: "Lunch",
          startTime: "12:35 PM",
          endTime: "1:15 PM",
          duration: 40,
          format: "Break",
          topics: [],
        },
        {
          module: 4,
          title: "Late Phase + Sport-Specific BFR (4-9+ Months)",
          startTime: "1:15 PM",
          endTime: "1:45 PM",
          duration: 30,
          format: "Lecture",
          topics: [
            "BFR as an adjunct to heavy loading — when both are appropriate simultaneously",
            "Plyometric readiness criteria and integrating BFR into jump/land training",
            "Sport-specific progression: cutting, deceleration, reactive agility with BFR context",
            "When to phase out BFR — graduation criteria",
          ],
        },
        {
          module: null,
          title: "Lab 4: Late Phase + Plyometric BFR",
          startTime: "1:45 PM",
          endTime: "2:35 PM",
          duration: 50,
          format: "Supervised Practical",
          topics: [
            "Heavy leg press + BFR superset — experience the late-phase intensity",
            "Lunge and step-up variations at sport-specific loads with BFR",
            "Plyometric station: drop jumps, single-leg hops — when BFR applies and when it doesn't",
            "Group discussion: building a 4-week late-phase block integrating BFR with traditional S&C",
          ],
        },
        {
          module: null,
          title: "Break",
          startTime: "2:35 PM",
          endTime: "2:50 PM",
          duration: 15,
          format: "Break",
          topics: [],
        },
        {
          module: 5,
          title: "Return-to-Sport Testing & Criteria",
          startTime: "2:50 PM",
          endTime: "3:30 PM",
          duration: 40,
          format: "Lecture",
          topics: [
            "Current RTS testing batteries: isokinetic strength (LSI ≥ 90%), hop tests (single, crossover, triple, timed 6m), LESS, ACL-RSI",
            "Interpreting strength & hop data: calculating LSI, identifying compensatory strategies, >10% quad deficit and re-injury risk",
            "Clinical decision-making: integrating physical, psychological, and sport-demand factors",
            "Communicating readiness (or non-readiness) to athletes, coaches, and surgeons",
          ],
        },
        {
          module: null,
          title: "Lab 5: RTS Testing Practice",
          startTime: "3:30 PM",
          endTime: "4:20 PM",
          duration: 50,
          format: "Supervised Practical",
          topics: [
            "Hop test battery: perform and score single-leg hop, crossover hop, triple hop on each other",
            "Strength testing simulation: handheld dynamometry for quad/ham ratio, calculate LSI",
            "Landing quality assessment: LESS scoring on partner",
            "Case data interpretation: given a full RTS dataset, make a clearance decision and defend it to the group",
          ],
        },
        {
          module: null,
          title: "Case Study Integration",
          startTime: "4:20 PM",
          endTime: "4:40 PM",
          duration: 20,
          format: "Workshop",
          topics: [
            "Full case walkthrough: ACL patient from week 1 through RTS — groups design the complete BFR-integrated protocol",
            "Implementation checklist: equipment purchasing, staff training, patient consent, documentation templates",
          ],
        },
        {
          module: null,
          title: "Assessment + Wrap-Up",
          startTime: "4:40 PM",
          endTime: "5:00 PM",
          duration: 20,
          format: "Assessment",
          topics: [
            "Post-course written exam (20 multiple-choice, 70% to pass)",
            "Course evaluation form",
            "CEU certificate distribution",
          ],
        },
      ],
    },
  });

  console.log(`✓ Updated course: ${updated.title} (${updated.shortCode})`);
  console.log(`  - Prerequisites updated with pre-req video requirement`);
  console.log(
    `  - Schedule: ${(updated.schedule as unknown[]).length} blocks (5 modules + 5 labs + breaks + pre-req)`
  );
  console.log("\n✅ ACL-BFR course schedule v2 update complete.");
}

main()
  .catch((e) => {
    console.error("Error updating ACL-BFR course:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
