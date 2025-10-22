import { TripNavigation } from "@/components/trip/trip-navigation";

interface TripLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function TripLayout({
  children,
  params,
}: TripLayoutProps) {
  const { id: tripId } = await params;

  return (
    <div className="min-h-screen bg-background">
      <TripNavigation tripId={tripId} />
      <main>{children}</main>
    </div>
  );
}
