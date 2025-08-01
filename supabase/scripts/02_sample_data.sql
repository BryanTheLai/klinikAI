-- Insert sample clinics and data for testing

-- First, let's create some sample clinician users (you'll need to create these in Supabase Auth first)
-- Then insert into users table with CLINICIAN role

-- Sample clinics
INSERT INTO public.clinics (id, name, address, latitude, longitude) VALUES 
(gen_random_uuid(), 'KL General Medical Centre', 'Jalan Pahang, 53000 Kuala Lumpur', 3.1569, 101.7123),
(gen_random_uuid(), 'Sunway Medical Centre', 'No. 5, Jalan Lagoon Selatan, 47500 Subang Jaya', 3.0738, 101.5951),
(gen_random_uuid(), 'Prince Court Medical Centre', 'No. 39, Jalan Kia Peng, 50450 Kuala Lumpur', 3.1478, 101.7089),
(gen_random_uuid(), 'Gleneagles Hospital KL', '282 & 286, Jalan Ampang, 50450 Kuala Lumpur', 3.1569, 101.7123),
(gen_random_uuid(), 'Pantai Hospital KL', '8, Jalan Bukit Pantai, 59100 Kuala Lumpur', 3.1319, 101.6841);

-- Link clinics to specialties
INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id 
FROM public.clinics c
CROSS JOIN public.specialties s
WHERE c.name IN ('KL General Medical Centre', 'Sunway Medical Centre') 
AND s.name IN ('General Practitioner', 'Cardiology', 'ENT');

INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id 
FROM public.clinics c
CROSS JOIN public.specialties s
WHERE c.name = 'Prince Court Medical Centre'
AND s.name IN ('Cardiology', 'Neurology', 'Orthopedics');

INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id 
FROM public.clinics c
CROSS JOIN public.specialties s
WHERE c.name = 'Gleneagles Hospital KL'
AND s.name IN ('General Practitioner', 'Dermatology', 'Ophthalmology');

INSERT INTO public.clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id 
FROM public.clinics c
CROSS JOIN public.specialties s
WHERE c.name = 'Pantai Hospital KL'
AND s.name IN ('Pediatrics', 'Gynecology', 'ENT');
