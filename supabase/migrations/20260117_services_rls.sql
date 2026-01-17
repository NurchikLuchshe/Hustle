-- RLS Policies for Services table
-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Vendors can view only their own services
CREATE POLICY "Vendors view own services"
ON services FOR SELECT
TO authenticated
USING (vendor_id IN (
  SELECT id FROM vendors WHERE user_id = auth.uid()
));

-- Vendors can create services for themselves
CREATE POLICY "Vendors create own services"
ON services FOR INSERT
TO authenticated
WITH CHECK (vendor_id IN (
  SELECT id FROM vendors WHERE user_id = auth.uid()
));

-- Vendors can update their own services
CREATE POLICY "Vendors update own services"
ON services FOR UPDATE
TO authenticated
USING (vendor_id IN (
  SELECT id FROM vendors WHERE user_id = auth.uid()
));

-- Vendors can delete their own services
CREATE POLICY "Vendors delete own services"
ON services FOR DELETE
TO authenticated
USING (vendor_id IN (
  SELECT id FROM vendors WHERE user_id = auth.uid()
));

-- Public can view active services (for booking page)
CREATE POLICY "Public view active services"
ON services FOR SELECT
TO anon
USING (is_active = true AND is_online_bookable = true);
