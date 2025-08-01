// Quick test script to verify the booking agent flow
// Run this in Node: node test-booking-flow.js

const baseUrl = 'http://localhost:3000';

async function testBookingFlow() {
  console.log("🏥 Testing KlinikAI Booking Flow...");
  
  // Test 1: Initial symptom input
  const symptomInput = "I have nose bleed";
  console.log(`\n👤 User: "${symptomInput}"`);
  
  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: symptomInput }
        ]
      })
    });
    
    const data = await response.json();
    console.log("🤖 Agent Response:", data);
    
    if (data.response) {
      console.log("✅ Agent successfully processed symptom");
      console.log("📝 Response:", data.response);
      
      // Check if it includes clinic recommendations
      if (data.response.includes("clinic") || data.response.includes("hospital") || data.response.includes("ENT")) {
        console.log("✅ Agent provided clinic recommendations");
      } else {
        console.log("❌ Agent did not provide clinic recommendations");
      }
      
      // Check if it includes booking information
      if (data.response.includes("book") || data.response.includes("appointment")) {
        console.log("✅ Agent offered booking assistance");
      } else {
        console.log("❌ Agent did not offer booking assistance");
      }
    } else {
      console.log("❌ No response received from agent");
    }
    
  } catch (error) {
    console.error("❌ Error testing booking flow:", error);
  }
}

// Auto-run the test
testBookingFlow();
