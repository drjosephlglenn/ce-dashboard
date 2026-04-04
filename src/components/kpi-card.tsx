import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
}

export function KpiCard({ title, value, subtitle, icon: Icon, trend }: KpiCardProps) {
  return (
    <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] tracking-[0.16em] uppercase text-[#B9B6AF] mb-2">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-[#D7D3CD]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{value}</p>
            {subtitle && <p className="text-sm text-[#B9B6AF] mt-1">{subtitle}</p>}
            {trend && (
              <p className={`text-xs mt-2 ${trend.positive ? "text-[#8FBDA3]" : "text-red-400"}`}>
                {trend.positive ? "↑" : "↓"} {trend.value}
              </p>
            )}
          </div>
          <div className="p-2.5 rounded-lg bg-[#8FBDA3]/10">
            <Icon className="h-5 w-5 text-[#8FBDA3]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
