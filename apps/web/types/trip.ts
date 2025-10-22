import type { Tables, TablesInsert, TablesUpdate } from "@/lib/database.types";

// Trip types
export type Trip = Tables<"trips">;
export type TripInsert = TablesInsert<"trips">;
export type TripUpdate = TablesUpdate<"trips">;

// Related types
export type ItineraryBlock = Tables<"itinerary_blocks">;
export type ItineraryBlockInsert = TablesInsert<"itinerary_blocks">;
export type ItineraryBlockUpdate = TablesUpdate<"itinerary_blocks">;

export type ChecklistItem = Tables<"checklist_items">;
export type ChecklistItemInsert = TablesInsert<"checklist_items">;
export type ChecklistItemUpdate = TablesUpdate<"checklist_items">;

export type Expense = Tables<"expenses">;
export type ExpenseInsert = TablesInsert<"expenses">;
export type ExpenseUpdate = TablesUpdate<"expenses">;

export type Activity = Tables<"activities">;
export type ActivityInsert = TablesInsert<"activities">;
export type ActivityUpdate = TablesUpdate<"activities">;

// Trip with relations (for when you need to fetch trip with nested data)
export type TripWithDetails = Trip & {
  itinerary_blocks?: ItineraryBlock[];
  checklist_items?: ChecklistItem[];
  expenses?: Expense[];
};
