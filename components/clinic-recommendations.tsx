"use client"

import type { Clinic } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Calendar } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useState } from "react"

interface ClinicRecommendationsProps {
  clinics: Clinic[]
  triageResult: {
    identifiedSpecialty: string
    urgency: string
    summaryForClinician: string
    nextStepForPatient: string
  }
}

export function ClinicRecommendations({ clinics, triageResult }: ClinicRecommendationsProps) {
  const { t } = useLanguage()
  const [bookingStates, setBookingStates] = useState<Record<string, boolean>>({})

  const handleBookAppointment = async (clinicId: string) => {
    setBookingStates((prev) => ({ ...prev, [clinicId]: true }))

    try {
      const response = await fetch("/api/book-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId,
          triageResult,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Handle successful booking
        alert(`✅ Appointment booked successfully!\n\n📅 ${data.appointment.clinic}\n🕘 ${new Date(data.appointment.appointmentTime).toLocaleString()}\n\n📋 ${data.appointment.instructions}`)
      } else {
        alert(`❌ Failed to book appointment: ${data.error}`)
      }
    } catch (error) {
      console.error("Booking error:", error)
      alert("❌ Failed to book appointment. Please try again.")
    } finally {
      setBookingStates((prev) => ({ ...prev, [clinicId]: false }))
    }
  }

  return (
    <div className="space-y-4 my-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Recommended Specialty: {triageResult.identifiedSpecialty}</h3>
        <p className="text-blue-800 text-sm mb-2">
          <strong>Urgency:</strong> {triageResult.urgency}
        </p>
        <p className="text-blue-800 text-sm">
          <strong>Next Step:</strong> {triageResult.nextStepForPatient}
        </p>
      </div>

      <div className="grid gap-4">
        {clinics.map((clinic) => (
          <Card key={clinic.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{clinic.name}</CardTitle>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                {clinic.address}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {clinic.specialties.map((specialty) => (
                  <span key={specialty} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {specialty}
                  </span>
                ))}
              </div>
              <Button
                onClick={() => handleBookAppointment(clinic.id)}
                disabled={bookingStates[clinic.id]}
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {bookingStates[clinic.id] ? t("loading") : t("bookAppointment")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
