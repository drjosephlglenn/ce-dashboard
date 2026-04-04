"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

// ── Column mapping config ──

type FieldKey =
  | "firstName"
  | "lastName"
  | "email"
  | "credentials"
  | "clinicName"
  | "clinicCity"
  | "clinicState"
  | "registrationType"
  | "amountPaid";

const FIELD_OPTIONS: { key: FieldKey; label: string }[] = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "credentials", label: "Credentials" },
  { key: "clinicName", label: "Clinic Name" },
  { key: "clinicCity", label: "Clinic City" },
  { key: "clinicState", label: "Clinic State" },
  { key: "registrationType", label: "Registration Type" },
  { key: "amountPaid", label: "Amount Paid" },
];

const COLUMN_ALIASES: Record<string, FieldKey> = {
  // firstName
  "first name": "firstName",
  first_name: "firstName",
  firstname: "firstName",
  first: "firstName",
  fname: "firstName",
  "first name*": "firstName",
  // lastName
  "last name": "lastName",
  last_name: "lastName",
  lastname: "lastName",
  last: "lastName",
  lname: "lastName",
  "last name*": "lastName",
  // email
  email: "email",
  "email address": "email",
  email_address: "email",
  "e-mail": "email",
  // credentials
  credentials: "credentials",
  credential: "credentials",
  license: "credentials",
  "license type": "credentials",
  designation: "credentials",
  cert: "credentials",
  // clinicName
  clinic: "clinicName",
  "clinic name": "clinicName",
  clinic_name: "clinicName",
  clinicname: "clinicName",
  practice: "clinicName",
  "practice name": "clinicName",
  facility: "clinicName",
  "facility name": "clinicName",
  company: "clinicName",
  employer: "clinicName",
  // clinicCity
  city: "clinicCity",
  "clinic city": "clinicCity",
  clinic_city: "clinicCity",
  // clinicState
  state: "clinicState",
  "clinic state": "clinicState",
  clinic_state: "clinicState",
  st: "clinicState",
  // registrationType
  "registration type": "registrationType",
  registration_type: "registrationType",
  registrationtype: "registrationType",
  registration: "registrationType",
  "reg type": "registrationType",
  type: "registrationType",
  // amountPaid
  "amount paid": "amountPaid",
  amount_paid: "amountPaid",
  amountpaid: "amountPaid",
  amount: "amountPaid",
  paid: "amountPaid",
  price: "amountPaid",
  cost: "amountPaid",
};

// ── CSV parser ──

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(current.trim());
        current = "";
      } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
        row.push(current.trim());
        current = "";
        if (row.some((c) => c !== "")) rows.push(row);
        row = [];
        if (ch === "\r") i++;
      } else {
        current += ch;
      }
    }
  }

  // last field / row
  row.push(current.trim());
  if (row.some((c) => c !== "")) rows.push(row);

  return rows;
}

function autoDetectMapping(headers: string[]): (FieldKey | "")[] {
  return headers.map((h) => {
    const normalized = h.toLowerCase().trim();
    return COLUMN_ALIASES[normalized] || "";
  });
}

// ── Types ──

interface CourseEvent {
  id: string;
  eventDate: string;
  course?: { title: string; shortCode: string };
  clinic?: { name: string; city: string; state: string };
}

interface CourseOption {
  id: string;
  title: string;
  shortCode: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  clinicsCreated: string[];
  errors: string[];
  eventCreated?: boolean;
  eventId?: string;
}

// ── Component ──

export default function RosterImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV state
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<(FieldKey | "")[]>([]);
  const [dataRows, setDataRows] = useState<string[][]>([]);

  // Options
  const [events, setEvents] = useState<CourseEvent[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [eventMode, setEventMode] = useState<"existing" | "new">("new");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courseDate, setCourseDate] = useState("");
  const [hostClinicName, setHostClinicName] = useState("");
  const [hostClinicCity, setHostClinicCity] = useState("");
  const [hostClinicState, setHostClinicState] = useState("");
  const [createMissingClinics, setCreateMissingClinics] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Import state
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  // Fetch events and courses on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/events").then((r) => r.json()),
      fetch("/api/courses").then((r) => r.json()),
    ])
      .then(([evts, crs]) => {
        setEvents(evts);
        setCourses(crs);
        setLoadingOptions(false);
      })
      .catch(() => {
        toast.error("Failed to load options");
        setLoadingOptions(false);
      });
  }, []);

  const processCSV = useCallback((text: string) => {
    const parsed = parseCSV(text);
    if (parsed.length < 2) {
      toast.error("CSV must have a header row and at least one data row");
      return;
    }

    const hdrs = parsed[0];
    const data = parsed.slice(1);
    const detectedMapping = autoDetectMapping(hdrs);

    setRawRows(parsed);
    setHeaders(hdrs);
    setMapping(detectedMapping);
    setDataRows(data);
    setResult(null);
  }, []);

  const handlePaste = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      if (text.trim()) processCSV(text);
    },
    [processCSV]
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (text) processCSV(text);
      };
      reader.readAsText(file);
    },
    [processCSV]
  );

  const updateMapping = (colIndex: number, value: FieldKey | "") => {
    setMapping((prev) => {
      const next = [...prev];
      next[colIndex] = value;
      return next;
    });
  };

  const handleImport = async () => {
    if (eventMode === "existing" && !selectedEventId) {
      toast.error("Please select a Course Event");
      return;
    }
    if (eventMode === "new") {
      if (!selectedCourseId) {
        toast.error("Please select which course was taught");
        return;
      }
      if (!courseDate) {
        toast.error("Please enter the course date");
        return;
      }
      if (!hostClinicName || !hostClinicCity || !hostClinicState) {
        toast.error("Please enter the host clinic name, city, and state");
        return;
      }
    }

    const firstNameCol = mapping.indexOf("firstName");
    const lastNameCol = mapping.indexOf("lastName");

    if (firstNameCol === -1 || lastNameCol === -1) {
      toast.error("You must map at least First Name and Last Name columns");
      return;
    }

    // Build rows from mapping
    const rows = dataRows.map((row) => {
      const obj: Record<string, string | number | undefined> = {};
      mapping.forEach((field, colIdx) => {
        if (field && row[colIdx] !== undefined) {
          if (field === "amountPaid") {
            const cleaned = row[colIdx].replace(/[$,]/g, "");
            obj[field] = parseFloat(cleaned) || 0;
          } else if (field === "registrationType") {
            const val = row[colIdx].toUpperCase().trim();
            if (val === "PAID" || val === "FREE_HOST_SEAT" || val === "COMP") {
              obj[field] = val;
            }
          } else {
            obj[field] = row[colIdx];
          }
        }
      });
      return obj;
    });

    setImporting(true);
    setResult(null);

    try {
      const payload: Record<string, unknown> = {
        rows,
        createMissingClinics,
      };

      if (eventMode === "existing") {
        payload.courseEventId = selectedEventId;
      } else {
        payload.createEvent = {
          courseId: selectedCourseId,
          eventDate: courseDate,
          clinicName: hostClinicName,
          clinicCity: hostClinicCity,
          clinicState: hostClinicState,
        };
      }

      const res = await fetch("/api/attendees/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: ImportResult = await res.json();

      if (!res.ok) {
        toast.error((data as unknown as { error: string }).error || "Import failed");
        return;
      }

      setResult(data);
      toast.success(`Imported ${data.imported} attendees`);
    } catch {
      toast.error("Network error during import");
    } finally {
      setImporting(false);
    }
  };

  const previewRows = dataRows.slice(0, 5);
  const hasParsedData = headers.length > 0 && dataRows.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-[#D7D3CD]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Roster Import
        </h1>
        <p className="mt-1 text-sm text-[#B9B6AF]">
          Import attendee rosters from CSV data
        </p>
      </div>

      {/* CSV Input Card */}
      <div className="bg-[#2C2828] border border-[rgba(215,211,205,0.07)] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label
            className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            CSV Data
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#8FBDA3]/10 text-[#8FBDA3] hover:bg-[#8FBDA3]/20 transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload .csv
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
        <textarea
          placeholder="Paste CSV data here (include header row)..."
          rows={8}
          onChange={handlePaste}
          className="w-full rounded-lg border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-4 py-3 text-sm text-[#D7D3CD] placeholder:text-[#B9B6AF]/40 focus:outline-none focus:ring-1 focus:ring-[#8FBDA3]/40 font-mono resize-y"
        />
        {hasParsedData && (
          <div className="flex items-center gap-2 text-xs text-[#8FBDA3]">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Parsed {dataRows.length} rows with {headers.length} columns
          </div>
        )}
      </div>

      {/* Column Mapping Preview */}
      {hasParsedData && (
        <div className="bg-[#2C2828] border border-[rgba(215,211,205,0.07)] rounded-xl p-6 space-y-4">
          <label
            className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Column Mapping Preview
          </label>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="text-left pb-2 pr-4 min-w-[140px]">
                      <div className="space-y-1.5">
                        <span className="block text-xs text-[#B9B6AF]/60 truncate">
                          {h}
                        </span>
                        <select
                          value={mapping[i] || ""}
                          onChange={(e) =>
                            updateMapping(i, e.target.value as FieldKey | "")
                          }
                          className="w-full rounded-md border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-2 py-1.5 text-xs text-[#D7D3CD] focus:outline-none focus:ring-1 focus:ring-[#8FBDA3]/40"
                        >
                          <option value="">-- Skip --</option>
                          {FIELD_OPTIONS.map((f) => (
                            <option key={f.key} value={f.key}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, ri) => (
                  <tr
                    key={ri}
                    className="border-t border-[rgba(215,211,205,0.04)]"
                  >
                    {headers.map((_, ci) => (
                      <td
                        key={ci}
                        className="py-1.5 pr-4 text-xs text-[#B9B6AF] truncate max-w-[180px]"
                      >
                        {row[ci] || ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {previewRows.length < dataRows.length && (
            <p className="text-[11px] text-[#B9B6AF]/50">
              Showing first {previewRows.length} of {dataRows.length} rows
            </p>
          )}
        </div>
      )}

      {/* Options */}
      {hasParsedData && (
        <div className="bg-[#2C2828] border border-[rgba(215,211,205,0.07)] rounded-xl p-6 space-y-5">
          <label
            className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Import Options
          </label>

          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEventMode("new")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                eventMode === "new"
                  ? "bg-[#8FBDA3]/15 text-[#8FBDA3] border border-[#8FBDA3]/30"
                  : "bg-[#231F20] text-[#B9B6AF] border border-[rgba(215,211,205,0.07)] hover:text-[#D7D3CD]"
              }`}
            >
              New Course Date
            </button>
            <button
              type="button"
              onClick={() => setEventMode("existing")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                eventMode === "existing"
                  ? "bg-[#8FBDA3]/15 text-[#8FBDA3] border border-[#8FBDA3]/30"
                  : "bg-[#231F20] text-[#B9B6AF] border border-[rgba(215,211,205,0.07)] hover:text-[#D7D3CD]"
              }`}
            >
              Existing Event
            </button>
          </div>

          {eventMode === "new" ? (
            <div className="space-y-4">
              {/* Course selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#B9B6AF]">Which course was taught?</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-3 py-2.5 text-sm text-[#D7D3CD] focus:outline-none focus:ring-1 focus:ring-[#8FBDA3]/40"
                >
                  <option value="">
                    {loadingOptions ? "Loading..." : "-- Select Course --"}
                  </option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.shortCode} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course date */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#B9B6AF]">Course date</label>
                <input
                  type="date"
                  value={courseDate}
                  onChange={(e) => setCourseDate(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-3 py-2.5 text-sm text-[#D7D3CD] focus:outline-none focus:ring-1 focus:ring-[#8FBDA3]/40"
                />
              </div>

              {/* Host clinic info */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#B9B6AF]">Host clinic (where it was held)</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Clinic name"
                    value={hostClinicName}
                    onChange={(e) => setHostClinicName(e.target.value)}
                    className="rounded-lg border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-3 py-2.5 text-sm text-[#D7D3CD] placeholder:text-[#B9B6AF]/40 focus:outline-none focus:ring-1 focus:ring-[#8FBDA3]/40"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={hostClinicCity}
                    onChange={(e) => setHostClinicCity(e.target.value)}
                    className="rounded-lg border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-3 py-2.5 text-sm text-[#D7D3CD] placeholder:text-[#B9B6AF]/40 focus:outline-none focus:ring-1 focus:ring-[#8FBDA3]/40"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={hostClinicState}
                    onChange={(e) => setHostClinicState(e.target.value)}
                    className="rounded-lg border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-3 py-2.5 text-sm text-[#D7D3CD] placeholder:text-[#B9B6AF]/40 focus:outline-none focus:ring-1 focus:ring-[#8FBDA3]/40"
                  />
                </div>
                <p className="text-[11px] text-[#B9B6AF]/50">
                  If this clinic isn&apos;t in your database yet, it&apos;ll be created automatically.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs text-[#B9B6AF]">Course Event</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full rounded-lg border border-[rgba(215,211,205,0.07)] bg-[#231F20] px-3 py-2.5 text-sm text-[#D7D3CD] focus:outline-none focus:ring-1 focus:ring-[#8FBDA3]/40"
              >
                <option value="">
                  {loadingOptions ? "Loading events..." : "-- Select a Course Event --"}
                </option>
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.course?.shortCode || "Event"} &mdash;{" "}
                    {evt.clinic?.name || "Unknown Clinic"} (
                    {new Date(evt.eventDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Auto-create clinics */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={createMissingClinics}
              onChange={(e) => setCreateMissingClinics(e.target.checked)}
              className="rounded border-[rgba(215,211,205,0.15)] bg-[#231F20] text-[#8FBDA3] focus:ring-[#8FBDA3]/40 h-4 w-4"
            />
            <span className="text-sm text-[#D7D3CD]">
              Auto-create clinics not found in database
            </span>
          </label>

          {/* Import button */}
          <button
            type="button"
            disabled={
              importing ||
              (eventMode === "existing" && !selectedEventId) ||
              (eventMode === "new" && (!selectedCourseId || !courseDate || !hostClinicName))
            }
            onClick={handleImport}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {importing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {importing ? "Importing..." : `Import ${dataRows.length} Attendees`}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-[#2C2828] border border-[rgba(215,211,205,0.07)] rounded-xl p-6 space-y-4">
          <label
            className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Import Results
          </label>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#231F20] rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <CheckCircle2 className="h-4 w-4 text-[#8FBDA3]" />
                <span className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF]">
                  Imported
                </span>
              </div>
              <span className="text-2xl font-bold text-[#8FBDA3]">
                {result.imported}
              </span>
            </div>
            <div className="bg-[#231F20] rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <AlertCircle className="h-4 w-4 text-[#B9B6AF]" />
                <span className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF]">
                  Skipped
                </span>
              </div>
              <span className="text-2xl font-bold text-[#D7D3CD]">
                {result.skipped}
              </span>
            </div>
            <div className="bg-[#231F20] rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <FileSpreadsheet className="h-4 w-4 text-[#8FBDA3]" />
                <span className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF]">
                  Clinics Created
                </span>
              </div>
              <span className="text-2xl font-bold text-[#D7D3CD]">
                {result.clinicsCreated.length}
              </span>
            </div>
          </div>

          {result.clinicsCreated.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-[#8FBDA3]">
                New clinics created:
              </p>
              <ul className="space-y-0.5">
                {result.clinicsCreated.map((c, i) => (
                  <li key={i} className="text-xs text-[#B9B6AF]">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.errors.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-red-400">
                Errors ({result.errors.length}):
              </p>
              <ul className="space-y-0.5 max-h-40 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-xs text-red-400/80">
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
