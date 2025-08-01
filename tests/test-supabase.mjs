// Test 1: Supabase Connection Test
import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"
import { resolve } from "path"

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("🔗 Testing Supabase Connection...")
console.log("URL:", supabaseUrl ? "✅ Set" : "❌ Missing")
console.log("Key:", supabaseAnonKey ? "✅ Set (length: " + (supabaseAnonKey?.length || 0) + ")" : "❌ Missing")

if (!supabaseUrl || !supabaseAnonKey) {
  console.log("❌ Missing Supabase environment variables!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function testSupabaseConnection() {
  try {
    console.log("\n🔍 Testing database connection...")
    
    // Test 1: Can we connect?
    const { data, error } = await supabase
      .from('specialties')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log("❌ Connection error:", error.message)
      return false
    }
    
    console.log("✅ Database connection successful")
    
    // Test 2: What specialties exist?
    console.log("\n📋 Checking specialties...")
    const { data: specialties, error: specError } = await supabase
      .from('specialties')
      .select('*')
      .limit(10)
    
    if (specError) {
      console.log("❌ Specialties error:", specError.message)
      return false
    } else {
      console.log(`Found ${specialties?.length || 0} specialties:`)
      specialties?.slice(0, 5).forEach(s => console.log(`  - ${s.name}`))
      if (specialties?.length > 5) console.log(`  ... and ${specialties.length - 5} more`)
    }
    
    // Test 3: What clinics exist?
    console.log("\n🏥 Checking clinics...")
    const { data: clinics, error: clinicError } = await supabase
      .from('clinics')
      .select('*')
      .limit(5)
    
    if (clinicError) {
      console.log("❌ Clinics error:", clinicError.message)
      return false
    } else {
      console.log(`Found ${clinics?.length || 0} clinics:`)
      clinics?.forEach(c => console.log(`  - ${c.name}`))
    }
    
    // Test 4: Check clinic_specialties mapping
    console.log("\n🔗 Checking clinic-specialty mappings...")
    const { data: mappings, error: mapError } = await supabase
      .from('clinic_specialties')
      .select('*')
      .limit(10)
    
    if (mapError) {
      console.log("❌ Mapping error:", mapError.message)
      return false
    } else {
      console.log(`Found ${mappings?.length || 0} clinic-specialty mappings`)
    }
    
    // Test 5: Test ENT specialty specifically
    console.log("\n🩺 Testing ENT specialty query...")
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
      .limit(5)
    
    if (entError) {
      console.log("❌ ENT query error:", entError.message)
      return false
    } else {
      console.log(`Found ${entClinics?.length || 0} ENT clinics:`)
      entClinics?.forEach(c => console.log(`  - ${c.name}`))
    }
    
    return true
    
  } catch (error) {
    console.log("❌ Test failed:", error.message)
    return false
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testSupabaseConnection()
}
