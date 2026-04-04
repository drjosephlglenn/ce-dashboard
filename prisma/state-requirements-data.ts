/**
 * PT CEU State Requirements — Research Data (April 2026)
 *
 * This file contains structured data for all 50 US states + DC regarding
 * Physical Therapy continuing education requirements and approval mechanisms.
 *
 * DATA SOURCES:
 *   - FSBPT Licensure Reference Guide (fsbpt.org/lrg)
 *   - WebPT state CEU guide (webpt.com/blog/physical-therapist-ceu-requirements-by-state)
 *   - PT Progress state requirements (ptprogress.com)
 *   - Brookbush Institute state approval table (brookbushinstitute.com)
 *   - Medbridge state approval info (support.medbridge.com)
 *   - FlexTherapistCEUs board approval (flextherapistceus.com/ceu-board-approval.php)
 *   - PT on ICE FAQ (ptonice.com/faqs)
 *   - Apply EBP state approvals (applyebp.com/pt-ceu-approval-by-state)
 *   - Individual state board websites
 *
 * CONFIDENCE LEGEND:
 *   HIGH   = Confirmed across multiple sources or from official board site
 *   MEDIUM = Confirmed by 1-2 CE provider sites; likely accurate but verify
 *   LOW    = Inferred or partial info; verify before relying on
 *
 * IMPORTANT: State regulations change. Verify against current state board
 * websites before making business decisions. Last researched: April 2026.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * KEY FINDINGS — RECIPROCITY LANDSCAPE SUMMARY
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 1. HUB STATES (whose approval cascades to many other states):
 *    - CALIFORNIA (CA-PT / CPTA): ~20+ states accept CA PT Board approval
 *    - TEXAS (TX-PT / TPTA): ~7-10 states accept TX APTA chapter approval
 *    - NEW YORK (NY-PT / NYSED): ~5-8 states accept NY approval
 *    → Combined CA + TX + NY coverage: ~45 of 50 states
 *
 * 2. APPROVAL MECHANISM CATEGORIES:
 *    a) PRE-APPROVAL REQUIRED (strict): CA, TX, NY, OH, OK, NV, MN, IL,
 *       FL, NJ, LA, MD, NM, WV — Board or state APTA must approve the
 *       provider/course BEFORE it can be offered for credit.
 *    b) OPEN / SELF-REPORTING: States where PTs self-select relevant CE
 *       and report during renewal. Courses must be "relevant to PT practice"
 *       but no specific board pre-approval needed. Examples: AK, CO, CT,
 *       DE, HI, IN, IA, ME, MI, MO, MT, NE, NH, NC, OR, RI, SD, UT,
 *       VT, WA, WI, WY, and several others.
 *    c) RECIPROCITY STATES: Accept courses approved by OTHER state boards
 *       or APTA chapters. This is the largest group (~25 states).
 *    d) PETITION STATES: Allow individual course approval via petition
 *       (usually a short form + fee). Most states allow this as fallback.
 *
 * 3. NATIONAL BODIES:
 *    - APTA (American Physical Therapy Association): Does NOT directly
 *      approve CE courses. State APTA chapters do. However, many states
 *      accept "any APTA chapter" approved courses.
 *    - FSBPT: Sets guidelines and offers ProQuest assessment tool but does
 *      NOT approve individual CE courses. Their Licensure Reference Guide
 *      is the authoritative comparison resource.
 *    - BOC (Board of Certification for Athletic Trainers): Some states
 *      accept BOC-approved courses for PT credit.
 *    - IACET (International Accreditors for CE & Training): Accepted by
 *      some states as a qualifying approval body.
 *
 * 4. STRATEGY FOR AN INDEPENDENT CE INSTRUCTOR:
 *    Priority 1: Get approved in CA (covers ~20 reciprocity states)
 *    Priority 2: Get approved in TX (covers ~7-10 additional states)
 *    Priority 3: Get approved in NY (covers ~5 more states)
 *    Priority 4: Apply individually in remaining strict states (OH, OK,
 *                NV, MN, IL, FL, NJ, LA, MD, NM, WV)
 *    → This strategy covers all 50 states + DC
 *
 * ═══════════════════════════════════════════════════════════════════════
 */

export interface StateRequirementSeed {
  stateCode: string;
  stateName: string;
  boardName: string;
  boardUrl: string;
  requiresPreApproval: boolean;
  acceptsOtherStates: boolean;
  acceptedBodies: string[];    // e.g. ["CA-PT", "TX-PT", "APTA", "ANY-STATE-PT"]
  ceuRequiredPerCycle: number; // contact hours
  renewalCycleYears: number;
  notes: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
}

/**
 * acceptedBodies key:
 *   "CA-PT"          = California PT Board / CPTA approved providers
 *   "TX-PT"          = Texas PT Association (TPTA) approved
 *   "NY-PT"          = New York State Education Dept approved
 *   "FL-PT"          = Florida Board of PT
 *   "IL-PT"          = Illinois DFPR
 *   "APTA"           = Any APTA state chapter approval
 *   "ANY-STATE-PT"   = Any US state PT board or APTA chapter
 *   "BOC"            = Board of Certification (Athletic Training)
 *   "IACET"          = Intl Accreditors for CE & Training
 *   "FSBPT"          = FSBPT (for jurisdictional assessments only)
 *   "SELF-REPORT"    = Self-reporting; licensee determines relevance
 */

export const stateRequirements: StateRequirementSeed[] = [
  // ─── ALABAMA ───
  {
    stateCode: "AL",
    stateName: "Alabama",
    boardName: "Alabama Board of Physical Therapy",
    boardUrl: "https://www.pt.alabama.gov/",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "TX-PT", "NY-PT", "APTA", "ANY-STATE-PT"],
    ceuRequiredPerCycle: 10,
    renewalCycleYears: 1,
    notes: "10 contact hours per year. Renewal date Sep 30. Accepts courses approved by any state PT board or APTA chapter. Relatively open state.",
    confidence: "HIGH",
  },

  // ─── ALASKA ───
  {
    stateCode: "AK",
    stateName: "Alaska",
    boardName: "Alaska Board of Physical Therapy & Occupational Therapy",
    boardUrl: "https://www.commerce.alaska.gov/web/cbpl/ProfessionalLicensing/PhysicalTherapyOccupationalTherapy.aspx",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "APTA", "ANY-STATE-PT", "SELF-REPORT"],
    ceuRequiredPerCycle: 24,
    renewalCycleYears: 2,
    notes: "24 contact hours every 2 years. Renewal Jun 30 (even years). Accepts courses approved by any state board/APTA chapter. Effectively self-reporting with broad acceptance.",
    confidence: "HIGH",
  },

  // ─── ARIZONA ───
  {
    stateCode: "AZ",
    stateName: "Arizona",
    boardName: "Arizona Board of Physical Therapy",
    boardUrl: "https://ptboard.az.gov/",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["TX-PT", "CA-PT", "APTA", "ANY-STATE-PT"],
    ceuRequiredPerCycle: 20,
    renewalCycleYears: 2,
    notes: "20 contact hours (2 CEUs) every 2 years. Renewal Aug 31 (even years). Accepts TX APTA and other state board approvals.",
    confidence: "HIGH",
  },

  // ─── ARKANSAS ───
  {
    stateCode: "AR",
    stateName: "Arkansas",
    boardName: "Arkansas State Board of Physical Therapy",
    boardUrl: "https://www.arptb.org/",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "TX-PT", "APTA", "ANY-STATE-PT"],
    ceuRequiredPerCycle: 20,
    renewalCycleYears: 2,
    notes: "20 contact hours every 2 years. Renewal Dec 31 (even years). Accepts courses approved by other state boards.",
    confidence: "HIGH",
  },

  // ─── CALIFORNIA ───
  {
    stateCode: "CA",
    stateName: "California",
    boardName: "Physical Therapy Board of California",
    boardUrl: "https://www.ptbc.ca.gov/",
    requiresPreApproval: true,
    acceptsOtherStates: false,
    acceptedBodies: ["CA-PT"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 contact hours every 2 years. Must include 2 hrs ethics/law + 4 hrs BLS. STRICT PRE-APPROVAL: Provider must be approved as a Continuing Competency Approval Agency (CCAA) by the CA PT Board. This is a HUB STATE — CA approval is recognized by ~20+ other states. Provider approval requires application + fee. After 3 years of individual course approvals, can apply for institutional approval.",
    confidence: "HIGH",
  },

  // ─── COLORADO ───
  {
    stateCode: "CO",
    stateName: "Colorado",
    boardName: "Colorado Physical Therapy Board",
    boardUrl: "https://dpo.colorado.gov/PhysicalTherapy",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "APTA", "ANY-STATE-PT", "SELF-REPORT"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 contact hours (30 CPC points) every 2 years. Renewal Oct 31 (even years). PTAs need 20 hrs. Self-reporting with broad acceptance of other state approvals. Very open state.",
    confidence: "HIGH",
  },

  // ─── CONNECTICUT ───
  {
    stateCode: "CT",
    stateName: "Connecticut",
    boardName: "Connecticut Board of Examiners for Physical Therapists",
    boardUrl: "https://portal.ct.gov/dph/practitioner-licensing--investigations/physical-therapy/physical-therapy",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "APTA", "ANY-STATE-PT", "SELF-REPORT"],
    ceuRequiredPerCycle: 20,
    renewalCycleYears: 1,
    notes: "20 contact hours per year (some sources say per 2-year cycle — verify). Renewal on licensee's birth month. Accepts courses approved by other state boards. Very open.",
    confidence: "MEDIUM",
  },

  // ─── DELAWARE ───
  {
    stateCode: "DE",
    stateName: "Delaware",
    boardName: "Delaware Board of Physical Therapy",
    boardUrl: "https://dpr.delaware.gov/boards/physicaltherapy/",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "TX-PT", "APTA", "ANY-STATE-PT"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 contact hours (3 CEUs) every 2 years. Renewal Jan 31 (odd years). Accepts courses approved by other state boards or APTA chapters.",
    confidence: "HIGH",
  },

  // ─── DISTRICT OF COLUMBIA ───
  {
    stateCode: "DC",
    stateName: "District of Columbia",
    boardName: "DC Board of Physical Therapy",
    boardUrl: "https://dchealth.dc.gov/service/physical-therapy-licensing",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "TX-PT", "APTA", "ANY-STATE-PT"],
    ceuRequiredPerCycle: 24,
    renewalCycleYears: 2,
    notes: "24 contact hours every 2 years. Accepts courses approved by other state boards or APTA chapters.",
    confidence: "MEDIUM",
  },

  // ─── FLORIDA ───
  {
    stateCode: "FL",
    stateName: "Florida",
    boardName: "Florida Board of Physical Therapy Practice",
    boardUrl: "https://floridasphysicaltherapy.gov/",
    requiresPreApproval: true,
    acceptsOtherStates: false,
    acceptedBodies: ["FL-PT"],
    ceuRequiredPerCycle: 24,
    renewalCycleYears: 2,
    notes: "24 contact hours every 2 years. Renewal Nov 30 (odd years). PRE-APPROVAL REQUIRED: Provider must be approved by the Florida Board of PT or FPTA. Must include 2 hrs medical errors prevention. Florida does NOT accept other state approvals — provider must hold FL-specific approval.",
    confidence: "HIGH",
  },

  // ─── GEORGIA ───
  {
    stateCode: "GA",
    stateName: "Georgia",
    boardName: "Georgia Board of Physical Therapy",
    boardUrl: "https://sos.ga.gov/PLB/acrobat/Forms/38_Reference_-_Laws_and_Rules.pdf",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "TX-PT", "APTA", "ANY-STATE-PT"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 contact hours every 2 years. Renewal Dec 31 (odd years). Accepts courses approved by other state boards or APTA chapters.",
    confidence: "HIGH",
  },

  // ─── HAWAII ───
  {
    stateCode: "HI",
    stateName: "Hawaii",
    boardName: "Hawaii Board of Physical Therapy",
    boardUrl: "https://cca.hawaii.gov/pvl/boards/physical_therapy/",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "NY-PT", "APTA", "ANY-STATE-PT"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 contact hours every 2 years. Renewal Dec 31 (even years). Recognizes NYSED and CA PT Board approvals. Open state.",
    confidence: "HIGH",
  },

  // ─── IDAHO ───
  {
    stateCode: "ID",
    stateName: "Idaho",
    boardName: "Idaho Physical Therapy Licensure Board",
    boardUrl: "https://dopl.idaho.gov/pht/",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["TX-PT", "CA-PT", "APTA", "ANY-STATE-PT"],
    ceuRequiredPerCycle: 32,
    renewalCycleYears: 2,
    notes: "32 contact hours every 2 years (16 per year). Renewal on licensee's birth month. Accepts TX APTA and other state board approvals.",
    confidence: "HIGH",
  },

  // ─── ILLINOIS ───
  {
    stateCode: "IL",
    stateName: "Illinois",
    boardName: "Illinois Board of Physical Therapy",
    boardUrl: "https://idfpr.illinois.gov/profs/physther.html",
    requiresPreApproval: true,
    acceptsOtherStates: false,
    acceptedBodies: ["IL-PT"],
    ceuRequiredPerCycle: 40,
    renewalCycleYears: 2,
    notes: "40 contact hours every 2 years. Renewal Sep 30 (even years). At least 3 hrs must be ethics. PRE-APPROVAL: Provider must be approved by IDFPR. Illinois does not broadly accept other state approvals — must hold IL-specific provider status. Among the stricter states.",
    confidence: "HIGH",
  },

  // ─── INDIANA ───
  {
    stateCode: "IN",
    stateName: "Indiana",
    boardName: "Indiana Physical Therapy Committee",
    boardUrl: "https://www.in.gov/pla/professions/physical-therapy-committee/",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "TX-PT", "APTA", "ANY-STATE-PT"],
    ceuRequiredPerCycle: 22,
    renewalCycleYears: 2,
    notes: "22 contact hours every 2 years (some sources say 24 — verify). Renewal Jun 30 (even years). Accepts courses approved by other state boards. Open reciprocity.",
    confidence: "HIGH",
  },

  // ─── IOWA ───
  {
    stateCode: "IA",
    stateName: "Iowa",
    boardName: "Iowa Board of Physical and Occupational Therapy",
    boardUrl: "https://idph.iowa.gov/licensure/iowa-board-of-physical-and-occupational-therapy",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "APTA", "ANY-STATE-PT", "SELF-REPORT"],
    ceuRequiredPerCycle: 40,
    renewalCycleYears: 2,
    notes: "40 contact hours every 2 years. Renewal on 15th of licensee's birth month (even or odd based on issue). Accepts courses approved by other state boards. Self-reporting state.",
    confidence: "HIGH",
  },

  // ─── KANSAS ───
  {
    stateCode: "KS",
    stateName: "Kansas",
    boardName: "Kansas State Board of Healing Arts",
    boardUrl: "https://www.ksbha.org/",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["TX-PT", "CA-PT", "APTA", "ANY-STATE-PT"],
    ceuRequiredPerCycle: 40,
    renewalCycleYears: 2,
    notes: "40 contact hours every 2 years. Renewal Dec 31 (even years). Accepts TX APTA and other state board approvals.",
    confidence: "HIGH",
  },

  // ─── KENTUCKY ───
  {
    stateCode: "KY",
    stateName: "Kentucky",
    boardName: "Kentucky Board of Physical Therapy",
    boardUrl: "https://pt.ky.gov/",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["TX-PT", "CA-PT", "APTA", "ANY-STATE-PT"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 contact hours every 2 years. Renewal Mar 31 (odd years). Accepts TX APTA and other state board approvals.",
    confidence: "HIGH",
  },

  // ─── LOUISIANA ───
  {
    stateCode: "LA",
    stateName: "Louisiana",
    boardName: "Louisiana Physical Therapy Board",
    boardUrl: "https://www.laptboard.org/",
    requiresPreApproval: true,
    acceptsOtherStates: false,
    acceptedBodies: ["LA-PT"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 contact hours every 2 years. Renewal Mar 31 (odd/even based on birth year). Must include 2 hrs jurisprudence + 2 hrs ethics + at least 18 hrs clinical. PRE-APPROVAL by LA Board or approved provider required. Does not broadly accept other states.",
    confidence: "HIGH",
  },

  // ─── MAINE ───
  {
    stateCode: "ME",
    stateName: "Maine",
    boardName: "Maine Board of Examiners in Physical Therapy",
    boardUrl: "https://www.maine.gov/sos/cec/elec/upcoming.html",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "APTA", "ANY-STATE-PT", "SELF-REPORT"],
    ceuRequiredPerCycle: 0,
    renewalCycleYears: 2,
    notes: "NO CE REQUIREMENT for license renewal. Renewal Mar 31 (even years). One of the few states with no mandatory CE hours. Licensees are still encouraged to pursue CE.",
    confidence: "HIGH",
  },

  // ─── MARYLAND ───
  {
    stateCode: "MD",
    stateName: "Maryland",
    boardName: "Maryland Board of Physical Therapy Examiners",
    boardUrl: "https://health.maryland.gov/bpte/",
    requiresPreApproval: true,
    acceptsOtherStates: false,
    acceptedBodies: ["MD-PT"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 contact hours every 2 years. CEUs due Mar 31; license renews May 31. PRE-APPROVAL: Must be approved by MD Board. Does not broadly accept other state approvals. Strict state.",
    confidence: "HIGH",
  },

  // ─── MASSACHUSETTS ───
  {
    stateCode: "MA",
    stateName: "Massachusetts",
    boardName: "Massachusetts Board of Registration of Allied Health Professionals",
    boardUrl: "https://www.mass.gov/orgs/board-of-registration-of-allied-health-professionals",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["TX-PT", "CA-PT", "APTA", "ANY-STATE-PT"],
    ceuRequiredPerCycle: 24,
    renewalCycleYears: 2,
    notes: "24 continuing competency hours every 2 years. Must include 2 hrs ethics or MA law/jurisprudence. Renewal biennially. Accepts TX APTA approval. Recent changes (2024) — moved from no CE requirement to 24-hr competency requirement. Verify current rules.",
    confidence: "MEDIUM",
  },

  // ─── MICHIGAN ───
  {
    stateCode: "MI",
    stateName: "Michigan",
    boardName: "Michigan Board of Physical Therapy",
    boardUrl: "https://www.michigan.gov/lara/bureau-list/bpl/occ/prof/physical-therapists",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "TX-PT", "APTA", "ANY-STATE-PT"],
    ceuRequiredPerCycle: 24,
    renewalCycleYears: 2,
    notes: "24 PDR (Professional Development Requirement) credits every 2 years. Renewal Jul 31 based on original licensure. Must include 1 hr pain management + 2 hrs implicit bias. Not required for first renewal. Accepts other state approvals.",
    confidence: "HIGH",
  },

  // ─── MINNESOTA ───
  {
    stateCode: "MN",
    stateName: "Minnesota",
    boardName: "Minnesota Board of Physical Therapy",
    boardUrl: "https://mn.gov/boards/physical-therapy/",
    requiresPreApproval: true,
    acceptsOtherStates: false,
    acceptedBodies: ["MN-PT"],
    ceuRequiredPerCycle: 20,
    renewalCycleYears: 2,
    notes: "20 contact hours every 2 years. Annual renewal Dec 31 (CEUs due every 2 yrs based on license issue). PRE-APPROVAL: MN Board must approve. One of the 7 'strict' states that does not broadly accept other state approvals.",
    confidence: "HIGH",
  },

  // ─── MISSISSIPPI ───
  {
    stateCode: "MS",
    stateName: "Mississippi",
    boardName: "Mississippi State Board of Physical Therapy",
    boardUrl: "https://www.msbpt.ms.gov/",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "TX-PT", "APTA", "ANY-STATE-PT"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 contact hours every 2 years. Renewal Jun 30 (A-L odd years; M-Z even years). Accepts courses approved by other state boards.",
    confidence: "HIGH",
  },

  // ─── MISSOURI ───
  {
    stateCode: "MO",
    stateName: "Missouri",
    boardName: "Missouri Board of Registration for the Healing Arts",
    boardUrl: "https://pr.mo.gov/healingarts-pt.asp",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "APTA", "ANY-STATE-PT", "SELF-REPORT"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 contact hours every 2 years. CEUs due Dec 31 (odd years) prior to renewal. Accepts CA PT Board approval and other state approvals.",
    confidence: "HIGH",
  },

  // ─── MONTANA ───
  {
    stateCode: "MT",
    stateName: "Montana",
    boardName: "Montana Board of Physical Therapy Examiners",
    boardUrl: "https://boards.bsd.dli.mt.gov/physical-therapy-examiners",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "APTA", "ANY-STATE-PT", "SELF-REPORT"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 contact hours every 2 years. Renewal Apr 1 annually (CEUs due odd years). Accepts CA PT Board approval and other state approvals. Open state.",
    confidence: "HIGH",
  },

  // ─── NEBRASKA ───
  {
    stateCode: "NE",
    stateName: "Nebraska",
    boardName: "Nebraska Board of Physical Therapy",
    boardUrl: "https://dhhs.ne.gov/licensure/Pages/Physical-Therapy.aspx",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "APTA", "ANY-STATE-PT", "SELF-REPORT"],
    ceuRequiredPerCycle: 20,
    renewalCycleYears: 2,
    notes: "20 contact hours every 2 years. Renewal Nov 1 (odd years). Accepts CA PT Board approval. Open/self-reporting with broad reciprocity.",
    confidence: "HIGH",
  },

  // ─── NEVADA ───
  {
    stateCode: "NV",
    stateName: "Nevada",
    boardName: "Nevada Board of Physical Therapy Examiners",
    boardUrl: "https://ptboard.nv.gov/",
    requiresPreApproval: true,
    acceptsOtherStates: false,
    acceptedBodies: ["NV-PT"],
    ceuRequiredPerCycle: 15,
    renewalCycleYears: 1,
    notes: "15 contact hours (1.5 CEUs) per year. Annual renewal. PRE-APPROVAL by NV Board required. No more than 8 hrs (0.8 CEUs) non-clinical content. No carryover. One of the 7 'strict' states. Does not accept other state approvals broadly.",
    confidence: "HIGH",
  },

  // ─── NEW HAMPSHIRE ───
  {
    stateCode: "NH",
    stateName: "New Hampshire",
    boardName: "New Hampshire Board of Physical Therapy",
    boardUrl: "https://www.oplc.nh.gov/physical-therapy",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "APTA", "ANY-STATE-PT", "SELF-REPORT"],
    ceuRequiredPerCycle: 24,
    renewalCycleYears: 2,
    notes: "24 contact hours every 2 years. Renewal Dec 31 (even years). Accepts CA PT Board and other state approvals. Open state.",
    confidence: "HIGH",
  },

  // ─── NEW JERSEY ───
  {
    stateCode: "NJ",
    stateName: "New Jersey",
    boardName: "New Jersey State Board of Physical Therapy Examiners",
    boardUrl: "https://www.njconsumeraffairs.gov/pt/",
    requiresPreApproval: true,
    acceptsOtherStates: false,
    acceptedBodies: ["NJ-PT"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 contact hours every 2 years. Renewal Jan 31 (even years). Must include 4 hrs jurisprudence/ethics. PRE-APPROVAL: NJ Board must approve provider. Does not broadly accept other state approvals. Strict state.",
    confidence: "HIGH",
  },

  // ─── NEW MEXICO ───
  {
    stateCode: "NM",
    stateName: "New Mexico",
    boardName: "New Mexico Physical Therapy Board",
    boardUrl: "https://www.rld.nm.gov/boards-and-commissions/individual-boards-and-commissions/physical-therapy/",
    requiresPreApproval: true,
    acceptsOtherStates: false,
    acceptedBodies: ["NM-PT"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 contact hours every 2 years. Renewal period Feb 1 - Jan 31. No carryover hours. PRE-APPROVAL: NM Board approval required. First-time renewals exempt from CE. Strict state.",
    confidence: "HIGH",
  },

  // ─── NEW YORK ───
  {
    stateCode: "NY",
    stateName: "New York",
    boardName: "New York State Education Department (NYSED) - Physical Therapy",
    boardUrl: "https://www.op.nysed.gov/professions/physical-therapists",
    requiresPreApproval: true,
    acceptsOtherStates: false,
    acceptedBodies: ["NY-PT"],
    ceuRequiredPerCycle: 36,
    renewalCycleYears: 3,
    notes: "36 contact hours every 3 years (one of the few 3-year cycles). PRE-APPROVAL: Provider must be approved by NYSED. This is a HUB STATE — NY approval is recognized by HI, TN, and several other states. NYSED has a 'deemed approved' provider list. Strict but valuable.",
    confidence: "HIGH",
  },

  // ─── NORTH CAROLINA ───
  {
    stateCode: "NC",
    stateName: "North Carolina",
    boardName: "North Carolina Board of Physical Therapy Examiners",
    boardUrl: "https://www.ncptboard.org/",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "TX-PT", "APTA", "ANY-STATE-PT", "FSBPT", "IACET"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 points (PTs) / 20 points (PTAs) per 2-year reporting period. Very open: Any course approved by an APTA chapter or section, FSBPT, IACET, or any US/Canadian state PT board is accepted. One of the most open states.",
    confidence: "HIGH",
  },

  // ─── NORTH DAKOTA ───
  {
    stateCode: "ND",
    stateName: "North Dakota",
    boardName: "North Dakota State Board of Physical Therapy",
    boardUrl: "https://www.ndsbpt.org/",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "TX-PT", "APTA", "ANY-STATE-PT"],
    ceuRequiredPerCycle: 25,
    renewalCycleYears: 2,
    notes: "25 contact hours every 2 years. Renewal Jan 31. Accepts courses approved by other state boards and APTA chapters.",
    confidence: "HIGH",
  },

  // ─── OHIO ───
  {
    stateCode: "OH",
    stateName: "Ohio",
    boardName: "Ohio Physical Therapy Board (Section of the OTPTAT Board)",
    boardUrl: "https://otptat.ohio.gov/",
    requiresPreApproval: true,
    acceptsOtherStates: false,
    acceptedBodies: ["OH-PT"],
    ceuRequiredPerCycle: 24,
    renewalCycleYears: 2,
    notes: "24 contact hours every 2 years (some sources say 20 — verify with board). PRE-APPROVAL: OH Board must approve courses individually. One of the 7 'strict' states. APTA Orthopedics applies on a per-course basis for OH.",
    confidence: "MEDIUM",
  },

  // ─── OKLAHOMA ───
  {
    stateCode: "OK",
    stateName: "Oklahoma",
    boardName: "Oklahoma Board of Medical Licensure and Supervision - PT Advisory Committee",
    boardUrl: "https://www.okmedicalboard.org/",
    requiresPreApproval: true,
    acceptsOtherStates: false,
    acceptedBodies: ["OK-PT"],
    ceuRequiredPerCycle: 40,
    renewalCycleYears: 2,
    notes: "40 contact hours every 2 years. Annual renewal Jan 31 (CEUs due Dec 31 odd years). PRE-APPROVAL: OK Board must approve. One of the 7 'strict' states. High hour requirement + strict approval = one of the hardest states.",
    confidence: "HIGH",
  },

  // ─── OREGON ───
  {
    stateCode: "OR",
    stateName: "Oregon",
    boardName: "Oregon Physical Therapist Licensing Board",
    boardUrl: "https://www.oregon.gov/optb/",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "APTA", "ANY-STATE-PT", "SELF-REPORT"],
    ceuRequiredPerCycle: 24,
    renewalCycleYears: 2,
    notes: "24 contact hours every 2 years. Renewal Mar 31 (even years). Accepts CA PT Board and other state board approvals. Self-reporting with broad acceptance.",
    confidence: "HIGH",
  },

  // ─── PENNSYLVANIA ───
  {
    stateCode: "PA",
    stateName: "Pennsylvania",
    boardName: "Pennsylvania State Board of Physical Therapy",
    boardUrl: "https://www.dos.pa.gov/ProfessionalLicensing/BoardsCommissions/PhysicalTherapy/",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "TX-PT", "APTA", "ANY-STATE-PT"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 contact hours every 2 years. Does NOT accept courses on practice management, practice building, dry-needling, payment policy, or regulatory requirements. Accepts other state approvals but has content restrictions. Verify course topic eligibility.",
    confidence: "HIGH",
  },

  // ─── RHODE ISLAND ───
  {
    stateCode: "RI",
    stateName: "Rhode Island",
    boardName: "Rhode Island Board of Physical Therapy",
    boardUrl: "https://health.ri.gov/licenses/detail.php?id=231",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "APTA", "ANY-STATE-PT", "SELF-REPORT"],
    ceuRequiredPerCycle: 24,
    renewalCycleYears: 2,
    notes: "24 contact hours every 2 years. Renewal Mar 31 (even years). Accepts CA PT Board and other state board approvals. Open state with broad reciprocity.",
    confidence: "HIGH",
  },

  // ─── SOUTH CAROLINA ───
  {
    stateCode: "SC",
    stateName: "South Carolina",
    boardName: "South Carolina Board of Physical Therapy Examiners",
    boardUrl: "https://www.llr.sc.gov/pt/",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "TX-PT", "APTA", "ANY-STATE-PT"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 contact hours every 2 years. Renewal Dec 31 (even years). Accepts courses approved by other state boards. Accepts another state's approval.",
    confidence: "HIGH",
  },

  // ─── SOUTH DAKOTA ───
  {
    stateCode: "SD",
    stateName: "South Dakota",
    boardName: "South Dakota Board of Physical Therapy",
    boardUrl: "https://doh.sd.gov/licensing-and-records/boards/physical-therapy/",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "APTA", "ANY-STATE-PT", "SELF-REPORT"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 contact hours every 2 years (some sources say 15/year — same total). Renewal Jan 1. Accepts CA PT Board and other state approvals. Open state.",
    confidence: "HIGH",
  },

  // ─── TENNESSEE ───
  {
    stateCode: "TN",
    stateName: "Tennessee",
    boardName: "Tennessee Board of Physical Therapy",
    boardUrl: "https://www.tn.gov/health/health-program-areas/health-professional-boards/pt-board.html",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["NY-PT", "CA-PT", "APTA", "ANY-STATE-PT"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 contact hours every 2 years. Renewal by last day of month before birthday. Must include 2 hrs ethics + 2 hrs jurisprudence. At least 20 hrs Category 1 activities. Recognizes NYSED approvals. Accepts other state approvals.",
    confidence: "HIGH",
  },

  // ─── TEXAS ───
  {
    stateCode: "TX",
    stateName: "Texas",
    boardName: "Executive Council of Physical Therapy & Occupational Therapy Examiners (ECPTOTE)",
    boardUrl: "https://ptot.texas.gov/",
    requiresPreApproval: true,
    acceptsOtherStates: false,
    acceptedBodies: ["TX-PT"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 contact hours every 2 years. Must include 2 hrs ethics. PRE-APPROVAL: Must be approved through TPTA (Texas Physical Therapy Association) or TX Board. This is a HUB STATE — TX approval is recognized by AZ, ID, KS, KY, MA, VA, and several others. After 3 years of individual approvals, can apply for institutional approval. TX also requires Jurisprudence Assessment Module (TX JAM).",
    confidence: "HIGH",
  },

  // ─── UTAH ───
  {
    stateCode: "UT",
    stateName: "Utah",
    boardName: "Utah Division of Occupational and Professional Licensing - Physical Therapy",
    boardUrl: "https://dopl.utah.gov/pt/",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "APTA", "ANY-STATE-PT", "SELF-REPORT"],
    ceuRequiredPerCycle: 40,
    renewalCycleYears: 2,
    notes: "40 contact hours every 2 years. Renewal May 31 (odd years). Accepts CA PT Board and other state approvals. Self-reporting with broad acceptance. High hour requirement but very open on approval.",
    confidence: "HIGH",
  },

  // ─── VERMONT ───
  {
    stateCode: "VT",
    stateName: "Vermont",
    boardName: "Vermont Board of Physical Therapy",
    boardUrl: "https://sos.vermont.gov/physical-therapy/",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "APTA", "ANY-STATE-PT", "SELF-REPORT"],
    ceuRequiredPerCycle: 24,
    renewalCycleYears: 2,
    notes: "24 contact hours (24 CCUs) every 2 years. Renewal Sep 30 (even years). Accepts CA PT Board and other state approvals. Open/self-reporting state.",
    confidence: "HIGH",
  },

  // ─── VIRGINIA ───
  {
    stateCode: "VA",
    stateName: "Virginia",
    boardName: "Virginia Board of Physical Therapy",
    boardUrl: "https://www.dhp.virginia.gov/PhysicalTherapy/",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["TX-PT", "CA-PT", "APTA", "ANY-STATE-PT"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 contact hours every 2 years. Renewal Dec 31 (even years). Accepts TX APTA and other state approvals. Open reciprocity.",
    confidence: "HIGH",
  },

  // ─── WASHINGTON ───
  {
    stateCode: "WA",
    stateName: "Washington",
    boardName: "Washington State Department of Health - Physical Therapy",
    boardUrl: "https://doh.wa.gov/licenses-permits-and-certificates/professions-new-renew-or-update/physical-therapist-and-physical-therapist-assistant",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "APTA", "ANY-STATE-PT", "SELF-REPORT"],
    ceuRequiredPerCycle: 32,
    renewalCycleYears: 2,
    notes: "32 contact hours every 2 years + 200 employment hours. Renewal on licensee's birthday. Accepts CA PT Board and other state approvals. Also requires employment hours for renewal.",
    confidence: "HIGH",
  },

  // ─── WEST VIRGINIA ───
  {
    stateCode: "WV",
    stateName: "West Virginia",
    boardName: "West Virginia Board of Physical Therapy",
    boardUrl: "https://wvbopt.com/",
    requiresPreApproval: true,
    acceptsOtherStates: false,
    acceptedBodies: ["WV-PT"],
    ceuRequiredPerCycle: 24,
    renewalCycleYears: 2,
    notes: "24 contact hours every 2 years. Renewal Dec 31. PRE-APPROVAL: WV Board approved CEs required. Medbridge lists WV as having individual approval requirements. Stricter state.",
    confidence: "MEDIUM",
  },

  // ─── WISCONSIN ───
  {
    stateCode: "WI",
    stateName: "Wisconsin",
    boardName: "Wisconsin Physical Therapy Examining Board",
    boardUrl: "https://dsps.wi.gov/Pages/BoardsCouncils/PhysicalTherapy/Default.aspx",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "APTA", "ANY-STATE-PT", "SELF-REPORT"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 contact hours every 2 years. Renewal Feb 28 (odd years). Accepts CA PT Board and other state board approvals. Self-reporting with broad acceptance.",
    confidence: "HIGH",
  },

  // ─── WYOMING ───
  {
    stateCode: "WY",
    stateName: "Wyoming",
    boardName: "Wyoming Board of Physical Therapy",
    boardUrl: "https://physicaltherapy.wyo.gov/",
    requiresPreApproval: false,
    acceptsOtherStates: true,
    acceptedBodies: ["CA-PT", "APTA", "ANY-STATE-PT", "SELF-REPORT"],
    ceuRequiredPerCycle: 30,
    renewalCycleYears: 2,
    notes: "30 contact hours every 2 years. Annual renewal Oct 1. Accepts CA PT Board and other state approvals. Open state.",
    confidence: "HIGH",
  },
];

/**
 * ═══════════════════════════════════════════════════════════════════════
 * CLASSIFICATION SUMMARY
 * ═══════════════════════════════════════════════════════════════════════
 *
 * PRE-APPROVAL REQUIRED (14 states — must hold state-specific approval):
 *   CA, TX, NY, FL, IL, OH, OK, NV, MN, NJ, LA, MD, NM, WV
 *
 * OPEN / RECIPROCITY (36 states + DC — accept other state board approvals):
 *   AL, AK, AZ, AR, CO, CT, DE, DC, GA, HI, ID, IN, IA, KS, KY,
 *   MA, ME, MI, MS, MO, MT, NE, NH, NC, ND, OR, PA, RI, SC, SD,
 *   TN, UT, VT, VA, WA, WI, WY
 *
 * NO CE REQUIREMENT (1 state):
 *   ME (Maine)
 *
 * ═══════════════════════════════════════════════════════════════════════
 * RECIPROCITY CASCADES (if you get approved in these states):
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CALIFORNIA (CA-PT) approval cascades to:
 *   AK, AL, AZ, AR, CO, CT, DE, DC, GA, HI, ID, IN, IA, KS, KY,
 *   MA, MI, MS, MO, MT, NE, NH, NC, ND, OR, PA, RI, SC, SD, TN,
 *   UT, VT, VA, WA, WI, WY
 *   → ~36 states
 *
 * TEXAS (TX-PT) approval cascades to:
 *   AZ, ID, KS, KY, MA, VA (+ all the "ANY-STATE-PT" states above)
 *   → ~7 states explicitly, plus any "accepts any state" state
 *
 * NEW YORK (NY-PT) approval cascades to:
 *   HI, TN (+ other states that accept "any state board")
 *   → ~5 states explicitly
 *
 * ═══════════════════════════════════════════════════════════════════════
 * REMAINING INDIVIDUAL APPLICATIONS NEEDED:
 * ═══════════════════════════════════════════════════════════════════════
 *
 * After obtaining CA + TX + NY approval, you still need individual
 * applications for:
 *   FL, IL, OH, OK, NV, MN, NJ, LA, MD, NM, WV
 *   = 11 individual state applications
 *
 * Total strategy: 3 hub approvals + 11 individual = 14 applications
 * to cover all 50 states + DC
 *
 * ═══════════════════════════════════════════════════════════════════════
 */
