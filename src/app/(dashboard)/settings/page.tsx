"use client";

import { Settings, User, DollarSign, Mail, Plug, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function StatusDot({ color }: { color: "green" | "red" | "yellow" }) {
  const colors = {
    green: "bg-emerald-400",
    red: "bg-red-400",
    yellow: "bg-yellow-400",
  };
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${colors[color]}`}
    />
  );
}

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-5 w-5 text-[#8FBDA3]" />
      <h2
        className="text-lg font-semibold text-[#D7D3CD]"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        {title}
      </h2>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-[#B9B6AF]">{label}</span>
      <span className="text-sm text-[#D7D3CD] font-medium">{value}</span>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-[#D7D3CD] tracking-tight"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Settings
        </h1>
        <p className="text-sm text-[#B9B6AF] mt-1">
          Account, defaults, and system configuration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account */}
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
          <CardContent>
            <SectionHeading icon={User} title="Account" />
            <Separator className="mb-4 bg-[rgba(215,211,205,0.07)]" />
            <div className="space-y-1">
              <InfoRow label="Name" value="Joey Glenn, DC, CSCS" />
              <InfoRow label="Business" value="SIDELINE Continuing Education" />
              <InfoRow label="Email" value="joey@sidelinece.com" />
              <InfoRow
                label="Role"
                value={
                  <Badge
                    variant="outline"
                    className="border-[#8FBDA3]/30 text-[#8FBDA3] text-xs"
                  >
                    Owner / Lead Instructor
                  </Badge>
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
          <CardContent>
            <SectionHeading icon={Mail} title="Email Configuration" />
            <Separator className="mb-4 bg-[rgba(215,211,205,0.07)]" />
            <div className="space-y-1">
              <InfoRow
                label="Status"
                value={
                  <span className="flex items-center gap-2">
                    <StatusDot color="green" />
                    <span className="text-sm text-emerald-400">Configured</span>
                  </span>
                }
              />
              <InfoRow label="Gmail User" value="j****@gmail.com" />
              <InfoRow label="Provider" value="Gmail SMTP" />
            </div>
            <p className="text-xs text-[#B9B6AF]/60 mt-4">
              Emails are sent via Gmail SMTP using app-specific credentials.
            </p>
          </CardContent>
        </Card>

        {/* Business Defaults */}
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)] lg:col-span-2">
          <CardContent>
            <SectionHeading icon={DollarSign} title="Business Defaults" />
            <Separator className="mb-4 bg-[rgba(215,211,205,0.07)]" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              <DefaultItem label="Default Public Price" value="$599" />
              <DefaultItem label="Early Bird Price" value="$499" />
              <DefaultItem label="Early Bird Cutoff" value="30 days" />
              <DefaultItem label="Host Kickback" value="$50/head" />
              <DefaultItem label="Default Private Rate" value="$10,000" />
              <DefaultItem label="Min Attendees (Public)" value="8" />
              <DefaultItem label="Max Attendees" value="30" />
            </div>
            <p className="text-xs text-[#B9B6AF]/60 mt-6">
              These defaults are applied when scheduling new events.
            </p>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
          <CardContent>
            <SectionHeading icon={Plug} title="Integrations" />
            <Separator className="mb-4 bg-[rgba(215,211,205,0.07)]" />
            <div className="space-y-1">
              <InfoRow
                label="Supabase"
                value={
                  <span className="flex items-center gap-2">
                    <StatusDot color="green" />
                    <span className="text-sm text-emerald-400">Connected</span>
                  </span>
                }
              />
              <InfoRow
                label="Stripe"
                value={
                  <span className="flex items-center gap-2">
                    <StatusDot color="red" />
                    <span className="text-sm text-red-400">Not Connected</span>
                    <Badge
                      variant="outline"
                      className="border-[#B9B6AF]/20 text-[#B9B6AF]/60 text-[10px] ml-1"
                    >
                      Coming soon
                    </Badge>
                  </span>
                }
              />
              <InfoRow
                label="Resend"
                value={
                  <span className="flex items-center gap-2">
                    <StatusDot color="yellow" />
                    <span className="text-sm text-yellow-400">
                      Not Connected
                    </span>
                  </span>
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="bg-[#2C2828] border-[rgba(215,211,205,0.07)]">
          <CardContent>
            <SectionHeading icon={Info} title="System Info" />
            <Separator className="mb-4 bg-[rgba(215,211,205,0.07)]" />
            <div className="space-y-1">
              <InfoRow label="Version" value="v0.1.0" />
              <InfoRow label="Framework" value="Next.js 16" />
              <InfoRow label="Database" value="PostgreSQL (Supabase)" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DefaultItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-[#B9B6AF]/80">{label}</p>
      <p
        className="text-lg font-semibold text-[#D7D3CD]"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        {value}
      </p>
    </div>
  );
}
