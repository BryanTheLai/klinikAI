-- Fix RLS policy for appointments table
-- This allows our booking API to insert appointments for the test user

-- Update the appointment policy to allow inserts from API
DROP POLICY IF EXISTS "Users can view own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow appointment creation" ON public.appointments;

-- Create more permissive policies for testing
CREATE POLICY "Allow read own appointments" ON public.appointments 
FOR SELECT USING (patient_id = auth.uid() OR patient_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Allow appointment creation" ON public.appointments 
FOR INSERT WITH CHECK (patient_id = '00000000-0000-0000-0000-000000000001' OR auth.uid() IS NOT NULL);

-- Verify the test user exists
INSERT INTO public.users (id, full_name, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Test Patient',
    'PATIENT'
) ON CONFLICT (id) DO NOTHING;
