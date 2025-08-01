import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { clinicId, triageResult } = await req.json()
    const supabase = createServerClient()

    // Check if clinic exists
    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .select("id, name")
      .eq("id", clinicId)
      .single()

    if (clinicError || !clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 })
    }

    // For now, use a test patient ID - in production you'd get this from auth
    const testPatientId = "00000000-0000-0000-0000-000000000001"

    // Create appointment scheduled for next business day
    const appointmentTime = new Date()
    appointmentTime.setDate(appointmentTime.getDate() + 1)
    appointmentTime.setHours(9, 0, 0, 0) // 9 AM next day

    const appointmentData = {
      patient_id: testPatientId,
      clinic_id: clinicId,
      appointment_time: appointmentTime.toISOString(),
      status: "CONFIRMED" as const,
      triage_summary: triageResult?.summaryForClinician || "Patient consultation requested",
      patient_instructions: triageResult?.nextStepForPatient || "Please arrive 15 minutes early for your appointment",
      triage_payload: triageResult || {},
    }

    // Actually insert the appointment
    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert(appointmentData)
      .select("*")
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        clinic: clinic.name,
        appointmentTime: appointment.appointment_time,
        instructions: appointment.patient_instructions,
      },
    })
  } catch (error) {
    console.error("Booking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
