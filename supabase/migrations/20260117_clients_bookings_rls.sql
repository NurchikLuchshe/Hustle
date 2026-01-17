-- RLS Policies for Clients and Bookings
-- Ensures vendors can only see their own clients and bookings

-- =====================================================
-- CLIENTS TABLE RLS
-- =====================================================

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Vendors can view their own clients
CREATE POLICY "Vendors can view own clients"
ON clients FOR SELECT
TO authenticated
USING (vendor_id = (
  SELECT id FROM vendors WHERE user_id = auth.uid()
));

-- Vendors can create clients for themselves
CREATE POLICY "Vendors can create own clients"
ON clients FOR INSERT
TO authenticated
WITH CHECK (vendor_id = (
  SELECT id FROM vendors WHERE user_id = auth.uid()
));

-- Vendors can update their own clients
CREATE POLICY "Vendors can update own clients"
ON clients FOR UPDATE
TO authenticated
USING (vendor_id = (
  SELECT id FROM vendors WHERE user_id = auth.uid()
))
WITH CHECK (vendor_id = (
  SELECT id FROM vendors WHERE user_id = auth.uid()
));

-- Vendors can delete their own clients
CREATE POLICY "Vendors can delete own clients"
ON clients FOR DELETE
TO authenticated
USING (vendor_id = (
  SELECT id FROM vendors WHERE user_id = auth.uid()
));

-- Public can create clients (for booking flow)
CREATE POLICY "Public can create clients for booking"
ON clients FOR INSERT
TO anon
WITH CHECK (true);

-- =====================================================
-- BOOKINGS TABLE RLS
-- =====================================================

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Vendors can view their own bookings
CREATE POLICY "Vendors can view own bookings"
ON bookings FOR SELECT
TO authenticated
USING (vendor_id = (
  SELECT id FROM vendors WHERE user_id = auth.uid()
));

-- Vendors can create bookings for themselves
CREATE POLICY "Vendors can create own bookings"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (vendor_id = (
  SELECT id FROM vendors WHERE user_id = auth.uid()
));

-- Vendors can update their own bookings
CREATE POLICY "Vendors can update own bookings"
ON bookings FOR UPDATE
TO authenticated
USING (vendor_id = (
  SELECT id FROM vendors WHERE user_id = auth.uid()
))
WITH CHECK (vendor_id = (
  SELECT id FROM vendors WHERE user_id = auth.uid()
));

-- Vendors can delete their own bookings
CREATE POLICY "Vendors can delete own bookings"
ON bookings FOR DELETE
TO authenticated
USING (vendor_id = (
  SELECT id FROM vendors WHERE user_id = auth.uid()
));

-- Public can create bookings (for booking flow)
CREATE POLICY "Public can create bookings"
ON bookings FOR INSERT
TO anon
WITH CHECK (true);

-- Public can view their own bookings (by client_id for future client portal)
CREATE POLICY "Clients can view own bookings"
ON bookings FOR SELECT
TO anon
USING (true); -- Will be refined later when we add client authentication
