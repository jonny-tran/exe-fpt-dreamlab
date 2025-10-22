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
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getChecklistItems,
  updateChecklistItemOrder,
  updateChecklistItem,
  deleteChecklistItem,
  addChecklistItem,
  toggleChecklistItem,
} from "./actions";
import { SortableChecklistItem } from "./sortable-item";

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

export default function ChecklistClient({ tripId }: { tripId: string }) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load checklist items
  useEffect(() => {
    loadItems();
  }, [tripId]);

  const loadItems = async () => {
    try {
      const result = await getChecklistItems(tripId);
      if (result.success) {
        setItems(result.data || []);
      } else {
        toast.error(result.error || "Không thể tải danh sách công việc");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi tải danh sách công việc");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Cập nhật item_order trong database
      const updates = newItems.map((item, index) => ({
        id: item.id,
        item_order: index,
      }));

      const result = await updateChecklistItemOrder(tripId, updates);
      if (!result.success) {
        // Rollback UI nếu lỗi
        setItems(items);
        toast.error(result.error || "Không thể cập nhật thứ tự");
      }
    }
  };

  const handleToggleItem = async (itemId: string, done: boolean) => {
    const result = await toggleChecklistItem(tripId, itemId, done);
    if (result.success) {
      // Cập nhật UI
      setItems(
        items.map((item) => (item.id === itemId ? { ...item, done } : item))
      );
    } else {
      toast.error(result.error || "Không thể cập nhật trạng thái");
    }
  };

  const handleEditItem = (item: ChecklistItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (formData: FormData) => {
    if (!editingItem) return;

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    const result = await updateChecklistItem(tripId, editingItem.id, {
      title,
      description: description || null,
    });

    if (result.success) {
      toast.success("Đã cập nhật công việc");
      setIsEditDialogOpen(false);
      setEditingItem(null);
      loadItems();
    } else {
      toast.error(result.error || "Không thể cập nhật công việc");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa công việc này?")) return;

    const result = await deleteChecklistItem(tripId, itemId);
    if (result.success) {
      toast.success("Đã xóa công việc");
      loadItems();
    } else {
      toast.error(result.error || "Không thể xóa công việc");
    }
  };

  const handleAddItem = async (formData: FormData) => {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    const result = await addChecklistItem(tripId, {
      title,
      description: description || null,
      done: false,
      item_order: items.length + 1,
    });

    if (result.success) {
      toast.success("Đã thêm công việc mới");
      setIsAddDialogOpen(false);
      loadItems();
    } else {
      toast.error(result.error || "Không thể thêm công việc");
    }
  };

  const completedCount = items.filter((item) => item.done).length;
  const totalCount = items.length;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="text-center py-8">Đang tải danh sách công việc...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header với progress */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Danh sách công việc</h2>
          <p className="text-muted-foreground">
            {completedCount}/{totalCount} công việc đã hoàn thành (
            {Math.round(progressPercentage)}%)
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Thêm công việc
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm công việc mới</DialogTitle>
            </DialogHeader>
            <form action={handleAddItem} className="space-y-4">
              <div>
                <Label htmlFor="title">Tên công việc</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Nhập tên công việc..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Mô tả (tùy chọn)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Nhập mô tả chi tiết..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit">Thêm công việc</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Danh sách items với drag & drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {items.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">Chưa có công việc nào</p>
                  <Button
                    className="mt-4"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm công việc đầu tiên
                  </Button>
                </CardContent>
              </Card>
            ) : (
              items.map((item) => (
                <SortableChecklistItem
                  key={item.id}
                  item={item}
                  onToggle={(done) => handleToggleItem(item.id, done)}
                  onEdit={() => handleEditItem(item)}
                  onDelete={() => handleDeleteItem(item.id)}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Dialog chỉnh sửa item */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa công việc</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <form action={handleSaveEdit} className="space-y-4">
              <div>
                <Label htmlFor="title">Tên công việc</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingItem.title}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingItem.description || ""}
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
