-- Doctors Table
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    allow_2nd_week BOOLEAN DEFAULT FALSE,
    limit_2_patients BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schedules Table (Weekly template)
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 6=Sat (Adjust for Yemen: 6=Sat... 4=Thu)
    shift TEXT CHECK (shift IN ('morning', 'evening')),
    max_capacity INTEGER NOT NULL DEFAULT 20,
    available_capacity INTEGER NOT NULL DEFAULT 20,
    UNIQUE(doctor_id, day_of_week, shift)
);

-- Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES doctors(id),
    patient_name TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    shift TEXT CHECK (shift IN ('morning', 'evening')),
    booking_date DATE NOT NULL,
    queue_number INTEGER NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '48 hours')
);

-- Settings Table
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Profiles Table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    role TEXT CHECK (role IN ('admin', 'receptionist')),
    display_name TEXT
);

-- Function to handle sequential queue number
CREATE OR REPLACE FUNCTION get_next_queue_number(p_doctor_id UUID, p_date DATE, p_shift TEXT)
RETURNS INTEGER AS $$
DECLARE
    next_val INTEGER;
BEGIN
    SELECT COALESCE(MAX(queue_number), 0) + 1 INTO next_val
    FROM bookings
    WHERE doctor_id = p_doctor_id AND booking_date = p_date AND shift = p_shift;
    RETURN next_val;
END;
$$ LANGUAGE plpgsql;

-- Function to reset weekly capacity
CREATE OR REPLACE FUNCTION reset_weekly_capacity()
RETURNS VOID AS $$
BEGIN
    UPDATE schedules
    SET available_capacity = max_capacity;
END;
$$ LANGUAGE plpgsql;

-- View for daily capacity
CREATE OR REPLACE VIEW doctor_daily_stats AS
SELECT 
    d.id as doctor_id,
    d.name as doctor_name,
    s.day_of_week,
    s.shift,
    s.max_capacity,
    (SELECT count(*) FROM bookings b WHERE b.doctor_id = d.id AND b.booking_date = CURRENT_DATE AND b.shift = s.shift AND b.payment_status != 'cancelled') as current_bookings
FROM doctors d
JOIN schedules s ON d.id = s.doctor_id;
