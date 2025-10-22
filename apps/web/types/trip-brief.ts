import { z } from "zod";
import { Database } from "@/lib/database.types";

// Import schema từ file schema đã có
import {
  tripBriefSchema,
  type TripBriefFormValues,
} from "@/lib/schemas/trip-brief.schema";

// Re-export để sử dụng ở nơi khác
export { tripBriefSchema, type TripBriefFormValues };

// Định nghĩa kiểu dữ liệu cho đầu vào của Server Action
export type CreateTripPayload = {
  values: TripBriefFormValues;
  destinationId: string;
};

// Định nghĩa kiểu dữ liệu trả về (cho client)
export type ActionResponse =
  | { success: true; data: { newTripId: string } }
  | { success: false; error: string };

// Các kiểu Insert từ database.types.ts
export type TripInsert = Database["public"]["Tables"]["trips"]["Insert"];
export type ItineraryBlockInsert =
  Database["public"]["Tables"]["itinerary_blocks"]["Insert"];
export type ChecklistItemInsert =
  Database["public"]["Tables"]["checklist_items"]["Insert"];

// Kiểu dữ liệu cho itinerary block types
export type ItineraryBlockType =
  | "DAY_HEADER"
  | "ACTIVITY"
  | "MEAL"
  | "TRANSPORT"
  | "FREE_TIME";

// Kiểu dữ liệu cho checklist item status
export type ChecklistItemStatus = "pending" | "in_progress" | "completed";
