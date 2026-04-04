"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ClinicKanban } from "@/components/clinic-kanban";

interface Clinic {
  id: string;
  name: string;
  city: string;
  state: string;
  status: string;
  source: string | null;
  lastContactDate: string | null;
  tags: string[];
  _count?: { contacts: number };
}

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchClinics = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/clinics?${params.toString()}`);
      const data = await res.json();
      setClinics(data);
    } catch (error) {
      console.error("Failed to fetch clinics:", error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  async function handleStatusChange(id: string, status: string) {
    try {
      await fetch(`/api/clinics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchClinics();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Clinics</h1>
        <Link href="/clinics/new">
          <Button className="bg-[#8FBDA3] hover:bg-[#8FBDA3]/80 text-black">
            Add Clinic
          </Button>
        </Link>
      </div>

      <Input
        placeholder="Search clinics..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm bg-[#2C2828] border-gray-700 text-white"
      />

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <Tabs defaultValue="board">
          <TabsList className="bg-[#2C2828]">
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="mt-4">
            <ClinicKanban
              clinics={clinics}
              onStatusChange={handleStatusChange}
            />
          </TabsContent>

          <TabsContent value="table" className="mt-4">
            <div className="rounded-lg border border-gray-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#2C2828]">
                  <tr>
                    <th className="text-left p-3 text-gray-400 font-medium">
                      Name
                    </th>
                    <th className="text-left p-3 text-gray-400 font-medium">
                      City
                    </th>
                    <th className="text-left p-3 text-gray-400 font-medium">
                      State
                    </th>
                    <th className="text-left p-3 text-gray-400 font-medium">
                      Status
                    </th>
                    <th className="text-left p-3 text-gray-400 font-medium">
                      Source
                    </th>
                    <th className="text-left p-3 text-gray-400 font-medium">
                      Last Contact
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clinics.map((clinic) => (
                    <tr
                      key={clinic.id}
                      className="border-t border-gray-800 hover:bg-[#2C2828]/50"
                    >
                      <td className="p-3">
                        <Link
                          href={`/clinics/${clinic.id}`}
                          className="text-white hover:text-[#8FBDA3]"
                        >
                          {clinic.name}
                        </Link>
                      </td>
                      <td className="p-3 text-gray-400">{clinic.city}</td>
                      <td className="p-3 text-gray-400">{clinic.state}</td>
                      <td className="p-3">
                        <Badge variant="secondary">{clinic.status}</Badge>
                      </td>
                      <td className="p-3 text-gray-400">
                        {clinic.source || "-"}
                      </td>
                      <td className="p-3 text-gray-400">
                        {clinic.lastContactDate
                          ? new Date(
                              clinic.lastContactDate
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                  {clinics.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-6 text-center text-gray-500"
                      >
                        No clinics found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
