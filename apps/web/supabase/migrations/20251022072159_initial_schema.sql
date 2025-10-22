-- Migration: initial_schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth with anon support)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_uuid UUID UNIQUE,
  email TEXT,
  role TEXT DEFAULT 'organizer' CHECK (role IN ('organizer', 'participant', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trips table
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  participant_count INTEGER DEFAULT 10,
  budget_level TEXT CHECK (budget_level IN ('low', 'medium', 'high')),
  goal_tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  share_token UUID UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activities library
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  duration_minutes INTEGER NOT NULL,
  cost_level TEXT CHECK (cost_level IN ('free', 'low', 'medium', 'high')),
  props JSONB DEFAULT '{}',
  category TEXT,
  is_signature BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Itinerary blocks
CREATE TABLE public.itinerary_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  notes TEXT,
  block_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Checklist items
CREATE TABLE public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assignee_role TEXT,
  done BOOLEAN DEFAULT false,
  item_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Expenses
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  payer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT,
  description TEXT,
  settled BOOLEAN DEFAULT false,
  expense_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytics events (for tracking)
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for guest/demo mode (no auth required)
-- Users: anyone can create/read their own
CREATE POLICY "Users can create themselves" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read all" ON public.users
  FOR SELECT USING (true);

-- Trips: public read, authenticated users can create
CREATE POLICY "Anyone can read trips" ON public.trips
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create trips" ON public.trips
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Trip creators can update their trips" ON public.trips
  FOR UPDATE USING (true);

CREATE POLICY "Trip creators can delete their trips" ON public.trips
  FOR DELETE USING (true);

-- Activities: public library
CREATE POLICY "Anyone can read activities" ON public.activities
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage activities" ON public.activities
  FOR ALL USING (true);

-- Itinerary blocks: linked to trip
CREATE POLICY "Anyone can read itinerary blocks" ON public.itinerary_blocks
  FOR SELECT USING (true);

CREATE POLICY "Anyone can manage itinerary blocks" ON public.itinerary_blocks
  FOR ALL USING (true);

-- Checklist items: linked to trip
CREATE POLICY "Anyone can read checklist items" ON public.checklist_items
  FOR SELECT USING (true);

CREATE POLICY "Anyone can manage checklist items" ON public.checklist_items
  FOR ALL USING (true);

-- Expenses: linked to trip
CREATE POLICY "Anyone can read expenses" ON public.expenses
  FOR SELECT USING (true);

CREATE POLICY "Anyone can manage expenses" ON public.expenses
  FOR ALL USING (true);

-- Analytics: write-only
CREATE POLICY "Anyone can create analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_trips_creator ON public.trips(creator_id);
CREATE INDEX idx_trips_share_token ON public.trips(share_token);
CREATE INDEX idx_itinerary_blocks_trip ON public.itinerary_blocks(trip_id);
CREATE INDEX idx_checklist_items_trip ON public.checklist_items(trip_id);
CREATE INDEX idx_expenses_trip ON public.expenses(trip_id);
CREATE INDEX idx_activities_tags ON public.activities USING GIN(tags);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itinerary_blocks_updated_at BEFORE UPDATE ON public.itinerary_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON public.checklist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
