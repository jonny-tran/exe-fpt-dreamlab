-- Create destinations table
CREATE TABLE destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create attractions table
CREATE TABLE attractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    lat FLOAT8,
    lng FLOAT8,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index on destination_id for better query performance
CREATE INDEX attractions_destination_id_idx ON attractions(destination_id);

-- Enable Row Level Security (RLS)
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attractions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Allow public read access on destinations"
    ON destinations
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public read access on attractions"
    ON attractions
    FOR SELECT
    TO public
    USING (true);