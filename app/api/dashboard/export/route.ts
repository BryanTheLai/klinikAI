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

    // Get all appointments for export
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_time,
        status,
        triage_summary,
        patient_instructions,
        created_at,
        clinics!inner(name, owner_id),
        users!appointments_patient_id_fkey(full_name)
      `)
      .eq("clinics.owner_id", user.id)
      .order("appointment_time", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
    }

    // Generate CSV
    const csvHeaders = "ID,Patient Name,Appointment Time,Status,Clinic,Triage Summary,Created At\n"
    const csvRows =
      appointments
        ?.map(
          (apt) =>
            `"${apt.id}","${apt.users?.full_name || "Unknown"}","${apt.appointment_time}","${apt.status}","${apt.clinics.name}","${apt.triage_summary?.replace(/"/g, '""') || ""}","${apt.created_at}"`,
        )
        .join("\n") || ""

    const csv = csvHeaders + csvRows

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="appointments.csv"',
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
