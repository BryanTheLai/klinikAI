// Test 2: API Endpoints Test
import { testSupabaseConnection } from './test-supabase.mjs'

const baseUrl = 'http://localhost:3000'

async function testAPIEndpoints() {
  console.log("🧪 Testing API Endpoints...")
  
  try {
    // Test 1: Test clinic-recommendations API
    console.log("\n1️⃣ Testing clinic-recommendations API...")
    
    const clinicResponse = await fetch(`${baseUrl}/api/clinic-recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        specialty: 'ENT (Ear, Nose, Throat)', 
        urgency: 'medium' 
      })
    })
    
    const clinicData = await clinicResponse.json()
    console.log("Clinic recommendations response:", clinicData)
    
    if (clinicData.clinics && clinicData.clinics.length > 0) {
      console.log("✅ Found", clinicData.clinics.length, "ENT clinics")
    } else {
      console.log("❌ No ENT clinics found")
    }
    
    // Test 2: Test with General Practitioner
    console.log("\n2️⃣ Testing with General Practitioner...")
    
    const gpResponse = await fetch(`${baseUrl}/api/clinic-recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        specialty: 'General Practitioner', 
        urgency: 'low' 
      })
    })
    
    const gpData = await gpResponse.json()
    console.log("GP recommendations response:", gpData)
    
    if (gpData.clinics && gpData.clinics.length > 0) {
      console.log("✅ Found", gpData.clinics.length, "GP clinics")
    } else {
      console.log("❌ No GP clinics found")
    }
    
    // Test 3: Test chat API
    console.log("\n3️⃣ Testing chat API...")
    
    const chatResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'I have nose bleed' }
        ]
      })
    })
    
    const chatData = await chatResponse.json()
    console.log("Chat response:", chatData)
    
    if (chatData.response) {
      console.log("✅ Chat API working")
      
      // Check if it mentions clinics
      if (chatData.response.includes("clinic") || chatData.response.includes("hospital")) {
        console.log("✅ Agent found clinics")
      } else {
        console.log("❌ Agent didn't find clinics")
      }
      
      // Check if it offers booking
      if (chatData.response.includes("book") || chatData.response.includes("appointment")) {
        console.log("✅ Agent offers booking")
      } else {
        console.log("❌ Agent doesn't offer booking")
      }
    } else {
      console.log("❌ Chat API not working")
    }
    
  } catch (error) {
    console.error("❌ API test error:", error)
  }
}

async function runAllTests() {
  console.log("🚀 Running KlinikAI Tests...\n")
  
  // Test 1: Database connection
  const dbOk = await testSupabaseConnection()
  
  if (!dbOk) {
    console.log("\n❌ Database tests failed. Please check your Supabase setup.")
    return
  }
  
  console.log("\n" + "=".repeat(50))
  
  // Test 2: API endpoints
  await testAPIEndpoints()
  
  console.log("\n🎉 All tests completed!")
}

runAllTests()
