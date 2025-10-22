"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Clock, MapPin, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface ItineraryBlock {
  id: string;
  trip_id: string;
  activity_id: string | null;
  title: string;
  start_time: string;
  end_time: string;
  location: string | null;
  notes: string | null;
  block_order: number;
  created_at: string;
  updated_at: string;
}

interface SortableItineraryBlockProps {
  block: ItineraryBlock;
  onEdit: () => void;
  onDelete: () => void;
}

export function SortableItineraryBlock({
  block,
  onEdit,
  onDelete,
}: SortableItineraryBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const startTime = new Date(block.start_time);
  const endTime = new Date(block.end_time);
  const duration = Math.round(
    (endTime.getTime() - startTime.getTime()) / (1000 * 60)
  ); // minutes

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "shadow-lg" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Drag handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="flex-1">
              <CardTitle className="text-lg">{block.title}</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {format(startTime, "HH:mm", { locale: vi })} -{" "}
                    {format(endTime, "HH:mm", { locale: vi })}
                  </span>
                  <Badge variant="secondary" className="ml-2">
                    {duration} phút
                  </Badge>
                </div>
                {block.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{block.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {block.notes && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">{block.notes}</p>
        </CardContent>
      )}
    </Card>
  );
}
