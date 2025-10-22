// Temporary type definition until database types are updated
export type Destination = {
  id: string;
  city: string;
  image_url: string | null;
  created_at: string;
};

export type Attraction = {
  id: string;
  destination_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
};
