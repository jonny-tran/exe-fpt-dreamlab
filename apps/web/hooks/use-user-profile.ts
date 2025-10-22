"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@/types/user";

interface UseUserProfileReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook để lấy thông tin user profile từ database
 * Sử dụng trong client components
 */
export function useUserProfile(): UseUserProfileReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy user từ auth trước
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        setUser(null);
        return;
      }

      // Lấy thông tin từ database
      const { data: dbUser, error: dbError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (dbError) {
        console.error("Error fetching user from database:", dbError);
        // Fallback về auth user nếu không có trong database
        setUser({
          id: authUser.id,
          email: authUser.email || null,
          role: "user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          anon_uuid: null,
        });
      } else {
        setUser(dbUser);
      }
    } catch (err) {
      console.error("Error in useUserProfile:", err);
      setError("Failed to fetch user profile");
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await fetchUserProfile();
  };

  useEffect(() => {
    fetchUserProfile();

    // Lắng nghe thay đổi auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await fetchUserProfile();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, error, refresh };
}
