import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get appointments for clinician's clinic
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_time,
        status,
        triage_summary,
        patient_instructions,
        clinics!inner(id, name, owner_id),
        users!appointments_patient_id_fkey(id, full_name)
      `)
      .eq("clinics.owner_id", user.id)
      .order("appointment_time", { ascending: true })

    if (error) {
      console.error("Error fetching appointments:", error)
      return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
    }

    const formattedAppointments =
      appointments?.map((apt) => ({
        id: apt.id,
        appointmentTime: apt.appointment_time,
        status: apt.status,
        triageSummary: apt.triage_summary,
        clinic: {
          id: apt.clinics.id,
          name: apt.clinics.name,
        },
        patient: {
          id: apt.users.id,
          fullName: apt.users.full_name || "Unknown Patient",
        },
      })) || []

    return NextResponse.json({ appointments: formattedAppointments })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
