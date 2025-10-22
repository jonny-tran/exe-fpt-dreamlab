import TripBriefForm from "@/features/trip/components/trip-brief-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ destinationId?: string }>;
}
export default async function CreateTripPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const destinationId = params.destinationId;

  // Nếu không có destinationId, redirect về trang destinations
  if (!destinationId) {
    redirect("/destinations");
  }

  // Fetch thông tin điểm đến từ Supabase
  const supabase = await createClient();
  const { data: destination, error } = await supabase
    .from("destinations")
    .select("id, city, image_url")
    .eq("id", destinationId)
    .single();

  // Nếu không tìm thấy điểm đến, redirect về trang destinations
  if (error || !destination) {
    console.error("Error fetching destination:", error);
    redirect("/destinations");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Tạo kế hoạch chuyến đi</h1>
        <p className="text-muted-foreground text-lg">
          Điểm đến:{" "}
          <span className="font-semibold text-foreground">
            {destination.city}
          </span>
        </p>
      </div>

      <TripBriefForm
        destinationId={destination.id}
        destinationName={destination.city}
        destinationImage={destination.image_url}
      />
    </div>
  );
}
