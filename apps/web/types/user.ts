import type { Tables, TablesInsert, TablesUpdate } from "@/lib/database.types";

// User types
export type User = Tables<"users">;
export type UserInsert = TablesInsert<"users">;
export type UserUpdate = TablesUpdate<"users">;

// Analytics events types
export type AnalyticsEvent = Tables<"analytics_events">;
export type AnalyticsEventInsert = TablesInsert<"analytics_events">;
export type AnalyticsEventUpdate = TablesUpdate<"analytics_events">;

// User with relations (for when you need to fetch user with nested data)
export type UserWithDetails = User & {
  analytics_events?: AnalyticsEvent[];
  trips_created?: Trip[];
  checklist_items_assigned?: ChecklistItem[];
  expenses_paid?: Expense[];
};

// Re-export trip types for convenience
export type Trip = Tables<"trips">;
export type ChecklistItem = Tables<"checklist_items">;
export type Expense = Tables<"expenses">;
