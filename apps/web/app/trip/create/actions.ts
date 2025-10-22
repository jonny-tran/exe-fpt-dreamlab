"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/database.types";
import { revalidatePath } from "next/cache";
import { differenceInDays, addDays, format } from "date-fns";
import {
  tripBriefSchema,
  type TripBriefFormValues,
  type CreateTripPayload,
  type ActionResponse,
  type ItineraryBlockInsert,
  type ChecklistItemInsert,
} from "@/types/trip-brief";

/**
 * Server Action để tạo chuyến đi mới và generate khung sườn lịch trình
 *
 * @param payload - Dữ liệu form đã được validate và destinationId
 * @returns Promise<ActionResponse> - Kết quả thành công hoặc lỗi
 */
export async function createTrip(
  payload: CreateTripPayload
): Promise<ActionResponse> {
  const supabase = await createClient();
  const { values, destinationId } = payload;

  try {
    // --- Bước 2: Xác thực & Lấy User ---
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Bạn phải đăng nhập để tạo chuyến đi." };
    }

    // --- Bước 3: Logic Ghi Database - Tạo `trip` chính ---
    const tripData = {
      title: values.title,
      start_date: values.dates.from.toISOString(),
      end_date: values.dates.to.toISOString(),
      participant_count: values.participants,
      budget_level: values.budget ? getBudgetLevel(values.budget) : null,
      description: values.goals || null,
      creator_id: user.id,
      status: "draft" as const,
    };

    const { data: newTrip, error: tripError } = await supabase
      .from("trips")
      .insert(tripData)
      .select("id")
      .single();

    if (tripError || !newTrip) {
      console.error("Lỗi tạo trip:", tripError);
      return {
        success: false,
        error: "Không thể tạo chuyến đi. Vui lòng thử lại.",
      };
    }

    const newTripId = newTrip.id;

    // --- Bước 4: Logic Ghi Database - Generate `itinerary_blocks` ---
    const blocksResult = await generateItineraryBlocks(newTripId, values);
    if (!blocksResult.success) {
      // Rollback: Xóa trip vừa tạo nếu không thể tạo blocks
      await supabase.from("trips").delete().eq("id", newTripId);
      return blocksResult;
    }

    // --- Bước 5: Logic Ghi Database - Generate `checklist_items` ---
    const checklistResult = await generateChecklistItems(newTripId, values);
    if (!checklistResult.success) {
      console.warn("Không thể tạo checklist items:", checklistResult.error);
      // Không rollback vì checklist không critical
    }

    // --- Bước 6: Hoàn tất Server Action ---
    revalidatePath("/dashboard");
    revalidatePath("/trip");

    return { success: true, data: { newTripId } };
  } catch (error: any) {
    console.error("Lỗi không mong đợi trong createTrip:", error);
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong đợi. Vui lòng thử lại.",
    };
  }
}

/**
 * Generate itinerary blocks dựa trên số ngày của chuyến đi
 */
async function generateItineraryBlocks(
  tripId: string,
  values: TripBriefFormValues
): Promise<ActionResponse> {
  const supabase = await createClient();

  try {
    const startDate = values.dates.from;
    const endDate = values.dates.to;
    const numberOfDays = differenceInDays(endDate, startDate) + 1;
    const blocksToInsert: ItineraryBlockInsert[] = [];

    // Tạo block cho mỗi ngày
    for (let i = 0; i < numberOfDays; i++) {
      const currentDate = addDays(startDate, i);
      const dayTitle = `Ngày ${i + 1} (${format(currentDate, "dd/MM/yyyy")})`;

      // Block 1: Tiêu đề ngày
      const dayStartTime = new Date(currentDate);
      dayStartTime.setHours(9, 0, 0, 0);
      const dayEndTime = new Date(currentDate);
      dayEndTime.setHours(18, 0, 0, 0);

      blocksToInsert.push({
        trip_id: tripId,
        title: dayTitle,
        block_order: i * 3, // 0, 3, 6, ...
        start_time: dayStartTime.toISOString(),
        end_time: dayEndTime.toISOString(),
        notes: `Ngày ${i + 1} của chuyến đi`,
      });

      // Block 2: Hoạt động chính
      let activityTitle = "Hoạt động chính";
      let activityNotes = "Thời gian cho các hoạt động chính trong ngày";

      // Áp dụng Rule-based cho MVP
      if (i === 0 && numberOfDays > 1) {
        activityTitle = "Check-in & Ổn định";
        activityNotes = "Check-in khách sạn và làm quen với địa điểm";
      } else if (i === numberOfDays - 1 && numberOfDays > 1) {
        activityTitle = "Check-out & Di chuyển về";
        activityNotes = "Check-out và chuẩn bị về nhà";
      }

      const activityStartTime = new Date(currentDate);
      activityStartTime.setHours(10, 0, 0, 0);
      const activityEndTime = new Date(currentDate);
      activityEndTime.setHours(16, 0, 0, 0);

      blocksToInsert.push({
        trip_id: tripId,
        title: activityTitle,
        block_order: i * 3 + 1, // 1, 4, 7, ...
        start_time: activityStartTime.toISOString(),
        end_time: activityEndTime.toISOString(),
        notes: activityNotes,
      });

      // Block 3: Thời gian tự do
      const freeTimeStartTime = new Date(currentDate);
      freeTimeStartTime.setHours(16, 0, 0, 0);
      const freeTimeEndTime = new Date(currentDate);
      freeTimeEndTime.setHours(20, 0, 0, 0);

      blocksToInsert.push({
        trip_id: tripId,
        title: "Thời gian tự do",
        block_order: i * 3 + 2, // 2, 5, 8, ...
        start_time: freeTimeStartTime.toISOString(),
        end_time: freeTimeEndTime.toISOString(),
        notes: "Thời gian nghỉ ngơi và khám phá tự do",
      });
    }

    const { error: blocksError } = await supabase
      .from("itinerary_blocks")
      .insert(blocksToInsert);

    if (blocksError) {
      console.error("Lỗi tạo itinerary blocks:", blocksError);
      return {
        success: false,
        error: "Không thể tạo lịch trình. Vui lòng thử lại.",
      };
    }

    return { success: true, data: { newTripId: tripId } };
  } catch (error: any) {
    console.error("Lỗi trong generateItineraryBlocks:", error);
    return {
      success: false,
      error: "Lỗi khi tạo lịch trình.",
    };
  }
}

/**
 * Generate checklist items mặc định
 */
async function generateChecklistItems(
  tripId: string,
  values: TripBriefFormValues
): Promise<ActionResponse> {
  const supabase = await createClient();

  try {
    const defaultItems: ChecklistItemInsert[] = [
      {
        trip_id: tripId,
        title: "Đặt phương tiện di chuyển",
        description: "Đặt xe/máy bay/tàu để đến điểm đến",
        item_order: 0,
        assignee_role: "creator",
      },
      {
        trip_id: tripId,
        title: "Đặt chỗ ở",
        description: "Đặt khách sạn/homestay cho chuyến đi",
        item_order: 1,
        assignee_role: "creator",
      },
      {
        trip_id: tripId,
        title: "Chuẩn bị đồ dùng cá nhân",
        description: "Đóng gói quần áo và đồ dùng cần thiết",
        item_order: 2,
        assignee_role: "creator",
      },
      {
        trip_id: tripId,
        title: "Kiểm tra thời tiết",
        description: "Xem dự báo thời tiết để chuẩn bị trang phục phù hợp",
        item_order: 3,
        assignee_role: "creator",
      },
      {
        trip_id: tripId,
        title: "Chuẩn bị tiền mặt",
        description: "Đổi tiền và chuẩn bị thẻ tín dụng",
        item_order: 4,
        assignee_role: "creator",
      },
    ];

    // Thêm items dựa trên số người tham gia
    if (values.participants > 2) {
      defaultItems.push({
        trip_id: tripId,
        title: "Phân công nhiệm vụ",
        description: "Phân chia công việc cho các thành viên trong nhóm",
        item_order: 5,
        assignee_role: "creator",
      });
    }

    const { error: checklistError } = await supabase
      .from("checklist_items")
      .insert(defaultItems);

    if (checklistError) {
      console.error("Lỗi tạo checklist items:", checklistError);
      return {
        success: false,
        error: "Không thể tạo danh sách công việc.",
      };
    }

    return { success: true, data: { newTripId: tripId } };
  } catch (error: any) {
    console.error("Lỗi trong generateChecklistItems:", error);
    return {
      success: false,
      error: "Lỗi khi tạo danh sách công việc.",
    };
  }
}

/**
 * Xác định mức ngân sách dựa trên số tiền
 */
function getBudgetLevel(budget: number): string {
  if (budget < 1000000) return "low";
  if (budget < 5000000) return "medium";
  if (budget < 10000000) return "high";
  return "luxury";
}
