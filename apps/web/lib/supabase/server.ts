import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL! ||
      "https://zzzbnnlhcvsykmdzyers.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6emJubmxoY3ZzeWttZHp5ZXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTE4MzcsImV4cCI6MjA3NjE2NzgzN30.h1hUJEPVpR8UVZIKbkhV5fIiXT2pMn2BEG44mdM-ma0",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll calls in Server Components will be ignored
          }
        },
      },
    }
  );
}
