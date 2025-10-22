import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckSquare, Clock, Plus, MapPin } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Trip {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string | null;
  participant_count: number | null;
  destination_id: string | null;
  destinations: {
    city: string;
  }[];
}

export default async function DashboardPage() {
  const supabase = await createClient();

  // Lấy danh sách trips
  const { data: trips, error } = await supabase
    .from("trips")
    .select(
      `
      id,
      title,
      description,
      start_date,
      end_date,
      status,
      participant_count,
      destination_id,
      destinations!inner (
        city
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching trips:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground text-lg">
              Quản lý các chuyến đi của bạn
            </p>
          </div>
          <Link href="/destinations">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tạo chuyến đi mới
            </Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={<TripsSkeleton />}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips && trips.length > 0 ? (
            trips.map((trip) => <TripCard key={trip.id} trip={trip} />)
          ) : (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Chưa có chuyến đi nào
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Bắt đầu tạo chuyến đi đầu tiên của bạn
                  </p>
                  <Link href="/destinations">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo chuyến đi mới
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </Suspense>
    </div>
  );
}

function TripCard({ trip }: { trip: Trip }) {
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const duration =
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case "draft":
        return "Nháp";
      case "active":
        return "Đang diễn ra";
      case "completed":
        return "Đã hoàn thành";
      default:
        return "Nháp";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{trip.title}</CardTitle>
          <Badge className={getStatusColor(trip.status)}>
            {getStatusText(trip.status)}
          </Badge>
        </div>
        {trip.destinations && trip.destinations.length > 0 && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {trip.destinations[0].city}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {trip.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {trip.description}
          </p>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Thời gian:</span>
            <span>
              {format(startDate, "dd/MM/yyyy", { locale: vi })} -{" "}
              {format(endDate, "dd/MM/yyyy", { locale: vi })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Số ngày:</span>
            <span>{duration} ngày</span>
          </div>
          {trip.participant_count && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Số người:</span>
              <span>{trip.participant_count} người</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Link href={`/trip/${trip.id}/itinerary`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Calendar className="w-4 h-4 mr-1" />
              Lịch trình
            </Button>
          </Link>
          <Link href={`/trip/${trip.id}/checklist`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <CheckSquare className="w-4 h-4 mr-1" />
              Công việc
            </Button>
          </Link>
          <Link href={`/trip/${trip.id}/runsheet`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Clock className="w-4 h-4 mr-1" />
              Điều khiển
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function TripsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
              <div className="h-5 w-16 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-4 w-12 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 flex-1 bg-muted animate-pulse rounded" />
              <div className="h-8 flex-1 bg-muted animate-pulse rounded" />
              <div className="h-8 flex-1 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
