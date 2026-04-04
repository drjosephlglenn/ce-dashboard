"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ClinicCardProps {
  clinic: {
    id: string;
    name: string;
    city: string;
    state: string;
    source: string | null;
    lastContactDate: string | null;
    tags: string[];
  };
}

export function ClinicCard({ clinic }: ClinicCardProps) {
  return (
    <Link href={`/clinics/${clinic.id}`}>
      <Card className="bg-[#2C2828] border-transparent hover:border-[#8FBDA3]/30 transition-colors cursor-pointer p-4 space-y-2">
        <h3 className="font-semibold text-white text-sm truncate">
          {clinic.name}
        </h3>
        <p className="text-xs text-gray-400">
          {clinic.city}, {clinic.state}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {clinic.source && (
            <Badge variant="secondary" className="text-xs">
              {clinic.source}
            </Badge>
          )}
          {clinic.tags?.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        {clinic.lastContactDate && (
          <p className="text-xs text-gray-500">
            Last contact:{" "}
            {new Date(clinic.lastContactDate).toLocaleDateString()}
          </p>
        )}
      </Card>
    </Link>
  );
}
