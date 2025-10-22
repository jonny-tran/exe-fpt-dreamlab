import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import RunsheetClient from "./runsheet-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RunsheetPage({ params }: PageProps) {
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
        <h1 className="text-4xl font-bold mb-2">Bảng điều khiển</h1>
        <p className="text-muted-foreground text-lg">
          {trip.title} - Quản lý thời gian thực trong ngày diễn ra
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

      <Suspense fallback={<RunsheetSkeleton />}>
        <RunsheetClient tripId={tripId} />
      </Suspense>
    </div>
  );
}

function RunsheetSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="h-8 w-32 bg-muted animate-pulse rounded mx-auto mb-4" />
        <div className="h-4 w-48 bg-muted animate-pulse rounded mx-auto" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="space-y-2">
                <div className="h-6 w-64 bg-muted animate-pulse rounded" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
