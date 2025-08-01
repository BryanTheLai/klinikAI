// Test the actual booking conversation flow
async function testBookingConversation() {
  console.log("🗣️ Testing Real Conversation Flow...")
  
  const baseUrl = 'http://localhost:3000'
  
  // Step 1: User reports symptom
  console.log("\n1️⃣ User: 'I have nose bleed'")
  const response1 = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'I have nose bleed' }
      ]
    })
  })
  
  const data1 = await response1.json()
  console.log("🤖 Agent response 1:", data1.response.substring(0, 200) + "...")
  
  // Step 2: User says yes to booking
  console.log("\n2️⃣ User: 'yes'")
  const response2 = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'I have nose bleed' },
        { role: 'assistant', content: data1.response },
        { role: 'user', content: 'yes' }
      ]
    })
  })
  
  const data2 = await response2.json()
  console.log("🤖 Agent response 2:", data2.response)
  
  // Check if booking was successful
  if (data2.response.includes('successfully') || data2.response.includes('booked')) {
    console.log("✅ Booking SUCCESSFUL!")
  } else if (data2.response.includes('apologize') || data2.response.includes("couldn't book")) {
    console.log("❌ Booking FAILED - Agent got booking error")
  } else {
    console.log("⚠️ Booking status unclear")
  }
}

testBookingConversation().catch(console.error)
