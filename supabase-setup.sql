-- Create the registrations table
CREATE TABLE registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    parent_husband_mobile VARCHAR(20) NOT NULL,
    registration_type VARCHAR(10) NOT NULL CHECK (registration_type IN ('SINGLE', 'GROUP')),
    group_members JSONB,
    ticket_id VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the payment_verifications table
CREATE TABLE payment_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id VARCHAR(20) NOT NULL REFERENCES registrations(ticket_id) ON DELETE CASCADE,
    payment_screenshot_url TEXT NOT NULL,
    upi_reference VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_registrations_ticket_id ON registrations(ticket_id);
CREATE INDEX idx_registrations_email ON registrations(email);
CREATE INDEX idx_registrations_created_at ON registrations(created_at);
CREATE INDEX idx_payment_verifications_ticket_id ON payment_verifications(ticket_id);
CREATE INDEX idx_payment_verifications_verified ON payment_verifications(verified);

-- Row Level Security (RLS) Policies

-- Enable RLS on both tables
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_verifications ENABLE ROW LEVEL SECURITY;

-- Registrations table policies
-- Allow INSERT for all users (public registration)
CREATE POLICY "Allow public insert on registrations" ON registrations
    FOR INSERT WITH CHECK (true);

-- Allow SELECT for all users (can view their own registrations)
CREATE POLICY "Allow public select on registrations" ON registrations
    FOR SELECT USING (true);

-- Prevent UPDATE and DELETE for regular users
CREATE POLICY "Deny update on registrations" ON registrations
    FOR UPDATE USING (false);

CREATE POLICY "Deny delete on registrations" ON registrations
    FOR DELETE USING (false);

-- Payment verifications table policies
-- Allow INSERT for payment screenshot uploads
CREATE POLICY "Allow public insert on payment_verifications" ON payment_verifications
    FOR INSERT WITH CHECK (true);

-- Allow SELECT for viewing payment status
CREATE POLICY "Allow public select on payment_verifications" ON payment_verifications
    FOR SELECT USING (true);

-- Only admin can update verification status
CREATE POLICY "Allow admin update on payment_verifications" ON payment_verifications
    FOR UPDATE USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'email' IN ('shreegarden.roorkee@gmail.com', 'admin@shreegarden.com')
    );

-- Prevent regular users from deleting payment records
CREATE POLICY "Deny delete on payment_verifications" ON payment_verifications
    FOR DELETE USING (false);

-- Create a view for registration summary (optional, for admin dashboard)
CREATE VIEW registration_summary AS
SELECT 
    r.ticket_id,
    r.name,
    r.email,
    r.phone,
    r.registration_type,
    CASE 
        WHEN r.registration_type = 'SINGLE' THEN 1
        WHEN r.registration_type = 'GROUP' THEN 4
        ELSE 1
    END as total_attendees,
    CASE 
        WHEN r.registration_type = 'SINGLE' THEN 500
        WHEN r.registration_type = 'GROUP' THEN 1600
        ELSE 500
    END as amount_due,
    pv.verified as payment_verified,
    pv.payment_screenshot_url,
    r.created_at as registration_date
FROM registrations r
LEFT JOIN payment_verifications pv ON r.ticket_id = pv.ticket_id
ORDER BY r.created_at DESC;

-- Grant necessary permissions
GRANT SELECT ON registration_summary TO authenticated, anon;
GRANT INSERT ON registrations TO authenticated, anon;
GRANT SELECT ON registrations TO authenticated, anon;
GRANT INSERT ON payment_verifications TO authenticated, anon;
GRANT SELECT ON payment_verifications TO authenticated, anon;

-- Create a function to validate group member data
CREATE OR REPLACE FUNCTION validate_group_members()
RETURNS TRIGGER AS $$
BEGIN
    -- If registration type is GROUP, ensure group_members has exactly 3 members
    IF NEW.registration_type = 'GROUP' THEN
        IF NEW.group_members IS NULL OR jsonb_array_length(NEW.group_members) != 3 THEN
            RAISE EXCEPTION 'Group registrations must have exactly 3 group members';
        END IF;
    END IF;
    
    -- If registration type is SINGLE, ensure group_members is null
    IF NEW.registration_type = 'SINGLE' THEN
        NEW.group_members := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate group members
CREATE TRIGGER validate_group_members_trigger
    BEFORE INSERT OR UPDATE ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION validate_group_members();

-- Insert some sample data for testing (optional - remove in production)
-- INSERT INTO registrations (name, email, phone, age, parent_husband_mobile, registration_type, ticket_id)
-- VALUES ('Test User', 'test@example.com', '9876543210', 25, '9876543211', 'SINGLE', 'DW2025TEST01');

COMMENT ON TABLE registrations IS 'Stores all event registrations for Diwali Night 2025';
COMMENT ON TABLE payment_verifications IS 'Stores payment screenshots and verification status';
COMMENT ON VIEW registration_summary IS 'Summary view for admin dashboard with payment status';