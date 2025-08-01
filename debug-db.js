// Debug script to check database
const baseUrl = 'http://localhost:3000';

async function debugDatabase() {
  console.log("🔍 Debugging Database...");
  
  try {
    // Test 1: Check if we can get any specialties
    console.log("\n1. Testing specialties endpoint...");
    const specialtyResponse = await fetch(`${baseUrl}/api/clinic-recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ specialty: 'General Practitioner', urgency: 'low' })
    });
    
    const specialtyData = await specialtyResponse.json();
    console.log("General Practitioner clinics:", specialtyData);
    
    // Test 2: Check ENT specifically
    console.log("\n2. Testing ENT specialty...");
    const entResponse = await fetch(`${baseUrl}/api/clinic-recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ specialty: 'ENT (Ear, Nose, Throat)', urgency: 'medium' })
    });
    
    const entData = await entResponse.json();
    console.log("ENT clinics:", entData);
    
    // Test 3: Try different specialty names
    console.log("\n3. Testing variations...");
    const variations = ['ENT', 'Ear, Nose, Throat', 'Otolaryngology'];
    
    for (const specialty of variations) {
      const response = await fetch(`${baseUrl}/api/clinic-recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialty, urgency: 'medium' })
      });
      
      const data = await response.json();
      console.log(`${specialty}:`, data.clinics?.length || 0, "clinics found");
    }
    
  } catch (error) {
    console.error("❌ Error debugging database:", error);
  }
}

debugDatabase();
