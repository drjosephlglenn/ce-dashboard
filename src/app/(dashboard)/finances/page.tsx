"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Plus, Receipt, Pencil, Trash2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Summary {
  ytdRevenue: number;
  ytdExpenses: number;
  netIncome: number;
  revenueByMonth: { month: string; revenue: number; expenses: number }[];
  revenueByType: Record<string, number>;
  outstandingTotal: number;
  outstandingCount: number;
  revenueGoal: number;
}

interface FinancialRecord {
  id: string;
  type: string;
  amount: string;
  date: string;
  description: string;
  category: string;
  paymentMethod: string;
  isPaid: boolean;
  courseEventId: string | null;
  courseEvent?: { id: string; course: { title: string }; clinic: { name: string }; eventDate: string } | null;
}

interface CourseEventOption {
  id: string;
  eventDate: string;
  course: { title: string; shortCode: string };
  clinic: { name: string; city: string; state: string };
}

const PIE_COLORS = ["#8FBDA3", "#7D9C9A", "#B9B6AF", "#D7D3CD", "#363130"];

const REVENUE_TYPES = [
  { value: "COURSE_REVENUE", label: "Course Revenue" },
  { value: "CONTRACT_TEACHING_FEE", label: "Contract Teaching Fee" },
  { value: "ONLINE_SALE", label: "Online Sale" },
  { value: "DEPOSIT", label: "Deposit" },
];

const EXPENSE_TYPES = [
  { value: "TRAVEL_EXPENSE", label: "Travel" },
  { value: "OPERATING_EXPENSE", label: "Operating" },
  { value: "INSTRUCTOR_PAY", label: "Instructor Pay" },
  { value: "HOST_INCENTIVE_PAYOUT", label: "Host Incentive" },
];

const PAYMENT_METHODS = ["CHECK", "BANK_TRANSFER", "CREDIT_CARD", "CASH", "STRIPE", "OTHER"];

export default function FinancesPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [events, setEvents] = useState<CourseEventOption[]>([]);
  const [revenueOpen, setRevenueOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<FinancialRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  async function fetchData() {
    const [summaryRes, recordsRes, eventsRes] = await Promise.all([
      fetch("/api/finances/summary"),
      fetch("/api/finances"),
      fetch("/api/events"),
    ]);
    setSummary(await summaryRes.json());
    setRecords(await recordsRes.json());
    setEvents(await eventsRes.json());
  }

  useEffect(() => { fetchData(); }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>, isExpense: boolean) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const amount = parseFloat(fd.get("amount") as string) || 0;
    const courseEventId = fd.get("courseEventId") as string;
    const body: Record<string, unknown> = {
      type: fd.get("type") || (isExpense ? "OPERATING_EXPENSE" : "COURSE_REVENUE"),
      amount: isExpense ? -Math.abs(amount) : Math.abs(amount),
      date: fd.get("date") || new Date().toISOString(),
      description: fd.get("description") || "",
      category: fd.get("category") || "",
      paymentMethod: fd.get("paymentMethod") || "OTHER",
      isPaid: true,
      taxDeductible: isExpense,
    };
    if (courseEventId) body.courseEventId = courseEventId;
    const res = await fetch("/api/finances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) {
      toast.success(isExpense ? "Expense logged" : "Revenue logged");
      setRevenueOpen(false);
      setExpenseOpen(false);
      fetchData();
    } else {
      toast.error("Failed to save");
    }
  }

  function openEdit(record: FinancialRecord) {
    setEditRecord(record);
    setEditOpen(true);
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editRecord) return;
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const amount = parseFloat(fd.get("amount") as string) || 0;
    const courseEventId = (fd.get("courseEventId") as string) || null;
    const isExpense = [...EXPENSE_TYPES.map(t => t.value), "REFUND"].includes(fd.get("type") as string);

    const body: Record<string, unknown> = {
      type: fd.get("type"),
      amount: isExpense ? -Math.abs(amount) : Math.abs(amount),
      date: fd.get("date"),
      description: fd.get("description") || "",
      category: fd.get("category") || "",
      paymentMethod: fd.get("paymentMethod") || "OTHER",
      courseEventId: courseEventId || null,
    };

    const res = await fetch(`/api/finances/${editRecord.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Transaction updated");
      setEditOpen(false);
      setEditRecord(null);
      fetchData();
    } else {
      toast.error("Failed to update");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/finances/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Transaction deleted");
      setDeleteConfirm(null);
      setEditOpen(false);
      setEditRecord(null);
      fetchData();
    } else {
      toast.error("Failed to delete");
    }
  }

  const progressPct = summary ? Math.min((summary.ytdRevenue / summary.revenueGoal) * 100, 100) : 0;

  const pieData = summary
    ? Object.entries(summary.revenueByType).map(([name, value]) => ({
        name: name.replace(/_/g, " "),
        value,
      }))
    : [];

  const isRevenueType = (type: string) => REVENUE_TYPES.some(t => t.value === type);

  function formatEventLabel(ev: CourseEventOption) {
    const date = new Date(ev.eventDate).toLocaleDateString();
    return `${ev.course.title} @ ${ev.clinic.name} (${date})`;
  }

  function TransactionForm({ isExpense, isEdit }: { isExpense: boolean; isEdit?: boolean }) {
    const record = isEdit ? editRecord : null;
    const absAmount = record ? Math.abs(Number(record.amount)) : undefined;
    const dateStr = record ? new Date(record.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-[#B9B6AF]">Amount *</Label>
            <Input
              name="amount"
              type="number"
              step="0.01"
              required
              defaultValue={absAmount}
              placeholder={isExpense ? "500" : "10000"}
              className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
            />
          </div>
          <div>
            <Label className="text-[#B9B6AF]">Date</Label>
            <Input
              name="date"
              type="date"
              defaultValue={dateStr}
              className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
            />
          </div>
        </div>

        <div>
          <Label className="text-[#B9B6AF]">Type</Label>
          <select
            name="type"
            defaultValue={record?.type || (isExpense ? "OPERATING_EXPENSE" : "COURSE_REVENUE")}
            className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm"
          >
            {(isEdit ? [...REVENUE_TYPES, ...EXPENSE_TYPES] : isExpense ? EXPENSE_TYPES : REVENUE_TYPES).map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-[#B9B6AF]">Associated Course Event</Label>
          <select
            name="courseEventId"
            defaultValue={record?.courseEventId || ""}
            className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm"
          >
            <option value="">None (general)</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {formatEventLabel(ev)}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-[#B9B6AF] mt-1">Links this transaction to a specific course and clinic</p>
        </div>

        <div>
          <Label className="text-[#B9B6AF]">Description</Label>
          <Textarea
            name="description"
            rows={2}
            defaultValue={record?.description || ""}
            placeholder={isExpense ? "e.g., Flight to Dallas" : "e.g., Contract teaching fee - BFR L1"}
            className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
          />
        </div>

        {isExpense && (
          <div>
            <Label className="text-[#B9B6AF]">Category</Label>
            <Input
              name="category"
              defaultValue={record?.category || ""}
              placeholder="e.g., Airfare, Hotel, Marketing"
              className="bg-[#363130] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]"
            />
          </div>
        )}

        <div>
          <Label className="text-[#B9B6AF]">Payment Method</Label>
          <select
            name="paymentMethod"
            defaultValue={record?.paymentMethod || "CHECK"}
            className="w-full h-9 rounded-md bg-[#363130] border border-[rgba(215,211,205,0.1)] text-[#D7D3CD] px-3 text-sm"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#D7D3CD]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Finances
          </h1>
          <p className="text-sm text-[#B9B6AF] mt-1">Revenue, expenses, and financial tracking</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={revenueOpen} onOpenChange={setRevenueOpen}>
            <DialogTrigger className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90 transition-colors">
              <Plus className="h-4 w-4 mr-2" /> Log Revenue
            </DialogTrigger>
            <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>Log Revenue</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                <TransactionForm isExpense={false} />
                <Button type="submit" disabled={loading} className="w-full bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90">
                  {loading ? "Saving..." : "Log Revenue"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
            <DialogTrigger className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium border border-[rgba(215,211,205,0.15)] text-[#D7D3CD] hover:bg-[#2C2828] transition-colors">
              <Receipt className="h-4 w-4 mr-2" /> Log Expense
            </DialogTrigger>
            <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>Log Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
                <TransactionForm isExpense={true} />
                <Button type="submit" disabled={loading} className="w-full bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90">
                  {loading ? "Saving..." : "Log Expense"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Row */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
            <CardContent className="p-5">
              <p className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF] mb-1">YTD Revenue</p>
              <p className="text-2xl font-bold text-[#8FBDA3]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                {formatCurrency(summary.ytdRevenue)}
              </p>
              <div className="mt-2 h-1.5 bg-[#363130] rounded-full overflow-hidden">
                <div className="h-full bg-[#8FBDA3] rounded-full transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="text-[10px] text-[#B9B6AF] mt-1">{progressPct.toFixed(0)}% of {formatCurrency(summary.revenueGoal)} goal</p>
            </CardContent>
          </Card>
          <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
            <CardContent className="p-5">
              <p className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF] mb-1">YTD Expenses</p>
              <p className="text-2xl font-bold text-red-400" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                {formatCurrency(summary.ytdExpenses)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
            <CardContent className="p-5">
              <p className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF] mb-1">Net Income</p>
              <p className={`text-2xl font-bold ${summary.netIncome >= 0 ? "text-[#8FBDA3]" : "text-red-400"}`} style={{ fontFamily: "var(--font-space-grotesk)" }}>
                {formatCurrency(summary.netIncome)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
            <CardContent className="p-5">
              <p className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF] mb-1">Outstanding</p>
              <p className="text-2xl font-bold text-amber-400" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                {formatCurrency(summary.outstandingTotal)}
              </p>
              <p className="text-[10px] text-[#B9B6AF] mt-1">{summary.outstandingCount} unpaid</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)] lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-[#D7D3CD] mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Revenue by Month
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.revenueByMonth}>
                    <XAxis dataKey="month" tick={{ fill: "#B9B6AF", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#B9B6AF", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ background: "#363130", border: "none", borderRadius: 8, color: "#D7D3CD" }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(v: any) => [formatCurrency(v), ""]}
                    />
                    <Bar dataKey="revenue" fill="#8FBDA3" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} opacity={0.6} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-[#D7D3CD] mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Revenue by Type
              </h2>
              {pieData.length > 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name }) => name}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#363130", border: "none", borderRadius: 8, color: "#D7D3CD" }} // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(v: any) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-sm text-[#B9B6AF]">
                  No revenue data yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Transactions */}
      <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
        <CardContent className="p-6">
          <h2 className="text-sm font-semibold text-[#D7D3CD] mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Recent Transactions
          </h2>
          {records.length === 0 ? (
            <p className="text-sm text-[#B9B6AF] py-8 text-center">No transactions yet. Log your first revenue or expense above.</p>
          ) : (
            <div className="space-y-2">
              {records.slice(0, 20).map((r) => (
                <div
                  key={r.id}
                  onClick={() => openEdit(r)}
                  className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg border-b border-[rgba(215,211,205,0.05)] last:border-0 hover:bg-[#363130]/50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded ${Number(r.amount) >= 0 ? "bg-[#8FBDA3]/10" : "bg-red-500/10"}`}>
                      {Number(r.amount) >= 0 ? <TrendingUp className="h-4 w-4 text-[#8FBDA3]" /> : <TrendingDown className="h-4 w-4 text-red-400" />}
                    </div>
                    <div>
                      <p className="text-sm text-[#D7D3CD]">
                        {r.description || r.type.replace(/_/g, " ")}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-[#B9B6AF]">{formatDate(r.date)} &middot; {r.paymentMethod.replace(/_/g, " ")}</span>
                        {r.courseEvent && (
                          <Badge className="bg-[#8FBDA3]/10 text-[#8FBDA3] border-0 text-[9px]">
                            {r.courseEvent.course.title} @ {r.courseEvent.clinic.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-sm font-medium ${Number(r.amount) >= 0 ? "text-[#8FBDA3]" : "text-red-400"}`}>
                        {Number(r.amount) >= 0 ? "+" : ""}{formatCurrency(r.amount)}
                      </p>
                      {!r.isPaid && <Badge className="bg-amber-500/20 text-amber-400 border-0 text-[9px]">Unpaid</Badge>}
                    </div>
                    <Pencil className="h-3.5 w-3.5 text-[#B9B6AF] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Transaction Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) { setEditRecord(null); setDeleteConfirm(null); } }}>
        <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>Edit Transaction</DialogTitle>
          </DialogHeader>
          {editRecord && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <TransactionForm
                isExpense={!isRevenueType(editRecord.type)}
                isEdit
              />
              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="flex-1 bg-[#8FBDA3] text-[#231F20] hover:bg-[#8FBDA3]/90">
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Dialog open={deleteConfirm === editRecord.id} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setDeleteConfirm(editRecord.id)}
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <DialogContent className="bg-[#2C2828] border-[rgba(215,211,205,0.1)] text-[#D7D3CD]">
                    <DialogHeader>
                      <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>Delete Transaction</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-[#B9B6AF]">Delete this transaction? This cannot be undone.</p>
                    <div className="flex justify-end gap-3 mt-4">
                      <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="text-[#B9B6AF]">
                        Cancel
                      </Button>
                      <Button onClick={() => handleDelete(editRecord.id)} className="bg-red-600 hover:bg-red-700 text-white">
                        Delete
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
