import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export function createClient(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL! ||
      "https://zzzbnnlhcvsykmdzyers.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6emJubmxoY3ZzeWttZHp5ZXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTE4MzcsImV4cCI6MjA3NjE2NzgzN30.h1hUJEPVpR8UVZIKbkhV5fIiXT2pMn2BEG44mdM-ma0",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  return { supabase, response };
}
