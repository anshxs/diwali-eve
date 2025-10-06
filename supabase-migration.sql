
ALTER TABLE registrations 
ADD COLUMN date_of_birth DATE;
ALTER TABLE registrations 
DROP COLUMN IF EXISTS age;

-- Step 4: Make date_of_birth NOT NULL (after ensuring all rows have values)
ALTER TABLE registrations 
ALTER COLUMN date_of_birth SET NOT NULL;

-- Step 5: Update the validation function for group members
CREATE OR REPLACE FUNCTION validate_group_members()
RETURNS TRIGGER AS $$
BEGIN
    -- If registration type is GROUP, ensure group_members has exactly 3 members
    IF NEW.registration_type = 'GROUP' THEN
        IF NEW.group_members IS NULL OR jsonb_array_length(NEW.group_members) != 3 THEN
            RAISE EXCEPTION 'Group registrations must have exactly 3 group members';
        END IF;
        
        -- Validate that each group member has required fields including date_of_birth
        FOR i IN 0..2 LOOP
            IF NOT (NEW.group_members->i ? 'name' AND 
                   NEW.group_members->i ? 'email' AND 
                   NEW.group_members->i ? 'phone' AND 
                   NEW.group_members->i ? 'date_of_birth') THEN
                RAISE EXCEPTION 'Each group member must have name, email, phone, and date_of_birth';
            END IF;
        END LOOP;
    END IF;
    
    -- If registration type is SINGLE, ensure group_members is null
    IF NEW.registration_type = 'SINGLE' THEN
        NEW.group_members := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Update the registration_summary view to handle date_of_birth
DROP VIEW IF EXISTS registration_summary;

CREATE VIEW registration_summary AS
SELECT 
    r.ticket_id,
    r.name,
    r.email,
    r.phone,
    r.date_of_birth,
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
    r.created_at as registration_date,
    -- Calculate age from date_of_birth for reference
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, r.date_of_birth)) as calculated_age
FROM registrations r
LEFT JOIN payment_verifications pv ON r.ticket_id = pv.ticket_id
ORDER BY r.created_at DESC;

-- Step 7: Grant permissions on the updated view
GRANT SELECT ON registration_summary TO authenticated, anon;

-- Step 8: Add a helpful comment
COMMENT ON COLUMN registrations.date_of_birth IS 'Date of birth of the registrant (replaces age column)';
COMMENT ON VIEW registration_summary IS 'Updated summary view with date_of_birth and calculated age for admin dashboard';

-- Optional: Add index for better performance on date queries
CREATE INDEX IF NOT EXISTS idx_registrations_date_of_birth ON registrations(date_of_birth);


COMMIT;