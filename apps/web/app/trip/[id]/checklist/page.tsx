import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ChecklistClient from "./checklist-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChecklistPage({ params }: PageProps) {
  const { id: tripId } = await params;
  const supabase = await createClient();

  // Lấy thông tin trip
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id, title, start_date, end_date, description")
    .eq("id", tripId)
    .single();

  if (tripError || !trip) {
    console.error("Error fetching trip:", tripError);
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Danh sách công việc</h1>
        <p className="text-muted-foreground text-lg">
          {trip.title} - Quản lý các công việc cần làm cho chuyến đi
        </p>
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span>
            Từ: {new Date(trip.start_date).toLocaleDateString("vi-VN")}
          </span>
          <span>
            Đến: {new Date(trip.end_date).toLocaleDateString("vi-VN")}
          </span>
        </div>
      </div>

      <Suspense fallback={<ChecklistSkeleton />}>
        <ChecklistClient tripId={tripId} />
      </Suspense>
    </div>
  );
}

function ChecklistSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 bg-muted animate-pulse rounded" />
              <div className="flex-1">
                <div className="h-5 w-64 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
