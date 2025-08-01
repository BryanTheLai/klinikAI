import { generateText, convertToModelMessages, tool, stepCountIs } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"
import { TriageResultSchema } from "@/lib/types"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, language = "en" } = await req.json()

    console.log("Chat API called with:", { messagesCount: messages.length, language })
    console.log("Messages:", JSON.stringify(messages, null, 2))

    // Initialize Google AI with API key
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
    })

    const languageInstructions = {
      en: "Respond in English",
      ms: "Respond in Bahasa Malaysia", 
      zh: "Respond in Chinese (Simplified)",
    }

    // Convert messages to the format expected by generateText
    const conversationMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.parts?.[0]?.text || msg.content || ""
    }))

    console.log("Conversation context:", conversationMessages.length, "messages")

    const { text: response, steps } = await generateText({
      model: google("gemini-2.0-flash"),
      system: `You are KlinikAI, a medical booking agent for Malaysia's healthcare system. Your PRIMARY MEDICAL RESPONSIBILITY is to connect patients with appropriate healthcare providers IMMEDIATELY.

🚨 HEALTHCARE PRIORITY PROTOCOL:
1. EMERGENCY symptoms → Direct to 24-hour emergency centers
2. URGENT symptoms → Same-day/next-day specialist appointments  
3. ROUTINE symptoms → General practitioners or specialists within 1-3 days

🏥 MALAYSIAN HEALTHCARE SPECIALTIES AVAILABLE (USE EXACT NAMES):
- General Practitioner, Family Medicine, Internal Medicine
- Emergency Medicine, Critical Care, Trauma Surgery
- Cardiology, Neurology, Gastroenterology, Pulmonology, Nephrology
- ENT (Ear, Nose, Throat), Ophthalmology, Dermatology
- Orthopedic Surgery, General Surgery, Plastic Surgery
- Obstetrics & Gynecology, Pediatrics, Neonatology
- Oncology, Hematology, Infectious Diseases, Psychiatry
- Radiology, Pathology, Anesthesiology

🔑 CRITICAL: Use EXACT specialty names (e.g., "ENT (Ear, Nose, Throat)" not "ENT")

⚡ IMMEDIATE ACTION SEQUENCE:
When patient reports ANY symptom:
1. INSTANTLY call triagePatient (analyze symptom + determine specialty + urgency)
2. INSTANTLY call getClinicRecommendations (find appropriate healthcare providers)
3. PRESENT healthcare options with MEDICAL RATIONALE
4. PRIORITIZE booking based on medical urgency

📋 HEALTHCARE-FOCUSED RESPONSE:
"Based on your [symptom], this requires [specialty] care with [urgency] priority.

🏥 **RECOMMENDED: [Hospital/Clinic Name]** 
📍 [Location]
⭐ Best for your condition - [Medical reason why]
⏰ Available: Tomorrow 9 AM

🏥 [Alternative Option 1] - [Distance/Type]
🏥 [Alternative Option 2] - [Distance/Type]

**For your health and safety, shall I book you at [RECOMMENDED] for tomorrow 9 AM?**"

🔴 BOOKING PROTOCOL:
- When user says "yes" to booking, use the EXACT clinic ID from getClinicRecommendations
- Example: If clinic has ID "8", pass clinicId: "8" (NOT the clinic name)
- Always use the numeric ID from the clinics array returned by getClinicRecommendations

🔴 EMERGENCY PROTOCOLS:
- Chest pain, severe bleeding, difficulty breathing → Emergency centers ONLY
- Persistent symptoms > 24hrs → Specialist referral recommended  
- Routine issues → GP first, specialist if needed

${languageInstructions[language as keyof typeof languageInstructions]}

Think like a healthcare professional - prioritize patient safety and appropriate care levels!`,

      messages: conversationMessages,
      tools: {
        triagePatient: tool({
          description: "IMMEDIATELY analyze patient symptoms. Call this as soon as user mentions ANY health issue. Never ask for more details first.",
          inputSchema: TriageResultSchema,
          execute: async (triageResult) => {
            console.log("Triage result:", triageResult)
            return {
              success: true,
              specialty: triageResult.identifiedSpecialty,
              urgency: triageResult.urgency,
              summary: triageResult.summaryForClinician,
              instructions: triageResult.nextStepForPatient,
              message: `✅ Analysis complete: ${triageResult.identifiedSpecialty} specialty, ${triageResult.urgency} urgency - NOW FIND CLINICS`
            }
          },
        }),

        getClinicRecommendations: tool({
          description: "IMMEDIATELY find clinics after triage. Call this right after triagePatient to get clinic options.",
          inputSchema: z.object({
            specialty: z.string().describe("Medical specialty from triage"),
            urgency: z.enum(["low", "medium", "high", "emergency"]).describe("Urgency from triage"),
          }),
          execute: async ({ specialty, urgency }) => {
            try {
              console.log("Getting clinic recommendations for:", { specialty, urgency })
              
              const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/clinic-recommendations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ specialty, urgency }),
              })

              if (!response.ok) {
                throw new Error("Failed to fetch clinic recommendations")
              }

              const data = await response.json()
              console.log("Found clinics:", data.clinics?.length || 0)
              
              return {
                success: true,
                clinics: data.clinics || [],
                count: data.clinics?.length || 0,
                topClinicId: data.clinics?.[0]?.id,
                topClinicName: data.clinics?.[0]?.name,
                message: `✅ Found ${data.clinics?.length || 0} ${specialty} clinics. TOP RECOMMENDATION: ${data.clinics?.[0]?.name} (ID: ${data.clinics?.[0]?.id}) - PRESENT OPTIONS TO USER NOW`
              }
            } catch (error) {
              console.error("Error getting clinic recommendations:", error)
              return {
                success: false,
                error: "Failed to get clinic recommendations",
                message: "I apologize, but I couldn't retrieve clinic recommendations at the moment. Please try again."
              }
            }
          },
        }),

        bookAppointment: tool({
          description: "IMMEDIATELY book appointment when user agrees. Call this as soon as user says yes/ok/sure to booking. Use the EXACT clinic ID from the previous clinic recommendations (e.g., '8', '7', '10').",
          inputSchema: z.object({
            clinicId: z.string().describe("The EXACT numeric ID of the chosen clinic from previous getClinicRecommendations response (e.g., '8', not clinic name)"),
            clinicName: z.string().describe("The name of the chosen clinic").optional(),
            specialty: z.string().describe("The medical specialty").optional(),
            urgency: z.string().describe("The urgency level").optional(),
            summaryForClinician: z.string().describe("Clinical summary").optional(),
            nextStepForPatient: z.string().describe("Patient instructions").optional(),
          }),
          execute: async ({ clinicId, clinicName, specialty, urgency, summaryForClinician, nextStepForPatient }) => {
            try {
              console.log("Booking appointment for clinic:", clinicId)
              
              const triageResult = {
                identifiedSpecialty: specialty || "General",
                urgency: urgency || "medium",
                summaryForClinician: summaryForClinician || "Patient consultation requested",
                nextStepForPatient: nextStepForPatient || "Please arrive 15 minutes early for your appointment"
              }

              const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/book-appointment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clinicId, triageResult }),
              })

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || "Failed to book appointment")
              }

              const data = await response.json()
              console.log("Appointment booked successfully:", data.appointment?.id)
              
              return {
                success: true,
                appointmentId: data.appointment?.id,
                clinic: data.appointment?.clinic,
                appointmentTime: data.appointment?.appointmentTime,
                instructions: data.appointment?.instructions,
                message: `✅ Appointment successfully booked at ${data.appointment?.clinic} for ${new Date(data.appointment?.appointmentTime).toLocaleString()}`
              }
            } catch (error) {
              console.error("Error booking appointment:", error)
              return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                message: "I apologize, but I couldn't book the appointment at the moment. Please try calling the clinic directly."
              }
            }
          },
        }),
      },
      stopWhen: stepCountIs(10),
    })

    // Log the agent steps for debugging
    console.log("Agent completed", steps.length, "steps")
    steps.forEach((step, index) => {
      console.log(`Step ${index + 1}:`, {
        toolCalls: step.toolCalls?.length || 0,
        finishReason: step.finishReason
      })
    })

    return new Response(JSON.stringify({ response }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : String(error) 
      }), 
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
