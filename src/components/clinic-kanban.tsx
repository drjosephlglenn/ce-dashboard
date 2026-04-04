"use client";

import { useState } from "react";
import {
  DndContext,
  closestCorners,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ClinicCard } from "@/components/clinic-card";

interface Clinic {
  id: string;
  name: string;
  city: string;
  state: string;
  status: string;
  source: string | null;
  lastContactDate: string | null;
  tags: string[];
}

interface ClinicKanbanProps {
  clinics: Clinic[];
  onStatusChange: (id: string, status: string) => void;
}

const COLUMNS = [
  { id: "LEAD", label: "Lead", color: "#666" },
  { id: "CONTACTED", label: "Contacted", color: "#3B82F6" },
  { id: "INTERESTED", label: "Interested", color: "#D97706" },
  { id: "BOOKED", label: "Booked", color: "#9333EA" },
  { id: "ACTIVE", label: "Active", color: "#8FBDA3" },
  { id: "CHURNED", label: "Churned", color: "#EF4444" },
];

function SortableCard({ clinic }: { clinic: Clinic }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: clinic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ClinicCard clinic={clinic} />
    </div>
  );
}

function KanbanColumn({
  id,
  label,
  color,
  clinics,
}: {
  id: string;
  label: string;
  color: string;
  clinics: Clinic[];
}) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex-1 min-w-[250px] max-w-[300px]">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <h3 className="text-sm font-semibold text-white">{label}</h3>
        <span className="text-xs text-gray-500 ml-auto">
          {clinics.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className="space-y-2 min-h-[200px] rounded-lg bg-[#1E1B1B] p-2"
      >
        <SortableContext
          items={clinics.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {clinics.map((clinic) => (
            <SortableCard key={clinic.id} clinic={clinic} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export function ClinicKanban({ clinics, onStatusChange }: ClinicKanbanProps) {
  const [activeClinic, setActiveClinic] = useState<Clinic | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const clinic = clinics.find((c) => c.id === event.active.id);
    setActiveClinic(clinic || null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveClinic(null);

    if (!over) return;

    const overId = over.id as string;
    const activeClinic = clinics.find((c) => c.id === active.id);
    if (!activeClinic) return;

    // Check if dropped over a column
    const targetColumn = COLUMNS.find((col) => col.id === overId);
    if (targetColumn && targetColumn.id !== activeClinic.status) {
      onStatusChange(activeClinic.id, targetColumn.id);
      return;
    }

    // Check if dropped over a card in a different column
    const targetClinic = clinics.find((c) => c.id === overId);
    if (targetClinic && targetClinic.status !== activeClinic.status) {
      onStatusChange(activeClinic.id, targetClinic.status);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            label={column.label}
            color={column.color}
            clinics={clinics.filter((c) => c.status === column.id)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeClinic ? <ClinicCard clinic={activeClinic} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
