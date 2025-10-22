import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { saveUserToDatabase } from "@/lib/actions/user-actions";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Auth callback error:", error);
        return NextResponse.redirect(
          `${origin}/login?error=auth_callback_error`
        );
      }

      // Lấy thông tin user sau khi exchange code thành công
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Lưu thông tin user vào database
        const saveResult = await saveUserToDatabase({
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata,
        });
        
        if (saveResult.success) {
          console.log(`User ${saveResult.action} in database:`, user.id);
        } else {
          console.error("Failed to save user to database:", saveResult.error);
          // Không redirect về error vì auth đã thành công, chỉ log error
        }
      }

      // Redirect về trang đích hoặc trang chủ
      return NextResponse.redirect(`${origin}${next}`);
    } catch (error) {
      console.error("Unexpected error in auth callback:", error);
      return NextResponse.redirect(`${origin}/login?error=unexpected_error`);
    }
  }

  // Nếu không có code, redirect về trang chủ
  return NextResponse.redirect(`${origin}/`);
}
