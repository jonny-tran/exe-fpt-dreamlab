import { createClient } from "@/lib/supabase/server";
import { UserInsert } from "@/types/user";

/**
 * Utility function để đảm bảo user tồn tại trong database
 * Có thể được gọi từ bất kỳ Server Component hoặc Server Action nào
 */
export async function ensureUserInDatabase(userId: string) {
  try {
    const supabase = await createClient();

    // Kiểm tra xem user đã tồn tại trong database chưa
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id, email, created_at")
      .eq("id", userId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 là "not found" error, không phải lỗi thực sự
      console.error("Error checking existing user:", checkError);
      return {
        success: false,
        error: "Failed to check existing user",
        user: null,
      };
    }

    // Nếu user đã tồn tại, trả về thông tin user
    if (existingUser) {
      return { success: true, user: existingUser, action: "exists" };
    }

    // Nếu user chưa tồn tại, lấy thông tin từ Supabase Auth
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser || authUser.id !== userId) {
      console.error("Error getting auth user:", authError);
      return { success: false, error: "Failed to get auth user", user: null };
    }

    // Tạo user mới trong database
    const newUser: UserInsert = {
      id: authUser.id,
      email: authUser.email || null,
      role: "organizer", // Default role - phải khớp với constraint trong database
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: insertedUser, error: insertError } = await supabase
      .from("users")
      .insert(newUser)
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting user:", insertError);
      return { success: false, error: "Failed to insert user", user: null };
    }

    console.log("User created in database:", insertedUser.id);
    return { success: true, user: insertedUser, action: "created" };
  } catch (error) {
    console.error("Unexpected error in ensureUserInDatabase:", error);
    return { success: false, error: "Unexpected error occurred", user: null };
  }
}

/**
 * Lấy thông tin user từ database với fallback về auth
 */
export async function getUserProfile(userId: string) {
  try {
    const supabase = await createClient();

    // Thử lấy từ database trước
    const { data: dbUser, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (dbUser && !dbError) {
      return { success: true, user: dbUser, source: "database" };
    }

    // Nếu không có trong database, lấy từ auth
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser || authUser.id !== userId) {
      return { success: false, error: "User not found", user: null };
    }

    // Tạo user trong database và trả về
    const ensureResult = await ensureUserInDatabase(userId);
    return ensureResult;
  } catch (error) {
    console.error("Unexpected error in getUserProfile:", error);
    return { success: false, error: "Unexpected error occurred", user: null };
  }
}

/**
 * Cập nhật thông tin user trong database
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserInsert>
) {
  try {
    const supabase = await createClient();

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return { success: false, error: "Failed to update user" };
    }

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Unexpected error in updateUserProfile:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
}
