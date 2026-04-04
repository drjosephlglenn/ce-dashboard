"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const clinicSchema = z.object({
  name: z.string().min(1, "Name is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  type: z.string().optional(),
  source: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  estimatedSize: z.string().optional(),
  notes: z.string().optional(),
});

type ClinicFormData = z.infer<typeof clinicSchema>;

export default function NewClinicPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
  });

  async function onSubmit(data: ClinicFormData) {
    try {
      const res = await fetch("/api/clinics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create clinic");

      router.push("/clinics");
    } catch (error) {
      console.error("Error creating clinic:", error);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Add New Clinic</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            {...register("name")}
            className="bg-[#2C2828] border-gray-700 text-white"
          />
          {errors.name && (
            <p className="text-red-400 text-xs">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              {...register("city")}
              className="bg-[#2C2828] border-gray-700 text-white"
            />
            {errors.city && (
              <p className="text-red-400 text-xs">{errors.city.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              {...register("state")}
              className="bg-[#2C2828] border-gray-700 text-white"
            />
            {errors.state && (
              <p className="text-red-400 text-xs">{errors.state.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select onValueChange={(val) => setValue("type", val as string)}>
              <SelectTrigger className="bg-[#2C2828] border-gray-700 text-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PT">Physical Therapy</SelectItem>
                <SelectItem value="CHIRO">Chiropractic</SelectItem>
                <SelectItem value="ORTHO">Orthopedic</SelectItem>
                <SelectItem value="SPORTS_MED">Sports Medicine</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Source</Label>
            <Select onValueChange={(val) => setValue("source", val as string)}>
              <SelectTrigger className="bg-[#2C2828] border-gray-700 text-white">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REFERRAL">Referral</SelectItem>
                <SelectItem value="COLD_OUTREACH">Cold Outreach</SelectItem>
                <SelectItem value="CONFERENCE">Conference</SelectItem>
                <SelectItem value="WEBSITE">Website</SelectItem>
                <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              {...register("phone")}
              className="bg-[#2C2828] border-gray-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              {...register("website")}
              className="bg-[#2C2828] border-gray-700 text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedSize">Estimated Size</Label>
          <Input
            id="estimatedSize"
            {...register("estimatedSize")}
            placeholder="e.g., 5-10 providers"
            className="bg-[#2C2828] border-gray-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...register("notes")}
            rows={4}
            className="bg-[#2C2828] border-gray-700 text-white"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#8FBDA3] hover:bg-[#8FBDA3]/80 text-black"
          >
            {isSubmitting ? "Creating..." : "Create Clinic"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/clinics")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
