import { z } from "zod"

// Zod schema for AI tool validation
export const TriageResultSchema = z.object({
  identifiedSpecialty: z.string().describe('e.g., "ENT", "Cardiology", "General Practitioner"'),
  urgency: z.enum(["low", "medium", "high", "emergency"]),
  summaryForClinician: z.string().describe("A concise, clinical summary of the user's symptoms."),
  nextStepForPatient: z.string().describe("A simple, one-sentence instruction for the user."),
})

export type TriageResult = z.infer<typeof TriageResultSchema>

export interface Clinic {
  id: string
  name: string
  address: string
  specialties: string[]
}

export interface Appointment {
  id: string
  appointmentTime: string
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  clinic: { id: string; name: string }
  patient: { id: string; fullName: string }
  triageSummary: string
}

export type Language = "en" | "ms" | "zh"

export interface User {
  id: string
  fullName: string
  role: "PATIENT" | "CLINICIAN"
}
