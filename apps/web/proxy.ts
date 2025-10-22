import { updateSession } from "@/lib/supabase/proxy";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cập nhật session Supabase
  const response = await updateSession(request);

  // Tạo Supabase client để kiểm tra user
  const { createClient } = await import("@/lib/supabase/middleware");
  const { supabase } = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Các trang công khai không cần xác thực
  const publicPaths = [
    "/",
    "/home",
    "/login",
    "/destinations",
    "/auth/callback",
  ];

  // Kiểm tra nếu là trang công khai
  if (publicPaths.includes(pathname)) {
    return response;
  }

  // Kiểm tra nếu là trang trip được bảo vệ
  const isTripPage = pathname.startsWith("/trip/");
  const isTripCreatePage = pathname === "/trip/create";
  const isTripDetailPage = pathname.match(/^\/trip\/[^\/]+/);

  // Cho phép truy cập trang tạo trip mà không cần đăng nhập
  if (isTripCreatePage) {
    return response;
  }

  // Bảo vệ các trang trip detail (checklist, itinerary, runsheet)
  if (isTripDetailPage && !isTripCreatePage) {
    if (!user) {
      // Redirect về trang login với next parameter để quay lại sau khi đăng nhập
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
