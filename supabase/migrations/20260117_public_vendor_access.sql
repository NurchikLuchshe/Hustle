-- Allow public read access to vendors for explore page
CREATE POLICY "Public can view all vendors"
ON vendors FOR SELECT
TO anon, authenticated
USING (true);

-- Allow public read access to services
CREATE POLICY "Public can view all services"
ON services FOR SELECT
TO anon, authenticated
USING (true);
