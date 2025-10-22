"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Database } from "@/lib/database.types";

type ChecklistItem = Database["public"]["Tables"]["checklist_items"]["Row"];
type ChecklistItemInsert =
  Database["public"]["Tables"]["checklist_items"]["Insert"];
type ChecklistItemUpdate =
  Database["public"]["Tables"]["checklist_items"]["Update"];

export interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Lấy tất cả checklist items của một trip
 */
export async function getChecklistItems(
  tripId: string
): Promise<ActionResponse<ChecklistItem[]>> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("checklist_items")
      .select("*")
      .eq("trip_id", tripId)
      .order("item_order", { ascending: true });

    if (error) {
      console.error("Lỗi lấy checklist items:", error);
      return {
        success: false,
        error: "Không thể lấy dữ liệu danh sách công việc",
      };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Lỗi không mong đợi:", error);
    return { success: false, error: "Đã xảy ra lỗi không mong đợi" };
  }
}

/**
 * Cập nhật thứ tự của checklist items (cho drag & drop)
 */
export async function updateChecklistItemOrder(
  tripId: string,
  itemUpdates: { id: string; item_order: number }[]
): Promise<ActionResponse> {
  const supabase = await createClient();

  try {
    // Cập nhật từng item
    const updatePromises = itemUpdates.map(({ id, item_order }) =>
      supabase
        .from("checklist_items")
        .update({ item_order })
        .eq("id", id)
        .eq("trip_id", tripId)
    );

    const results = await Promise.all(updatePromises);

    // Kiểm tra lỗi
    const hasError = results.some((result) => result.error);
    if (hasError) {
      console.error("Lỗi cập nhật thứ tự items:", results);
      return { success: false, error: "Không thể cập nhật thứ tự" };
    }

    revalidatePath(`/trip/${tripId}/checklist`);
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi không mong đợi:", error);
    return { success: false, error: "Đã xảy ra lỗi không mong đợi" };
  }
}

/**
 * Cập nhật trạng thái hoàn thành của checklist item
 */
export async function toggleChecklistItem(
  tripId: string,
  itemId: string,
  done: boolean
): Promise<ActionResponse> {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("checklist_items")
      .update({ done })
      .eq("id", itemId)
      .eq("trip_id", tripId);

    if (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      return { success: false, error: "Không thể cập nhật trạng thái" };
    }

    revalidatePath(`/trip/${tripId}/checklist`);
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi không mong đợi:", error);
    return { success: false, error: "Đã xảy ra lỗi không mong đợi" };
  }
}

/**
 * Cập nhật thông tin của một checklist item
 */
export async function updateChecklistItem(
  tripId: string,
  itemId: string,
  updates: Partial<ChecklistItemUpdate>
): Promise<ActionResponse> {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("checklist_items")
      .update(updates)
      .eq("id", itemId)
      .eq("trip_id", tripId);

    if (error) {
      console.error("Lỗi cập nhật item:", error);
      return { success: false, error: "Không thể cập nhật công việc" };
    }

    revalidatePath(`/trip/${tripId}/checklist`);
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi không mong đợi:", error);
    return { success: false, error: "Đã xảy ra lỗi không mong đợi" };
  }
}

/**
 * Xóa một checklist item
 */
export async function deleteChecklistItem(
  tripId: string,
  itemId: string
): Promise<ActionResponse> {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("checklist_items")
      .delete()
      .eq("id", itemId)
      .eq("trip_id", tripId);

    if (error) {
      console.error("Lỗi xóa item:", error);
      return { success: false, error: "Không thể xóa công việc" };
    }

    revalidatePath(`/trip/${tripId}/checklist`);
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi không mong đợi:", error);
    return { success: false, error: "Đã xảy ra lỗi không mong đợi" };
  }
}

/**
 * Thêm một checklist item mới
 */
export async function addChecklistItem(
  tripId: string,
  itemData: Omit<ChecklistItemInsert, "trip_id">
): Promise<ActionResponse<ChecklistItem>> {
  const supabase = await createClient();

  try {
    // Lấy item_order tiếp theo
    const { data: lastItem } = await supabase
      .from("checklist_items")
      .select("item_order")
      .eq("trip_id", tripId)
      .order("item_order", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = lastItem ? lastItem.item_order + 1 : 0;

    const { data, error } = await supabase
      .from("checklist_items")
      .insert({
        ...itemData,
        trip_id: tripId,
        item_order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      console.error("Lỗi thêm item:", error);
      return { success: false, error: "Không thể thêm công việc" };
    }

    revalidatePath(`/trip/${tripId}/checklist`);
    return { success: true, data };
  } catch (error: any) {
    console.error("Lỗi không mong đợi:", error);
    return { success: false, error: "Đã xảy ra lỗi không mong đợi" };
  }
}
