"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Database } from "@/lib/database.types";
import { addMinutes, subMinutes } from "date-fns";

type ItineraryBlock = Database["public"]["Tables"]["itinerary_blocks"]["Row"];

export interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Lấy tất cả itinerary blocks của một trip (cho runsheet)
 */
export async function getRunsheetBlocks(
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
      console.error("Lỗi lấy runsheet blocks:", error);
      return { success: false, error: "Không thể lấy dữ liệu lịch trình" };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Lỗi không mong đợi:", error);
    return { success: false, error: "Đã xảy ra lỗi không mong đợi" };
  }
}

/**
 * Điều chỉnh thời gian của một block (+15 phút hoặc -15 phút)
 * và tự động điều chỉnh các blocks sau đó
 */
export async function adjustBlockTime(
  tripId: string,
  blockId: string,
  adjustmentMinutes: number // +15 hoặc -15
): Promise<ActionResponse> {
  const supabase = await createClient();

  try {
    // Lấy block hiện tại
    const { data: currentBlock, error: currentError } = await supabase
      .from("itinerary_blocks")
      .select("*")
      .eq("id", blockId)
      .eq("trip_id", tripId)
      .single();

    if (currentError || !currentBlock) {
      console.error("Lỗi lấy block:", currentError);
      return { success: false, error: "Không tìm thấy hoạt động" };
    }

    // Tính toán thời gian mới
    const newStartTime = addMinutes(
      new Date(currentBlock.start_time),
      adjustmentMinutes
    );
    const newEndTime = addMinutes(
      new Date(currentBlock.end_time),
      adjustmentMinutes
    );

    // Cập nhật block hiện tại
    const { error: updateError } = await supabase
      .from("itinerary_blocks")
      .update({
        start_time: newStartTime.toISOString(),
        end_time: newEndTime.toISOString(),
      })
      .eq("id", blockId)
      .eq("trip_id", tripId);

    if (updateError) {
      console.error("Lỗi cập nhật block:", updateError);
      return { success: false, error: "Không thể điều chỉnh thời gian" };
    }

    // Lấy tất cả blocks sau block hiện tại để điều chỉnh
    const { data: subsequentBlocks, error: subsequentError } = await supabase
      .from("itinerary_blocks")
      .select("*")
      .eq("trip_id", tripId)
      .gt("block_order", currentBlock.block_order)
      .order("block_order", { ascending: true });

    if (subsequentError) {
      console.error("Lỗi lấy subsequent blocks:", subsequentError);
      // Không return error vì block chính đã được cập nhật thành công
    } else if (subsequentBlocks && subsequentBlocks.length > 0) {
      // Điều chỉnh thời gian của các blocks sau
      const updatePromises = subsequentBlocks.map((block) => {
        const newStart = addMinutes(
          new Date(block.start_time),
          adjustmentMinutes
        );
        const newEnd = addMinutes(new Date(block.end_time), adjustmentMinutes);

        return supabase
          .from("itinerary_blocks")
          .update({
            start_time: newStart.toISOString(),
            end_time: newEnd.toISOString(),
          })
          .eq("id", block.id);
      });

      const results = await Promise.all(updatePromises);
      const hasError = results.some((result) => result.error);

      if (hasError) {
        console.warn("Một số blocks sau không được cập nhật:", results);
        // Không return error vì block chính đã được cập nhật thành công
      }
    }

    revalidatePath(`/trip/${tripId}/runsheet`);
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi không mong đợi:", error);
    return { success: false, error: "Đã xảy ra lỗi không mong đợi" };
  }
}

/**
 * Điều chỉnh thời gian nhanh (+15 phút)
 */
export async function addTimeToBlock(
  tripId: string,
  blockId: string
): Promise<ActionResponse> {
  return adjustBlockTime(tripId, blockId, 15);
}

/**
 * Điều chỉnh thời gian nhanh (-15 phút)
 */
export async function subtractTimeFromBlock(
  tripId: string,
  blockId: string
): Promise<ActionResponse> {
  return adjustBlockTime(tripId, blockId, -15);
}
