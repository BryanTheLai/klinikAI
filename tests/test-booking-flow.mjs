// Test 3: Full Booking Flow Test
const baseUrl = 'http://localhost:3000'

async function testFullBookingFlow() {
  console.log("🏥 Testing Complete KlinikAI Booking Flow...\n")
  
  const testScenarios = [
    {
      name: "Nosebleed (ENT)",
      symptom: "I have nose bleed",
      expectedSpecialty: "ENT"
    },
    {
      name: "Chest Pain (Cardiology)", 
      symptom: "I have chest pain",
      expectedSpecialty: "Cardiology"
    },
    {
      name: "Headache (Neurology)",
      symptom: "my brain hurts",
      expectedSpecialty: "Neurology"
    }
  ]
  
  for (const scenario of testScenarios) {
    console.log(`🧪 Testing: ${scenario.name}`)
    console.log(`👤 User: "${scenario.symptom}"`)
    
    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: scenario.symptom }
          ]
        })
      })
      
      const data = await response.json()
      
      if (data.response) {
        console.log("✅ Agent responded")
        
        // Check for medical specialty
        if (data.response.toLowerCase().includes(scenario.expectedSpecialty.toLowerCase())) {
          console.log(`✅ Correctly identified ${scenario.expectedSpecialty}`)
        } else {
          console.log(`❌ Did not identify ${scenario.expectedSpecialty}`)
        }
        
        // Check for clinic recommendations (more specific patterns)
        if (data.response.includes("Medical Centre") || 
            data.response.includes("Hospital") || 
            data.response.includes("RECOMMENDED:") ||
            data.response.includes("📍")) {
          console.log("✅ Provided clinic recommendations")
        } else {
          console.log("❌ No clinic recommendations")
        }
        
        // Check for booking offer
        if (data.response.includes("book") || data.response.includes("appointment")) {
          console.log("✅ Offered booking assistance")
        } else {
          console.log("❌ No booking assistance offered")
        }
        
        console.log(`📝 Response: ${data.response.substring(0, 200)}...`)
        
      } else {
        console.log("❌ No response from agent")
        console.log("Error:", data.error || "Unknown error")
      }
      
    } catch (error) {
      console.log("❌ Test failed:", error.message)
    }
    
    console.log("\n" + "-".repeat(50) + "\n")
  }
}

testFullBookingFlow()
