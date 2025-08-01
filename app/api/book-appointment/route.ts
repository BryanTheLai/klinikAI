import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { clinicId, triageResult } = await req.json()
    const supabase = createServerClient()

    // For demo purposes, we'll create a mock appointment
    // In a real app, you'd have proper user authentication
    const mockUserId = "00000000-0000-0000-0000-000000000000"

    // Create appointment
    const appointmentTime = new Date()
    appointmentTime.setHours(appointmentTime.getHours() + 24) // Next day

    const appointmentData = {
      patient_id: mockUserId,
      clinic_id: clinicId,
      appointment_time: appointmentTime.toISOString(),
      status: "CONFIRMED" as const,
      triage_summary: triageResult?.summaryForClinician || "Patient consultation requested",
      patient_instructions: triageResult?.nextStepForPatient || "Please arrive 15 minutes early",
      triage_payload: triageResult || {},
    }

    // For demo, we'll just return success without actually inserting
    // since we don't have a real user session
    console.log("Would create appointment:", appointmentData)

    return NextResponse.json({
      success: true,
      appointment: {
        id: "demo-appointment-id",
        ...appointmentData,
      },
    })
  } catch (error) {
    console.error("Booking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
