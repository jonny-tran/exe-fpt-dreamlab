"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Edit2,
  Trash2,
  GripVertical,
  CheckCircle2,
  Circle,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  trip_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  assignee_id: string | null;
  assignee_role: string | null;
  done: boolean | null;
  item_order: number;
  created_at: string;
  updated_at: string;
}

interface SortableChecklistItemProps {
  item: ChecklistItem;
  onToggle: (done: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function SortableChecklistItem({
  item,
  onToggle,
  onEdit,
  onDelete,
}: SortableChecklistItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isDone = item.done === true;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "shadow-lg" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Checkbox */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(!isDone)}
            className="h-8 w-8 p-0 hover:bg-transparent"
          >
            {isDone ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
          </Button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={`font-medium ${isDone ? "line-through text-muted-foreground" : ""}`}
            >
              {item.title}
            </h3>
            {item.description && (
              <p
                className={`text-sm text-muted-foreground mt-1 ${isDone ? "line-through" : ""}`}
              >
                {item.description}
              </p>
            )}
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
      </CardContent>
    </Card>
  );
}
