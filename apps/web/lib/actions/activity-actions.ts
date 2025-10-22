"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/database.types";

type Activity = Database["public"]["Tables"]["activities"]["Row"];

export interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Lấy tất cả activities từ thư viện hoạt động
 */
export async function getActivities(): Promise<ActionResponse<Activity[]>> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("title", { ascending: true });

    if (error) {
      console.error("Lỗi lấy activities:", error);
      return { success: false, error: "Không thể lấy danh sách hoạt động" };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Lỗi không mong đợi:", error);
    return { success: false, error: "Đã xảy ra lỗi không mong đợi" };
  }
}

/**
 * Lấy activities theo category
 */
export async function getActivitiesByCategory(
  category: string
): Promise<ActionResponse<Activity[]>> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("category", category)
      .order("title", { ascending: true });

    if (error) {
      console.error("Lỗi lấy activities theo category:", error);
      return { success: false, error: "Không thể lấy danh sách hoạt động" };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Lỗi không mong đợi:", error);
    return { success: false, error: "Đã xảy ra lỗi không mong đợi" };
  }
}

/**
 * Tìm kiếm activities theo từ khóa
 */
export async function searchActivities(
  query: string
): Promise<ActionResponse<Activity[]>> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .or(
        `title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`
      )
      .order("title", { ascending: true });

    if (error) {
      console.error("Lỗi tìm kiếm activities:", error);
      return { success: false, error: "Không thể tìm kiếm hoạt động" };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Lỗi không mong đợi:", error);
    return { success: false, error: "Đã xảy ra lỗi không mong đợi" };
  }
}

/**
 * Lấy các categories có sẵn
 */
export async function getActivityCategories(): Promise<
  ActionResponse<string[]>
> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("activities")
      .select("category")
      .not("category", "is", null);

    if (error) {
      console.error("Lỗi lấy categories:", error);
      return { success: false, error: "Không thể lấy danh mục hoạt động" };
    }

    // Lấy unique categories
    const categories = [
      ...new Set(data?.map((item) => item.category).filter(Boolean)),
    ] as string[];

    return { success: true, data: categories };
  } catch (error: any) {
    console.error("Lỗi không mong đợi:", error);
    return { success: false, error: "Đã xảy ra lỗi không mong đợi" };
  }
}
