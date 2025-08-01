// Test the booking API specifically

const baseUrl = 'http://localhost:3000'

async function testBookingAPI() {
  console.log("🏥 Testing Appointment Booking API...\n")
  
  try {
    // Test booking with the format the API expects
    const bookingData = {
      clinicId: 8, // Prince Court Medical Centre
      triageResult: {
        identifiedSpecialty: "ENT (Ear, Nose, Throat)",
        urgency: "medium",
        symptoms: ["nosebleed"],
        summaryForClinician: "Patient reporting nosebleed, requires ENT evaluation",
        nextStepForPatient: "Apply pressure and lean forward. Avoid nose picking."
      }
    }
    
    console.log("📋 Booking data:", JSON.stringify(bookingData, null, 2))
    
    const response = await fetch(`${baseUrl}/api/book-appointment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log("✅ Booking successful!")
      console.log("📅 Appointment details:", JSON.stringify(data, null, 2))
    } else {
      console.log("❌ Booking failed")
      console.log("Error:", data.error)
      console.log("Status:", response.status)
    }
    
  } catch (error) {
    console.log("❌ Test failed:", error.message)
  }
}

testBookingAPI()
