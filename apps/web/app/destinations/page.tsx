import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DestinationsPage from "@/features/destinations/pages/DestinationsPage";
import { Destination } from "@/types/destinations";

async function fetchDestinations(): Promise<Destination[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("destinations")
    .select("id, city, image_url")
    .order("city", { ascending: true });
  if (error) {
    console.error("Fetch destinations error:", error.message);
    return [];
  }
  return data as Destination[];
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <Card key={idx}>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="aspect-4/3 w-full rounded" />
          </CardContent>
          <CardFooter className="gap-3">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-40" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default async function Page() {
  const destinations = await fetchDestinations();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Chọn Điểm đến</h1>
      <Suspense fallback={<GridSkeleton />}>
        <DestinationsPage destinations={destinations} />
      </Suspense>
    </div>
  );
}
