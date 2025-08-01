import { ChatInterface } from "@/components/chat-interface"
import { LanguageSelector } from "@/components/language-selector"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Heart, Shield, Clock } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">KlinikAI</h1>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          {/* <h2 className="text-4xl font-bold text-gray-900 mb-4">Your AI-Powered Healthcare Navigator</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get personalized medical guidance, find the right specialists, and book appointments seamlessly in Malaysia.
          </p> */}

          {/* <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Triage</h3>
              <p className="text-gray-600 text-sm">
                Smart symptom analysis to connect you with the right healthcare provider
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Instant Booking</h3>
              <p className="text-gray-600 text-sm">Book appointments with recommended clinics in just a few clicks</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Multilingual Support</h3>
              <p className="text-gray-600 text-sm">Available in English, Bahasa Malaysia, and Chinese</p>
            </div>
          </div> */}
        </div>

        <ChatInterface />
      </main>
    </div>
  )
}
