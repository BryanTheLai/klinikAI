# 🏥 KlinikAI - AI-Powered Healthcare Navigator

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/brynls-projects/v0-klinik-ai-build-instructions)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Powered by AI](https://img.shields.io/badge/Powered%20by-Google%20AI-blue?style=for-the-badge&logo=google)](https://ai.google.dev/)

> **Your intelligent healthcare companion for Malaysia** - Get personalized medical guidance, find the right specialists, and book appointments seamlessly.

## 🌟 Features

### 🤖 AI-Powered Medical Triage
- **Intelligent Symptom Analysis**: Advanced AI analyzes your symptoms and determines the appropriate medical specialty
- **Smart Urgency Assessment**: Automatically prioritizes cases based on medical urgency (Emergency, High, Medium, Low)
- **Multilingual Support**: Available in English, Bahasa Malaysia, and Chinese

### 🏥 Comprehensive Healthcare Network
- **30+ Medical Specialties**: From General Practitioners to specialized fields like Cardiology, Neurology, ENT, and more
- **Instant Clinic Recommendations**: AI matches you with the best healthcare providers based on your condition
- **Real-time Availability**: See available appointment slots and book instantly

### 📅 Seamless Appointment Booking
- **One-Click Booking**: Book appointments directly through the AI chat interface
- **Automatic Scheduling**: Smart scheduling based on urgency and availability
- **Appointment Management**: Track and manage all your appointments in one place

### 👨‍⚕️ Clinical Dashboard
- **Healthcare Provider Interface**: Dedicated dashboard for clinicians to manage patient appointments
- **Patient Triage Reports**: Detailed AI-generated summaries for each patient
- **Data Export**: Export appointment data for clinical analysis

## 🛠️ Technology Stack

### Frontend
- **Next.js 14.2.16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **Lucide React** - Modern icon library

### Backend & AI
- **Google Gemini 2.0 Flash** - Advanced AI model for medical triage
- **AI SDK** - Streaming AI responses and tool integration
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Zod** - TypeScript-first schema validation

### Infrastructure
- **Vercel** - Deployment and hosting
- **pnpm** - Fast, disk space efficient package manager
- **Row Level Security (RLS)** - Secure data access patterns

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Google AI API key
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BryanTheLai/klinikAI.git
   cd klinikAI
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your API keys:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key_here
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   # Run the database setup scripts
   pnpm run db:setup
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
klinikAI/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/login/           # Authentication endpoints
│   │   ├── chat/                 # AI chat interface
│   │   ├── clinic-recommendations/ # Healthcare provider search
│   │   ├── book-appointment/     # Appointment booking
│   │   └── dashboard/            # Clinical dashboard APIs
│   ├── dashboard/                # Clinician interface
│   ├── login/                    # Authentication pages
│   └── page.tsx                  # Main landing page
├── components/                   # Reusable React components
│   ├── ui/                       # UI component library
│   ├── auth-form.tsx            # Authentication components
│   ├── chat-interface.tsx       # AI chat interface
│   └── clinic-recommendations.tsx
├── contexts/                     # React contexts
│   └── language-context.tsx     # Internationalization
├── lib/                         # Utilities and configurations
│   ├── supabase.ts              # Database client
│   ├── types.ts                 # TypeScript definitions
│   └── i18n.ts                  # Language translations
├── supabase/                    # Database schemas and migrations
└── tests/                       # Test suites
```

## 🎯 How It Works

### 1. **Patient Interaction**
- User describes symptoms in natural language
- AI performs medical triage using Google Gemini
- System identifies appropriate medical specialty
- Urgency level is automatically assessed

### 2. **Healthcare Provider Matching**
- AI searches database of healthcare providers
- Filters by specialty, location, and availability
- Presents ranked recommendations to user
- Shows real-time appointment slots

### 3. **Appointment Booking**
- User confirms preferred clinic and time
- System books appointment automatically
- Sends confirmation with appointment details
- Generates clinical summary for healthcare provider

### 4. **Clinical Management**
- Healthcare providers access dedicated dashboard
- View scheduled appointments with AI triage summaries
- Export data for clinical analysis
- Manage patient flow efficiently

## 🔧 API Endpoints

### Public APIs
- `POST /api/chat` - AI chat interface
- `POST /api/clinic-recommendations` - Get healthcare providers
- `POST /api/book-appointment` - Book medical appointments

### Authentication APIs
- `POST /api/auth/login` - User authentication

### Clinical Dashboard APIs (Protected)
- `GET /api/dashboard/appointments` - Fetch appointments
- `GET /api/dashboard/export` - Export appointment data

## 🌍 Internationalization

KlinikAI supports three languages:
- **English** (`en`) - Primary language
- **Bahasa Malaysia** (`ms`) - National language
- **Chinese Simplified** (`zh`) - Major language

Language switching is handled through the Language Context and persisted across sessions.

## 🗄️ Database Schema

### Core Tables
- **clinics** - Healthcare provider information
- **appointments** - Appointment scheduling and management
- **patients** - Patient profiles and authentication
- **users** - System users (patients and clinicians)

### Key Features
- Row Level Security (RLS) for data protection
- Automatic timestamping
- Referential integrity constraints
- Optimized indexes for performance

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Test specific components
pnpm test:booking      # Appointment booking flow
pnpm test:supabase     # Database connectivity
pnpm test:apis         # API endpoint testing
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on every push to main

### Manual Deployment
```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 🔐 Security Features

- **Row Level Security (RLS)** - Database-level access control
- **API Route Protection** - Authenticated endpoints
- **Input Validation** - Zod schema validation
- **Environment Variable Management** - Secure configuration
- **HTTPS Enforcement** - Secure data transmission

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check our [Wiki](https://github.com/BryanTheLai/klinikAI/wiki)
- **Issues**: Report bugs or request features in [GitHub Issues](https://github.com/BryanTheLai/klinikAI/issues)
- **Discussions**: Join the conversation in [GitHub Discussions](https://github.com/BryanTheLai/klinikAI/discussions)

## 🙏 Acknowledgments

- Google AI for providing the Gemini API
- Supabase for the backend infrastructure
- Vercel for deployment and hosting
- The open-source community for the amazing tools and libraries

---

**Built with ❤️ for Malaysia's healthcare system**