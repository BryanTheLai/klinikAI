# KlinikAI Test Suite

This directory contains comprehensive tests for the KlinikAI booking system.

## Prerequisites

1. **Environment Setup**: Make sure you have `.env.local` with your Supabase credentials
2. **Database Setup**: Run the database scripts in Supabase SQL editor
3. **Server Running**: Start the dev server with `npm run dev`

## Test Files

### 1. `test-supabase.mjs` - Database Connection Test
Tests if we can connect to Supabase and query data.

```bash
node tests/test-supabase.mjs
```

**Expected Output:**
- ✅ Database connection successful
- ✅ Found X specialties
- ✅ Found X clinics  
- ✅ Found X clinic-specialty mappings
- ✅ Found X ENT clinics

### 2. `test-apis.mjs` - API Endpoints Test
Tests all API endpoints including the full database + API integration.

```bash
node tests/test-apis.mjs
```

**Expected Output:**
- ✅ Database connection successful
- ✅ Found X ENT clinics
- ✅ Found X GP clinics
- ✅ Chat API working
- ✅ Agent found clinics
- ✅ Agent offers booking

### 3. `test-booking-flow.mjs` - Complete Booking Flow
Tests the end-to-end user experience with multiple medical scenarios.

```bash
node tests/test-booking-flow.mjs
```

**Expected Output:**
- ✅ Agent responded
- ✅ Correctly identified [Specialty]
- ✅ Provided clinic recommendations
- ✅ Offered booking assistance

## Running All Tests

```bash
# Run individual tests
node tests/test-supabase.mjs
node tests/test-apis.mjs
node tests/test-booking-flow.mjs
```

## Troubleshooting

### ❌ Missing environment variables
- Make sure `.env.local` exists with valid Supabase credentials
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

### ❌ Database connection failed
- Verify your Supabase project is active
- Check if your API keys are correct
- Ensure RLS policies allow reads

### ❌ No clinics found
- Run the database setup scripts in Supabase SQL editor
- Check if `specialties`, `clinics`, and `clinic_specialties` tables have data

### ❌ Agent not finding clinics
- Verify the `getClinicRecommendations` tool is working via direct API test
- Check that specialty names match exactly between database and agent

## Expected Full Flow

1. User reports symptom: "I have nose bleed"
2. Agent calls `triagePatient` → identifies "ENT (Ear, Nose, Throat)"
3. Agent calls `getClinicRecommendations` → finds ENT clinics
4. Agent presents options and offers booking
5. User agrees → Agent calls `bookAppointment`
6. ✅ Appointment successfully booked
