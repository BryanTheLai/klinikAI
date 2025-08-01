-- KlinikAI Complete Database Reset and Setup
-- Run this in your Supabase SQL editor to completely reset and rebuild the database

-- =============================================
-- STEP 1: DROP ALL EXISTING TABLES AND TYPES
-- =============================================

-- Drop tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.clinic_specialties CASCADE;
DROP TABLE IF EXISTS public.clinics CASCADE;
DROP TABLE IF EXISTS public.specialties CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- =============================================
-- STEP 2: CREATE FRESH SCHEMA
-- =============================================

-- Create custom types
CREATE TYPE user_role AS ENUM ('PATIENT', 'CLINICIAN');
CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- Create specialties table (simple primary key)
CREATE TABLE public.specialties (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- Create clinics table (simple primary key to match our inserts)
CREATE TABLE public.clinics (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL,
    longitude DECIMAL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create users table (for auth integration)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'PATIENT',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clinic_specialties junction table
CREATE TABLE public.clinic_specialties (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    specialty_id INTEGER NOT NULL REFERENCES public.specialties(id) ON DELETE CASCADE,
    UNIQUE(clinic_id, specialty_id)
);

-- Create appointments table
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    patient_id UUID REFERENCES public.users(id),
    clinic_id INTEGER REFERENCES public.clinics(id),
    appointment_time TIMESTAMPTZ NOT NULL,
    status appointment_status NOT NULL DEFAULT 'PENDING',
    triage_summary TEXT,
    patient_instructions TEXT,
    triage_payload JSONB
);

-- =============================================
-- STEP 3: ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_specialties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow read access to specialties" ON public.specialties FOR SELECT USING (true);
CREATE POLICY "Allow read access to clinics" ON public.clinics FOR SELECT USING (true);
CREATE POLICY "Allow read access to clinic_specialties" ON public.clinic_specialties FOR SELECT USING (true);

-- User policies
CREATE POLICY "Users can view own profile" ON public.users FOR ALL USING (auth.uid() = id);

-- Appointment policies  
CREATE POLICY "Users can view own appointments" ON public.appointments FOR ALL USING (patient_id = auth.uid());

-- =============================================
-- STEP 4: INSERT COMPREHENSIVE SPECIALTIES
-- =============================================

INSERT INTO public.specialties (name, description) VALUES
-- Primary Care
('General Practitioner', 'Family medicine and primary care'),
('Family Medicine', 'Comprehensive family healthcare'),
('Internal Medicine', 'Adult internal medicine'),

-- Emergency & Critical Care
('Emergency Medicine', '24-hour emergency care'),
('Critical Care', 'Intensive care unit medicine'),
('Trauma Surgery', 'Emergency surgical procedures'),

-- Medical Specialties
('Cardiology', 'Heart and cardiovascular system'),
('Neurology', 'Brain and nervous system disorders'),
('Gastroenterology', 'Digestive system disorders'),
('Pulmonology', 'Lung and respiratory system'),
('Nephrology', 'Kidney diseases and disorders'),
('Endocrinology', 'Hormonal and metabolic disorders'),
('Rheumatology', 'Autoimmune and inflammatory diseases'),
('Hematology', 'Blood disorders'),
('Oncology', 'Cancer diagnosis and treatment'),
('Infectious Diseases', 'Bacterial, viral, and parasitic infections'),
('Geriatrics', 'Healthcare for elderly patients'),

-- Surgical Specialties
('General Surgery', 'General surgical procedures'),
('Orthopedic Surgery', 'Bones, joints, and musculoskeletal system'),
('Neurosurgery', 'Surgical treatment of nervous system disorders'),
('Cardiac Surgery', 'Heart surgery'),
('Plastic Surgery', 'Reconstructive and cosmetic surgery'),
('Vascular Surgery', 'Blood vessel surgery'),
('Urological Surgery', 'Urinary tract surgery'),

-- Women & Children
('Obstetrics & Gynecology', 'Women''s reproductive health and pregnancy'),
('Pediatrics', 'Medical care for infants, children, and adolescents'),
('Neonatology', 'Newborn intensive care'),

-- Specialized Care
('ENT (Ear, Nose, Throat)', 'Otolaryngology - ear, nose, throat, and related structures'),
('Ophthalmology', 'Eye and vision care'),
('Dermatology', 'Skin, hair, and nail conditions'),
('Psychiatry', 'Mental health and behavioral disorders'),
('Radiology', 'Medical imaging and diagnostics'),
('Pathology', 'Laboratory medicine and disease diagnosis'),
('Anesthesiology', 'Pain management and anesthesia'),
('Physical Medicine & Rehabilitation', 'Rehabilitation medicine'),
('Occupational Medicine', 'Work-related health issues');

-- =============================================
-- STEP 5: INSERT COMPREHENSIVE MALAYSIAN CLINICS
-- =============================================

INSERT INTO public.clinics (name, address, latitude, longitude) VALUES
-- Major Public Hospitals
('Hospital Kuala Lumpur', 'Jalan Pahang, 53000 Kuala Lumpur', 3.1735, 101.7029),
('Hospital Selayang', 'Lebuhraya Selayang-Kepong, 68100 Selayang', 3.2561, 101.6517),
('Hospital Sungai Buloh', 'Jalan Hospital, 47000 Sungai Buloh', 3.2341, 101.5779),
('Hospital Tengku Ampuan Rahimah', 'Jalan Langat, 41200 Klang', 3.0167, 101.4333),
('Hospital Ampang', 'Jalan Mewah Utara, Pandan Mewah, 68000 Ampang', 3.1569, 101.7644),
('Hospital Putrajaya', 'Presint 7, 62250 Putrajaya', 2.9264, 101.6964),

-- Major Private Hospitals
('Sunway Medical Centre', 'No. 5, Jalan Lagoon Selatan, 47500 Subang Jaya', 3.0733, 101.6067),
('Prince Court Medical Centre', '39, Jalan Kia Peng, 50450 Kuala Lumpur', 3.1579, 101.7106),
('Gleneagles Kuala Lumpur', '286 & 288, Jalan Ampang, 50450 Kuala Lumpur', 3.1634, 101.7158),
('Pantai Hospital Kuala Lumpur', '8, Jalan Bukit Pantai, 59100 Kuala Lumpur', 3.1215, 101.6753),
('Columbia Asia Hospital - Klang', 'No. 1, Jalan Tiara 2A, 41000 Klang', 3.0167, 101.4500),
('Tropicana Medical Centre', '11, Jalan Teknologi, Tropicana, 47410 Petaling Jaya', 3.1126, 101.6296),
('KPJ Damansara Specialist Hospital', '119, Jalan SS 20/10, 47400 Petaling Jaya', 3.1298, 101.6194),
('SJMC (Subang Jaya Medical Centre)', 'No. 1, Jalan SS 12/1A, 47500 Subang Jaya', 3.0738, 101.5951),
('Metro Specialist Hospital', '2, Jalan Datuk Sulaiman, TTDI, 60000 Kuala Lumpur', 3.1390, 101.6423),

-- Specialist Centers
('National Heart Institute (IJN)', '145, Jalan Tun Razak, 50400 Kuala Lumpur', 3.1681, 101.7186),
('National Cancer Institute (IKN)', '4, Jalan P7, Presint 7, 62250 Putrajaya', 2.9264, 101.6964),
('Tun Hussein Onn National Eye Hospital', 'Jalan Tun Razak, 50400 Kuala Lumpur', 3.1598, 101.7213),
('University Malaya Medical Centre (UMMC)', 'Jalan Universiti, 59100 Kuala Lumpur', 3.1215, 101.6592),
('KL Fertility Centre', 'No. 31, Jalan 17/54, 46400 Petaling Jaya', 3.1068, 101.6424),

-- General Practitioners & Clinics
('Klinik Mediviron TTDI', 'No. 38G, Jalan Burhanuddin Helmi, TTDI, 60000 Kuala Lumpur', 3.1390, 101.6423),
('Poliklinik Mediviron Subang', 'No. 47G, Jalan SS 15/4B, 47500 Subang Jaya', 3.0738, 101.5951),
('BP Healthcare Group Clinic', 'Lot G23A, Ground Floor, Quill City Mall KL', 3.1516, 101.6986),
('Klinik Dr. Rela', 'Jalan Klang Lama, 58000 Kuala Lumpur', 3.0738, 101.6668),
('Klinik Primer 1Malaysia Cheras', 'Jalan Cheras, 56000 Kuala Lumpur', 3.1212, 101.7360),
('Klinik Kesihatan Setapak', 'Jalan Genting Klang, 53300 Kuala Lumpur', 3.2067, 101.7240),
('Poliklinik Tawakal', '202, Jalan Pahang, 53000 Kuala Lumpur', 3.1745, 101.7055),
('Klinik Dr. Ng (Kepong)', '12, Jalan Kepong, 52100 Kuala Lumpur', 3.2190, 101.6424),
('Klinik Pakar KL', '50, Jalan Pudu, 55100 Kuala Lumpur', 3.1390, 101.7018),

-- Dental Clinics
('Smileage Dental Bangsar', 'No. 1, Jalan Maarof, 59000 Kuala Lumpur', 3.1319, 101.6668),
('Dental Focus Mont Kiara', 'No. 9, Jalan Kiara 3, 50480 Kuala Lumpur', 3.1680, 101.6515),

-- 24-Hour Emergency Centers
('Columbia Asia Emergency - 24hr', 'Multiple Locations - Petaling Jaya', 3.1068, 101.6424),
('Sunway Emergency Department - 24hr', 'Sunway Medical Centre, Subang Jaya', 3.0738, 101.5951),
('Hospital Kuala Lumpur Emergency', 'Jalan Pahang, 53000 Kuala Lumpur (Emergency Dept)', 3.1735, 101.7029),
('Sunway Medical Emergency', 'No. 5, Jalan Lagoon Selatan (Emergency), 47500 Subang Jaya', 3.0733, 101.6067);

-- =============================================
-- STEP 6: MAP CLINICS TO SPECIALTIES
-- =============================================

-- Major Public Hospitals (Full Service)
INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id
FROM public.clinics c, public.specialties s
WHERE c.name = 'Hospital Kuala Lumpur' AND s.name IN (
    'General Practitioner', 'Emergency Medicine', 'Internal Medicine', 'Cardiology', 
    'Neurology', 'General Surgery', 'Orthopedic Surgery', 'Obstetrics & Gynecology', 
    'Pediatrics', 'ENT (Ear, Nose, Throat)', 'Ophthalmology', 'Radiology', 'Pathology',
    'Gastroenterology', 'Pulmonology', 'Nephrology', 'Endocrinology', 'Infectious Diseases'
);

INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id
FROM public.clinics c, public.specialties s
WHERE c.name = 'Hospital Selayang' AND s.name IN (
    'General Practitioner', 'Emergency Medicine', 'Internal Medicine', 'Cardiology', 
    'Pediatrics', 'Orthopedic Surgery', 'ENT (Ear, Nose, Throat)', 'Radiology',
    'Neurology', 'Ophthalmology'
);

INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id
FROM public.clinics c, public.specialties s
WHERE c.name = 'Hospital Sungai Buloh' AND s.name IN (
    'Emergency Medicine', 'Infectious Diseases', 'Pulmonology', 'Critical Care', 
    'Internal Medicine', 'General Practitioner'
);

INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id
FROM public.clinics c, public.specialties s
WHERE c.name = 'Hospital Ampang' AND s.name IN (
    'General Practitioner', 'Emergency Medicine', 'Orthopedic Surgery', 'ENT (Ear, Nose, Throat)',
    'Cardiology', 'Pediatrics'
);

INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id
FROM public.clinics c, public.specialties s
WHERE c.name = 'Hospital Putrajaya' AND s.name IN (
    'General Practitioner', 'Emergency Medicine', 'Internal Medicine', 'Cardiology', 
    'Pediatrics', 'Obstetrics & Gynecology', 'ENT (Ear, Nose, Throat)'
);

-- Major Private Hospitals (Premium Service)
INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id
FROM public.clinics c, public.specialties s
WHERE c.name = 'Sunway Medical Centre' AND s.name IN (
    'General Practitioner', 'Cardiology', 'Neurology', 'Oncology', 'Orthopedic Surgery', 
    'Pediatrics', 'Obstetrics & Gynecology', 'Gastroenterology', 'ENT (Ear, Nose, Throat)', 
    'Ophthalmology', 'Dermatology', 'Emergency Medicine', 'Plastic Surgery'
);

INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id
FROM public.clinics c, public.specialties s
WHERE c.name = 'Prince Court Medical Centre' AND s.name IN (
    'Cardiology', 'Neurology', 'Oncology', 'Cardiac Surgery', 'Neurosurgery', 
    'Plastic Surgery', 'Gastroenterology', 'Orthopedic Surgery', 'ENT (Ear, Nose, Throat)'
);

INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id
FROM public.clinics c, public.specialties s
WHERE c.name = 'Gleneagles Kuala Lumpur' AND s.name IN (
    'General Practitioner', 'Cardiology', 'Neurology', 'Orthopedic Surgery', 
    'ENT (Ear, Nose, Throat)', 'Ophthalmology', 'Dermatology', 'Emergency Medicine',
    'Oncology', 'Gastroenterology'
);

INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id
FROM public.clinics c, public.specialties s
WHERE c.name = 'Pantai Hospital Kuala Lumpur' AND s.name IN (
    'Pediatrics', 'Obstetrics & Gynecology', 'ENT (Ear, Nose, Throat)', 'General Practitioner', 
    'Cardiology', 'Emergency Medicine', 'Dermatology'
);

INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id
FROM public.clinics c, public.specialties s
WHERE c.name = 'SJMC (Subang Jaya Medical Centre)' AND s.name IN (
    'General Practitioner', 'Emergency Medicine', 'Cardiology', 'Orthopedic Surgery', 
    'ENT (Ear, Nose, Throat)', 'Ophthalmology', 'Pediatrics', 'Neurology'
);

INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id
FROM public.clinics c, public.specialties s
WHERE c.name = 'Tropicana Medical Centre' AND s.name IN (
    'General Practitioner', 'Pediatrics', 'Obstetrics & Gynecology', 'Dermatology', 
    'ENT (Ear, Nose, Throat)', 'Emergency Medicine'
);

-- Specialist Centers (Highly Specialized)
INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id
FROM public.clinics c, public.specialties s
WHERE c.name = 'National Heart Institute (IJN)' AND s.name IN ('Cardiology', 'Cardiac Surgery', 'Critical Care');

INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id
FROM public.clinics c, public.specialties s
WHERE c.name = 'Tun Hussein Onn National Eye Hospital' AND s.name IN ('Ophthalmology');

INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id
FROM public.clinics c, public.specialties s
WHERE c.name = 'National Cancer Institute (IKN)' AND s.name IN ('Oncology', 'Hematology', 'Radiology');

INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id
FROM public.clinics c, public.specialties s
WHERE c.name = 'University Malaya Medical Centre (UMMC)' AND s.name IN (
    'General Practitioner', 'Cardiology', 'Neurology', 'Orthopedic Surgery', 'Pediatrics',
    'Obstetrics & Gynecology', 'ENT (Ear, Nose, Throat)', 'Oncology', 'Neurosurgery'
);

INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id
FROM public.clinics c, public.specialties s
WHERE c.name = 'KL Fertility Centre' AND s.name IN ('Obstetrics & Gynecology', 'Endocrinology');

-- General Practitioners & Clinics
INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id
FROM public.clinics c, public.specialties s
WHERE c.name IN (
    'Klinik Mediviron TTDI', 'Poliklinik Mediviron Subang', 'Klinik Dr. Rela',
    'Klinik Primer 1Malaysia Cheras', 'Klinik Kesihatan Setapak', 'Poliklinik Tawakal',
    'Klinik Dr. Ng (Kepong)', 'Klinik Pakar KL'
) AND s.name IN ('General Practitioner', 'Family Medicine');

INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id
FROM public.clinics c, public.specialties s
WHERE c.name = 'BP Healthcare Group Clinic' AND s.name IN ('General Practitioner', 'Occupational Medicine');

-- Emergency Centers
INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id
FROM public.clinics c, public.specialties s
WHERE c.name IN (
    'Columbia Asia Emergency - 24hr', 'Sunway Emergency Department - 24hr',
    'Hospital Kuala Lumpur Emergency', 'Sunway Medical Emergency'
) AND s.name IN ('Emergency Medicine', 'Critical Care', 'General Practitioner');

-- =============================================
-- STEP 7: CREATE TEST USER AND SAMPLE DATA
-- =============================================

-- Create a test patient (without foreign key to auth.users for testing)
INSERT INTO public.users (id, full_name, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Test Patient',
    'PATIENT'
);

-- Create sample appointments
INSERT INTO public.appointments (id, patient_id, clinic_id, appointment_time, status, triage_summary, patient_instructions, triage_payload) 
VALUES 
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.clinics WHERE name = 'Sunway Medical Centre' LIMIT 1),
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    'CONFIRMED',
    'Patient reporting nosebleed, ENT evaluation needed',
    'Please arrive 15 minutes early. Avoid nose picking before appointment.',
    '{"identifiedSpecialty": "ENT (Ear, Nose, Throat)", "urgency": "medium", "symptoms": ["nosebleed"], "nextStepForPatient": "Apply pressure and lean forward"}'::jsonb
);

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Show summary of what was created
SELECT 
    'Specialties' as table_name,
    COUNT(*) as record_count
FROM public.specialties

UNION ALL

SELECT 
    'Clinics' as table_name,
    COUNT(*) as record_count
FROM public.clinics

UNION ALL

SELECT 
    'Clinic-Specialty Mappings' as table_name,
    COUNT(*) as record_count
FROM public.clinic_specialties

UNION ALL

SELECT 
    'Users' as table_name,
    COUNT(*) as record_count
FROM public.users

UNION ALL

SELECT 
    'Appointments' as table_name,
    COUNT(*) as record_count
FROM public.appointments;

-- Show ENT clinics specifically
SELECT 
    c.name as clinic_name,
    c.address,
    s.name as specialty_name
FROM public.clinics c
JOIN public.clinic_specialties cs ON c.id = cs.clinic_id
JOIN public.specialties s ON cs.specialty_id = s.id
WHERE s.name = 'ENT (Ear, Nose, Throat)'
ORDER BY c.name;
