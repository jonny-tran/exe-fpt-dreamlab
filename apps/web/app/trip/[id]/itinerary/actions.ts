"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Database } from "@/lib/database.types";

type ItineraryBlock = Database["public"]["Tables"]["itinerary_blocks"]["Row"];
type ItineraryBlockInsert =
  Database["public"]["Tables"]["itinerary_blocks"]["Insert"];
type ItineraryBlockUpdate =
  Database["public"]["Tables"]["itinerary_blocks"]["Update"];

export interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Lấy tất cả itinerary blocks của một trip
 */
export async function getItineraryBlocks(
  tripId: string
): Promise<ActionResponse<ItineraryBlock[]>> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("itinerary_blocks")
      .select("*")
      .eq("trip_id", tripId)
      .order("block_order", { ascending: true });

    if (error) {
      console.error("Lỗi lấy itinerary blocks:", error);
      return { success: false, error: "Không thể lấy dữ liệu lịch trình" };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Lỗi không mong đợi:", error);
    return { success: false, error: "Đã xảy ra lỗi không mong đợi" };
  }
}

/**
 * Cập nhật thứ tự của itinerary blocks (cho drag & drop)
 */
export async function updateItineraryBlockOrder(
  tripId: string,
  blockUpdates: { id: string; block_order: number }[]
): Promise<ActionResponse> {
  const supabase = await createClient();

  try {
    // Cập nhật từng block
    const updatePromises = blockUpdates.map(({ id, block_order }) =>
      supabase
        .from("itinerary_blocks")
        .update({ block_order })
        .eq("id", id)
        .eq("trip_id", tripId)
    );

    const results = await Promise.all(updatePromises);

    // Kiểm tra lỗi
    const hasError = results.some((result) => result.error);
    if (hasError) {
      console.error("Lỗi cập nhật thứ tự blocks:", results);
      return { success: false, error: "Không thể cập nhật thứ tự" };
    }

    revalidatePath(`/trip/${tripId}/itinerary`);
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi không mong đợi:", error);
    return { success: false, error: "Đã xảy ra lỗi không mong đợi" };
  }
}

/**
 * Cập nhật thông tin của một itinerary block
 */
export async function updateItineraryBlock(
  tripId: string,
  blockId: string,
  updates: Partial<ItineraryBlockUpdate>
): Promise<ActionResponse> {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("itinerary_blocks")
      .update(updates)
      .eq("id", blockId)
      .eq("trip_id", tripId);

    if (error) {
      console.error("Lỗi cập nhật block:", error);
      return { success: false, error: "Không thể cập nhật hoạt động" };
    }

    revalidatePath(`/trip/${tripId}/itinerary`);
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi không mong đợi:", error);
    return { success: false, error: "Đã xảy ra lỗi không mong đợi" };
  }
}

/**
 * Xóa một itinerary block
 */
export async function deleteItineraryBlock(
  tripId: string,
  blockId: string
): Promise<ActionResponse> {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("itinerary_blocks")
      .delete()
      .eq("id", blockId)
      .eq("trip_id", tripId);

    if (error) {
      console.error("Lỗi xóa block:", error);
      return { success: false, error: "Không thể xóa hoạt động" };
    }

    revalidatePath(`/trip/${tripId}/itinerary`);
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi không mong đợi:", error);
    return { success: false, error: "Đã xảy ra lỗi không mong đợi" };
  }
}

/**
 * Thêm một itinerary block mới
 */
export async function addItineraryBlock(
  tripId: string,
  blockData: Omit<ItineraryBlockInsert, "trip_id">
): Promise<ActionResponse<ItineraryBlock>> {
  const supabase = await createClient();

  try {
    // Lấy block_order tiếp theo
    const { data: lastBlock } = await supabase
      .from("itinerary_blocks")
      .select("block_order")
      .eq("trip_id", tripId)
      .order("block_order", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = lastBlock ? lastBlock.block_order + 1 : 0;

    const { data, error } = await supabase
      .from("itinerary_blocks")
      .insert({
        ...blockData,
        trip_id: tripId,
        block_order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      console.error("Lỗi thêm block:", error);
      return { success: false, error: "Không thể thêm hoạt động" };
    }

    revalidatePath(`/trip/${tripId}/itinerary`);
    return { success: true, data };
  } catch (error: any) {
    console.error("Lỗi không mong đợi:", error);
    return { success: false, error: "Đã xảy ra lỗi không mong đợi" };
  }
}

/**
 * Thêm hoạt động từ Activity Library vào itinerary
 */
export async function addActivityToItinerary(
  tripId: string,
  activityId: string,
  startTime: string,
  endTime: string,
  location?: string
): Promise<ActionResponse<ItineraryBlock>> {
  const supabase = await createClient();

  try {
    // Lấy thông tin activity
    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .select("title, description")
      .eq("id", activityId)
      .single();

    if (activityError || !activity) {
      console.error("Lỗi lấy activity:", activityError);
      return { success: false, error: "Không tìm thấy hoạt động" };
    }

    // Lấy block_order tiếp theo
    const { data: lastBlock } = await supabase
      .from("itinerary_blocks")
      .select("block_order")
      .eq("trip_id", tripId)
      .order("block_order", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = lastBlock ? lastBlock.block_order + 1 : 0;

    // Thêm block mới
    const { data, error } = await supabase
      .from("itinerary_blocks")
      .insert({
        trip_id: tripId,
        activity_id: activityId,
        title: activity.title,
        start_time: startTime,
        end_time: endTime,
        location: location || null,
        notes: activity.description || null,
        block_order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      console.error("Lỗi thêm activity block:", error);
      return {
        success: false,
        error: "Không thể thêm hoạt động vào lịch trình",
      };
    }

    revalidatePath(`/trip/${tripId}/itinerary`);
    return { success: true, data };
  } catch (error: any) {
    console.error("Lỗi không mong đợi:", error);
    return { success: false, error: "Đã xảy ra lỗi không mong đợi" };
  }
}
