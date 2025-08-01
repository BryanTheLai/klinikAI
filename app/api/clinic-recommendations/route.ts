import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { specialty, urgency } = await req.json()
    const supabase = createServerClient()

    if (!specialty) {
      return NextResponse.json({ error: "Specialty is required" }, { status: 400 })
    }

    console.log("Finding clinics for:", { specialty, urgency })

    // Enhanced query to get clinics with better sorting
    const { data: clinics, error } = await supabase
      .from("clinics")
      .select(`
        id,
        name,
        address,
        latitude,
        longitude,
        clinic_specialties!inner(
          specialties!inner(
            name
          )
        )
      `)
      .eq("clinic_specialties.specialties.name", specialty)
      .limit(10) // Get more options for better filtering

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch clinics" }, { status: 500 })
    }

    if (!clinics || clinics.length === 0) {
      console.log("No clinics found for specialty:", specialty)
      return NextResponse.json({ 
        clinics: [],
        message: `No clinics found offering ${specialty} services. Please try a General Practitioner for referral.`
      })
    }

    // Transform and prioritize clinics based on healthcare logic
    const formattedClinics = clinics.map((clinic) => ({
      id: clinic.id,
      name: clinic.name,
      address: clinic.address,
      specialties: [specialty],
      // Add healthcare context
      type: getClinicType(clinic.name),
      priority: getHealthcarePriority(clinic.name, urgency)
    }))

    // Sort by healthcare priorities
    formattedClinics.sort((a, b) => {
      // Emergency cases - prioritize emergency centers and hospitals
      if (urgency === "emergency" || urgency === "high") {
        if (a.type === "emergency" && b.type !== "emergency") return -1
        if (b.type === "emergency" && a.type !== "emergency") return 1
        if (a.type === "hospital" && b.type === "clinic") return -1
        if (b.type === "hospital" && a.type === "clinic") return 1
      }
      
      // For routine care, balance between accessibility and quality
      return b.priority - a.priority
    })

    // Limit to top 5 most relevant options
    const topClinics = formattedClinics.slice(0, 5)

    console.log("Returning", topClinics.length, "prioritized clinics")

    return NextResponse.json({
      clinics: topClinics,
      urgency,
      specialty,
      total: topClinics.length
    })
  } catch (error) {
    console.error("Clinic recommendations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Healthcare logic helpers
function getClinicType(name: string): "emergency" | "hospital" | "specialist" | "clinic" {
  const lowerName = name.toLowerCase()
  
  if (lowerName.includes("emergency") || lowerName.includes("24hr") || lowerName.includes("24-hour")) {
    return "emergency"
  }
  
  if (lowerName.includes("hospital") || lowerName.includes("medical centre") || lowerName.includes("medical center")) {
    return "hospital"
  }
  
  if (lowerName.includes("specialist") || lowerName.includes("institute") || lowerName.includes("centre")) {
    return "specialist"
  }
  
  return "clinic"
}

function getHealthcarePriority(name: string, urgency: string): number {
  let priority = 0
  const lowerName = name.toLowerCase()
  
  // Base priority by institution reputation and capability
  if (lowerName.includes("national") || lowerName.includes("ijN")) priority += 50
  if (lowerName.includes("prince court") || lowerName.includes("gleneagles")) priority += 40
  if (lowerName.includes("sunway") || lowerName.includes("pantai")) priority += 35
  if (lowerName.includes("columbia") || lowerName.includes("tropicana")) priority += 30
  if (lowerName.includes("hospital")) priority += 25
  if (lowerName.includes("medical centre")) priority += 20
  if (lowerName.includes("klinik") || lowerName.includes("clinic")) priority += 15
  
  // Adjust for urgency
  if (urgency === "emergency") {
    if (lowerName.includes("emergency") || lowerName.includes("24")) priority += 100
    if (lowerName.includes("hospital")) priority += 50
  } else if (urgency === "high") {
    if (lowerName.includes("specialist") || lowerName.includes("hospital")) priority += 30
  }
  
  return priority
}
