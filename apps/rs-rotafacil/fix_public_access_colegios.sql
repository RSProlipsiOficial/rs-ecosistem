-- Enable RLS on tables just in case (good practice)
ALTER TABLE colegios ENABLE ROW LEVEL SECURITY;
ALTER TABLE van_colegios ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public read access for colegios" ON colegios;
DROP POLICY IF EXISTS "Public read access for van_colegios" ON van_colegios;

-- Create policies for public access (anon + authenticated)
CREATE POLICY "Public read access for colegios" ON colegios
  FOR SELECT
  USING (true);

CREATE POLICY "Public read access for van_colegios" ON van_colegios
  FOR SELECT
  USING (true);
