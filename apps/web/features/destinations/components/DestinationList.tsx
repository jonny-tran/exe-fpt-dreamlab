"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import DestinationCard from "./DestinationCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Attraction, Destination } from "@/types/destinations";
import Image from "next/image";

// types được import từ @types/destinations

export default function DestinationList({
  destinations,
}: {
  destinations: Destination[];
}) {
  const router = useRouter();
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [isLoadingAttractions, setIsLoadingAttractions] = useState(false);
  const [attractionsList, setAttractionsList] = useState<Attraction[] | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAttractions(destinationId: string) {
      setIsLoadingAttractions(true);
      setErrorMessage(null);
      setAttractionsList(null);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("attractions")
          .select("id, destination_id, name, description, image_url")
          .eq("destination_id", destinationId)
          .order("name", { ascending: true });
        if (error) throw error;
        setAttractionsList(data as Attraction[]);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage("Không thể tải danh sách địa điểm");
        }
      } finally {
        setIsLoadingAttractions(false);
      }
    }

    if (selectedDestination?.id) {
      fetchAttractions(selectedDestination.id);
    }
  }, [selectedDestination?.id]);

  const handleChoose = (destination: Destination) => {
    router.push(`/trip/create?destinationId=${destination.id}`);
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {destinations.map((d) => (
        <DestinationCard
          key={d.id}
          destination={d}
          onView={setSelectedDestination}
          onChoose={handleChoose}
        />
      ))}

      <Dialog
        open={!!selectedDestination}
        onOpenChange={(open) => !open && setSelectedDestination(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDestination?.city ?? "Danh sách địa điểm"}
            </DialogTitle>
          </DialogHeader>
          {isLoadingAttractions && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="h-16 w-full" />
              ))}
            </div>
          )}
          {!isLoadingAttractions && errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
          {!isLoadingAttractions && !errorMessage && (
            <ScrollArea className="h-64 pr-4">
              <div className="space-y-3">
                {attractionsList && attractionsList.length > 0 ? (
                  attractionsList.map((a) => (
                    <div key={a.id} className="flex items-start gap-3">
                      <div className="relative h-16 w-24 overflow-hidden rounded">
                        <Image
                          src={a.image_url ?? "/vercel.svg"}
                          alt={a.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{a.name}</div>
                        {a.description && (
                          <div className="text-muted-foreground text-sm">
                            {a.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Chưa có địa điểm tham quan.
                  </p>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
