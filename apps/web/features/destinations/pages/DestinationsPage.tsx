"use client";

import { Destination } from "@/types/destinations";
import DestinationList from "../components/DestinationList";

export default function DestinationsPage({
  destinations,
}: {
  destinations: Destination[];
}) {
  return <DestinationList destinations={destinations} />;
}
