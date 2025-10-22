"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Destination } from "@/types/destinations";

type DestinationCardProps = {
  destination: Destination;
  onView: (destination: Destination) => void;
  onChoose: (destination: Destination) => void;
};

export default function DestinationCard({
  destination,
  onView,
  onChoose,
}: DestinationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{destination.city}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-4/3 w-full overflow-hidden rounded">
          <Image
            src={destination.image_url ?? "/vercel.svg"}
            alt={destination.city}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        </div>
      </CardContent>
      <CardFooter className="gap-3">
        <Button variant="outline" onClick={() => onView(destination)}>
          Xem địa điểm
        </Button>
        <Button onClick={() => onChoose(destination)}>
          Chọn {destination.city}
        </Button>
      </CardFooter>
    </Card>
  );
}
