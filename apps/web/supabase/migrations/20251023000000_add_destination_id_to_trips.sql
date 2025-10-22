-- Migration: Add destination_id to trips table
-- Add destination_id column to trips table to link trips with destinations

-- Add destination_id column to trips table
ALTER TABLE public.trips 
ADD COLUMN destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_trips_destination_id ON public.trips(destination_id);

-- Update RLS policy to allow reading trips with destination
-- (The existing policies already allow this, but we can be more explicit)
CREATE POLICY "Anyone can read trips with destination" ON public.trips
  FOR SELECT USING (true);

-- Add comment to document the new column
COMMENT ON COLUMN public.trips.destination_id IS 'Foreign key reference to destinations table';
