// Simple database debug
import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function quickCheck() {
  console.log("🔍 Quick Database Check...\n")
  
  // Check specialties count
  const { data: specialties, error: specError } = await supabase
    .from('specialties')
    .select('*')
  
  console.log("Specialties:", specialties?.length || 0, "found")
  if (specError) console.log("Specialties error:", specError.message)
  
  // Check clinics count  
  const { data: clinics, error: clinicError } = await supabase
    .from('clinics')
    .select('*')
    
  console.log("Clinics:", clinics?.length || 0, "found")
  if (clinicError) console.log("Clinics error:", clinicError.message)
  
  // Check mappings count
  const { data: mappings, error: mapError } = await supabase
    .from('clinic_specialties')
    .select('*')
    
  console.log("Clinic-Specialty mappings:", mappings?.length || 0, "found")
  if (mapError) console.log("Mappings error:", mapError.message)
  
  // Check if we have ENT specialty
  const { data: entSpec, error: entSpecError } = await supabase
    .from('specialties')
    .select('*')
    .eq('name', 'ENT (Ear, Nose, Throat)')
    
  console.log("ENT specialty found:", entSpec?.length || 0)
  if (entSpecError) console.log("ENT specialty error:", entSpecError.message)
  
  // Try the exact query our API uses
  const { data: entClinics, error: entError } = await supabase
    .from("clinics")
    .select(`
      id,
      name,
      address,
      clinic_specialties!inner(
        specialties!inner(
          name
        )
      )
    `)
    .eq("clinic_specialties.specialties.name", "ENT (Ear, Nose, Throat)")
    
  console.log("ENT clinics from API query:", entClinics?.length || 0)
  if (entError) console.log("ENT clinics error:", entError.message)
  
  console.log("\n✅ Quick check complete")
}

quickCheck()
