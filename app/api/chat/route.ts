import { streamText, tool } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { TriageResultSchema } from "@/lib/types"
import { createServerClient } from "@/lib/supabase"
import { ClinicRecommendations } from "@/components/clinic-recommendations"

export const maxDuration = 30

async function findClinics(specialty: string) {
  const supabase = createServerClient()

  try {
    // First, let's find specialties that match
    const { data: specialties, error: specialtyError } = await supabase
      .from("specialties")
      .select("id, name")
      .ilike("name", `%${specialty}%`)

    if (specialtyError) {
      console.error("Error fetching specialties:", specialtyError)
      return []
    }

    if (!specialties || specialties.length === 0) {
      // Fallback to General Practitioner if no specialty found
      const { data: gpSpecialty } = await supabase
        .from("specialties")
        .select("id")
        .eq("name", "General Practitioner")
        .single()

      if (gpSpecialty) {
        specialties.push({ id: gpSpecialty.id, name: "General Practitioner" })
      }
    }

    // Now find clinics with these specialties
    const { data: clinics, error: clinicError } = await supabase
      .from("clinics")
      .select(`
        id,
        name,
        address,
        clinic_specialties!inner(
          specialties!inner(name)
        )
      `)
      .in(
        "clinic_specialties.specialty_id",
        specialties.map((s) => s.id),
      )
      .limit(3)

    if (clinicError) {
      console.error("Error fetching clinics:", clinicError)
      return []
    }

    return (
      clinics?.map((clinic) => ({
        id: clinic.id,
        name: clinic.name,
        address: clinic.address || "Address not available",
        specialties: clinic.clinic_specialties?.map((cs: any) => cs.specialties.name) || [],
      })) || []
    )
  } catch (error) {
    console.error("Error in findClinics:", error)
    return []
  }
}

export async function POST(req: Request) {
  try {
    const { messages, language = "en" } = await req.json()

    console.log("Chat API called with:", { messagesCount: messages.length, language })

    // Initialize Google AI with API key
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
    })

    const languageInstructions = {
      en: "Respond in English",
      ms: "Respond in Bahasa Malaysia",
      zh: "Respond in Chinese (Simplified)",
    }

    const result = await streamText({
      model: google("gemini-1.5-flash"),
      system: `You are KlinikAI Triage Agent, an expert AI medical assistant for Malaysia.

IMPORTANT INSTRUCTIONS:
1. ${languageInstructions[language as keyof typeof languageInstructions]}.
2. Be empathetic, professional, and culturally sensitive to Malaysian patients.
3. Ask ONE question at a time to understand their symptoms thoroughly.
4. Gather information about: symptoms, duration, severity, location, triggers.
5. Once you have sufficient information (after 2-3 exchanges), you MUST call the 'performTriage' tool.
6. Do NOT provide medical diagnoses - only triage and recommend appropriate specialists.
7. Be reassuring and explain that you're helping them find the right healthcare provider.

Remember: You are helping patients navigate the Malaysian healthcare system efficiently.`,
      messages,
      tools: {
        performTriage: tool({
          description: "Performs medical triage analysis and finds suitable clinics in Malaysia.",
          parameters: TriageResultSchema,
          execute: async (triageResult) => {
            console.log("Triage tool called with:", triageResult)

            try {
              // Find matching clinics
              const clinics = await findClinics(triageResult.identifiedSpecialty)
              console.log("Found clinics:", clinics)

              // Return the UI component with clinic recommendations
              return <ClinicRecommendations clinics={clinics} triageResult={triageResult} />
            } catch (error) {
              console.error("Error in performTriage tool:", error)
              return (
                <div className="p-4 bg-red-50 text-red-800 rounded-lg">
                  Sorry, there was an error finding clinics. Please try again.
                </div>
              )
            }
          },
        }),
      },
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(JSON.stringify({ error: "Internal server error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
