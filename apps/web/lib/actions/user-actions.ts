"use server";

import { createClient } from "@/lib/supabase/server";
import { UserInsert } from "@/types/user";
import { revalidatePath } from "next/cache";

export async function saveUserToDatabase(user: {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
}) {
  try {
    const supabase = await createClient();

    // Kiểm tra xem user đã tồn tại trong database chưa
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 là "not found" error, không phải lỗi thực sự
      console.error("Error checking existing user:", checkError);
      return { success: false, error: "Failed to check existing user" };
    }

    // Nếu user đã tồn tại, cập nhật thông tin
    if (existingUser) {
      const updateData: Partial<UserInsert> = {
        email: user.email || null,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating user:", updateError);
        return { success: false, error: "Failed to update user" };
      }

      console.log("User updated successfully:", user.id);
      return { success: true, action: "updated" };
    }

    // Nếu user chưa tồn tại, tạo mới
    const newUser: UserInsert = {
      id: user.id,
      email: user.email || null,
      role: "organizer", // Default role - phải khớp với constraint trong database
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase.from("users").insert(newUser);

    if (insertError) {
      console.error("Error inserting user:", insertError);
      return { success: false, error: "Failed to insert user" };
    }

    console.log("User created successfully:", user.id);

    // Revalidate relevant paths
    revalidatePath("/");

    return { success: true, action: "created" };
  } catch (error) {
    console.error("Unexpected error in saveUserToDatabase:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
}

export async function getUserFromDatabase(userId: string) {
  try {
    const supabase = await createClient();

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return { success: false, error: "Failed to fetch user" };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Unexpected error in getUserFromDatabase:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
}
