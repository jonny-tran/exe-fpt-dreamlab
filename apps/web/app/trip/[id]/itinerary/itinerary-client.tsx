"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Trash2, Clock, MapPin, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import {
  getItineraryBlocks,
  updateItineraryBlockOrder,
  updateItineraryBlock,
  deleteItineraryBlock,
  addItineraryBlock,
  addActivityToItinerary,
} from "./actions";
import {
  getActivities,
  getActivityCategories,
} from "@/lib/actions/activity-actions";
import { SortableItineraryBlock } from "./sortable-block";
import { ActivityLibrary } from "./activity-library";

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

interface Activity {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  category: string | null;
  cost_level: string | null;
  tags: string[] | null;
}

export default function ItineraryClient({ tripId }: { tripId: string }) {
  const [blocks, setBlocks] = useState<ItineraryBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBlock, setEditingBlock] = useState<ItineraryBlock | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load itinerary blocks
  useEffect(() => {
    loadBlocks();
  }, [tripId]);

  const loadBlocks = async () => {
    try {
      const result = await getItineraryBlocks(tripId);
      if (result.success) {
        setBlocks(result.data || []);
      } else {
        toast.error(result.error || "Không thể tải lịch trình");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi tải lịch trình");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over.id);

      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      setBlocks(newBlocks);

      // Cập nhật block_order trong database
      const updates = newBlocks.map((block, index) => ({
        id: block.id,
        block_order: index,
      }));

      const result = await updateItineraryBlockOrder(tripId, updates);
      if (!result.success) {
        // Rollback UI nếu lỗi
        setBlocks(blocks);
        toast.error(result.error || "Không thể cập nhật thứ tự");
      }
    }
  };

  const handleEditBlock = (block: ItineraryBlock) => {
    setEditingBlock(block);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (formData: FormData) => {
    if (!editingBlock) return;

    const title = formData.get("title") as string;
    const notes = formData.get("notes") as string;
    const location = formData.get("location") as string;

    const result = await updateItineraryBlock(tripId, editingBlock.id, {
      title,
      notes: notes || null,
      location: location || null,
    });

    if (result.success) {
      toast.success("Đã cập nhật hoạt động");
      setIsEditDialogOpen(false);
      setEditingBlock(null);
      loadBlocks();
    } else {
      toast.error(result.error || "Không thể cập nhật hoạt động");
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa hoạt động này?")) return;

    const result = await deleteItineraryBlock(tripId, blockId);
    if (result.success) {
      toast.success("Đã xóa hoạt động");
      loadBlocks();
    } else {
      toast.error(result.error || "Không thể xóa hoạt động");
    }
  };

  const handleAddActivity = async (
    activityId: string,
    startTime: string,
    endTime: string,
    location?: string
  ) => {
    const result = await addActivityToItinerary(
      tripId,
      activityId,
      startTime,
      endTime,
      location
    );
    if (result.success) {
      toast.success("Đã thêm hoạt động vào lịch trình");
      setIsActivityDialogOpen(false);
      loadBlocks();
    } else {
      toast.error(result.error || "Không thể thêm hoạt động");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải lịch trình...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header với nút thêm hoạt động */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Lịch trình chi tiết</h2>
        <Dialog
          open={isActivityDialogOpen}
          onOpenChange={setIsActivityDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Thêm hoạt động
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thư viện hoạt động</DialogTitle>
            </DialogHeader>
            <ActivityLibrary
              onSelectActivity={handleAddActivity}
              tripId={tripId}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Danh sách blocks với drag & drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {blocks.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    Chưa có hoạt động nào trong lịch trình
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setIsActivityDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm hoạt động đầu tiên
                  </Button>
                </CardContent>
              </Card>
            ) : (
              blocks.map((block) => (
                <SortableItineraryBlock
                  key={block.id}
                  block={block}
                  onEdit={() => handleEditBlock(block)}
                  onDelete={() => handleDeleteBlock(block.id)}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Dialog chỉnh sửa block */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa hoạt động</DialogTitle>
          </DialogHeader>
          {editingBlock && (
            <form action={handleSaveEdit} className="space-y-4">
              <div>
                <Label htmlFor="title">Tên hoạt động</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingBlock.title}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Địa điểm</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={editingBlock.location || ""}
                />
              </div>
              <div>
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={editingBlock.notes || ""}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit">Lưu thay đổi</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
