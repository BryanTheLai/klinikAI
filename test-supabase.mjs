// Test Supabase connection directly
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("🔗 Testing Supabase Connection...")
console.log("URL:", supabaseUrl ? "✅ Set" : "❌ Missing")
console.log("Key:", supabaseAnonKey ? "✅ Set" : "❌ Missing")

if (!supabaseUrl || !supabaseAnonKey) {
  console.log("❌ Missing Supabase environment variables!")
  console.log("Create a .env.local file with:")
  console.log("NEXT_PUBLIC_SUPABASE_URL=your_url")
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    // Test 1: Can we connect?
    console.log("\n1. Testing basic connection...")
    const { data, error } = await supabase
      .from('specialties')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log("❌ Connection error:", error.message)
      return
    }
    
    console.log("✅ Connection successful")
    
    // Test 2: What specialties exist?
    console.log("\n2. Checking specialties...")
    const { data: specialties, error: specError } = await supabase
      .from('specialties')
      .select('*')
      .limit(10)
    
    if (specError) {
      console.log("❌ Specialties error:", specError.message)
    } else {
      console.log("Specialties found:", specialties?.length || 0)
      specialties?.forEach(s => console.log("-", s.name))
    }
    
    // Test 3: What clinics exist?
    console.log("\n3. Checking clinics...")
    const { data: clinics, error: clinicError } = await supabase
      .from('clinics')
      .select('*')
      .limit(5)
    
    if (clinicError) {
      console.log("❌ Clinics error:", clinicError.message)
    } else {
      console.log("Clinics found:", clinics?.length || 0)
      clinics?.forEach(c => console.log("-", c.name))
    }
    
    // Test 4: Check clinic_specialties mapping
    console.log("\n4. Checking clinic-specialty mappings...")
    const { data: mappings, error: mapError } = await supabase
      .from('clinic_specialties')
      .select('*')
      .limit(10)
    
    if (mapError) {
      console.log("❌ Mapping error:", mapError.message)
    } else {
      console.log("Mappings found:", mappings?.length || 0)
    }
    
  } catch (error) {
    console.log("❌ Test failed:", error.message)
  }
}

testConnection()
