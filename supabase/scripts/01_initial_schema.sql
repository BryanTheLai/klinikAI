-- File: supabase/scripts/01_initial_schema.sql
-- 1. User Roles Enum
CREATE TYPE user_role AS ENUM ('PATIENT', 'CLINICIAN');

-- 2. Users Table (extends auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'PATIENT'
);

-- 3. Specialties Lookup Table
CREATE TABLE public.specialties (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- 4. Clinics Table
CREATE TABLE public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    address TEXT,
    latitude FLOAT,
    longitude FLOAT,
    owner_id UUID REFERENCES public.users(id)
);

-- 5. Clinic_Specialties Join Table
CREATE TABLE public.clinic_specialties (
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    specialty_id INTEGER REFERENCES public.specialties(id) ON DELETE CASCADE,
    PRIMARY KEY (clinic_id, specialty_id)
);

-- 6. Appointment Status Enum
CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- 7. Appointments Table
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    patient_id UUID REFERENCES public.users(id),
    clinic_id UUID REFERENCES public.clinics(id),
    appointment_time TIMESTAMPTZ NOT NULL,
    status appointment_status NOT NULL DEFAULT 'PENDING',
    triage_summary TEXT, -- AI-generated summary for the clinician
    patient_instructions TEXT, -- AI-generated simple instructions for the patient
    triage_payload JSONB -- Raw JSON from the AI tool call for debugging
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_specialties ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.users FOR ALL TO authenticated USING (auth.uid() = id);

CREATE POLICY "Clinicians can view their own clinics" ON public.clinics FOR ALL TO authenticated 
USING (owner_id = auth.uid());

CREATE POLICY "Clinicians can view their own clinic's appointments" ON public.appointments FOR SELECT TO authenticated
USING ((SELECT owner_id FROM public.clinics WHERE id = appointments.clinic_id) = auth.uid());

CREATE POLICY "Patients can view their own appointments" ON public.appointments FOR SELECT TO authenticated
USING (patient_id = auth.uid());

CREATE POLICY "Anyone can view specialties" ON public.specialties FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can view clinic specialties" ON public.clinic_specialties FOR SELECT TO authenticated USING (true);

-- Insert sample data
INSERT INTO public.specialties (name) VALUES 
('General Practitioner'),
('Cardiology'),
('ENT'),
('Dermatology'),
('Orthopedics'),
('Pediatrics'),
('Gynecology'),
('Neurology'),
('Psychiatry'),
('Ophthalmology');
