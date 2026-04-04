import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    LEAD: "bg-zinc-600",
    CONTACTED: "bg-blue-600",
    INTERESTED: "bg-amber-600",
    BOOKED: "bg-purple-600",
    ACTIVE: "bg-mint",
    CHURNED: "bg-red-600",
    TENTATIVE: "bg-zinc-600",
    CONFIRMED: "bg-blue-600",
    DEPOSIT_RECEIVED: "bg-purple-600",
    COMPLETED: "bg-mint",
    CANCELLED: "bg-red-600",
  };
  return colors[status] || "bg-zinc-600";
}
