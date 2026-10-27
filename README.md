# IMD Care — Smart Healthcare Platform
> **Problem Statement 6: AI for Smarter Healthcare**  
> AI Tech Ideathon Healthcare Prototype  
> *"Your health, made easier."*

---

## 1. Overview
**IMD Care** is a full-stack, AI-powered healthcare education and wellness management platform built to bridge the gap between complex health data and patient understanding. Designed under strict medical safety principles and ethical AI governance, IMD Care delivers:
- **AI Health Assistant**: Conversational health education powered by Google's latest Gemini models via the official `@google/genai` TypeScript SDK.
- **Multilingual Healthcare Support**: Complete trilingual localization across English, Hindi (हिंदी), and Marathi (मराठी) with instantaneous language switching.
- **Smart Symptom Guidance**: Multi-factor symptom evaluation with **instant deterministic safety checks** for acute emergencies prior to any AI processing.
- **Medical Report Simplifier**: Plain-language breakdown of laboratory results, reference ranges, and abnormal markers, paired with prepared doctor discussion points.
- **Preventive Healthcare**: Daily hydration, sleep, and physical activity trackers, coupled with persistent medication and clinical appointment reminders.
- **Demo User Sign-in & Personas**: Multi-role switcher allowing testing as a Patient, Caregiver, or Clinical Researcher with persistent active session context.
- **Live System Diagnostics**: In-app diagnostic inspection suite under Settings to probe API latency, connectivity status, and environment health.
- **Privacy & Safety Center**: Zero permanent chat retention, backend-only secret isolation, and direct emergency hotline directory.

---

## 2. Key Technology Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons, React Router v7.
- **Backend**: Node.js, Express.js REST API with input validation, request limits, and deterministic safety rules.
- **AI Integration**: Google Gemini API (`@google/genai` SDK v2.4+), utilizing model `gemini-3.8-flash` on the server.
- **Persistence**: File-based persistent store (`data/reminders.json`) for reminders and browser `localStorage` for non-sensitive wellness counters.

---

## 3. Project Structure
```
imd-care/
├── data/                         # Persistent local JSON data store
│   └── reminders.json            # Scheduled reminders & appointments
├── server/
│   ├── routes/
│   │   ├── healthAssistant.ts    # AI Health Assistant endpoint
│   │   ├── symptomGuidance.ts    # Symptom intake & evaluation
│   │   ├── reportSimplifier.ts   # Multimodal / text lab simplifier
│   │   ├── reminders.ts          # Reminders CRUD API
│   │   └── wellnessTips.ts       # Preventive health advice generator
│   ├── gemini.ts                 # Server-side @google/genai initialization
│   └── safety.ts                 # Deterministic clinical red-flag detector
├── src/
│   ├── components/
│   │   ├── DisclaimerBanner.tsx  # Persistent medical disclaimer bar
│   │   ├── EmergencyModal.tsx    # 911/112/988 crisis modal
│   │   ├── Header.tsx            # App header with live AI status
│   │   └── Sidebar.tsx           # Responsive sidebar navigation
│   ├── pages/
│   │   ├── Dashboard.tsx         # Welcome banner, 4 feature cards, wellness
│   │   ├── HealthAssistant.tsx   # Interactive chat with suggested prompts
│   │   ├── SymptomGuidance.tsx   # Symptom assessment & 4-section results
│   │   ├── MedicalReports.tsx    # Drag-and-drop & synthetic sample analyzer
│   │   ├── PreventiveHealthcare.tsx # 4 wellness & schedule modules
│   │   └── Settings.tsx          # System telemetry, privacy & hotlines
│   ├── types/
│   │   └── index.ts              # Data contracts & interfaces
│   ├── App.tsx                   # Top-level routing & layout wrapper
│   ├── main.tsx                  # React entry point
│   └── index.css                 # Base theme variables & Tailwind imports
├── .env.example                  # Environment configuration template
├── package.json                  # Dependencies & scripts
├── server.ts                     # Full-stack server with dev Vite middleware
└── vite.config.ts                # Vite build configuration
```

---

## 4. Getting Started & Installation

### Prerequisites
- Node.js (version 18.0.0 or higher)
- npm or yarn
- Google Gemini API key (optional for basic review; demo fallbacks and sample synthetic reports are included)

### Step 1: Clone and Install Dependencies
```bash
# In the project root:
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
# Gemini API Key (obtained from Google AI Studio)
GEMINI_API_KEY="your_gemini_api_key_here"

# Model name (default: gemini-3.8-flash)
GEMINI_MODEL="gemini-3.8-flash"

# Port
PORT=3000
```

> **Security Note:** `.env` is listed in `.gitignore`. Secrets remain strictly on the backend and are never sent to the browser.

---

## 5. Running the Application

### Development Mode (Full-Stack Express + Vite)
```bash
npm run dev
```
The application will start on `http://localhost:3000`.

### Production Build & Execution
```bash
# 1. Build client assets
npm run build

# 2. Start production server
npm run start
```

### Windows Terminal (PowerShell / Command Prompt)
```powershell
# Install
npm install

# Run dev
npm run dev

# Run production
npm run build; npm run start
```

---

## 6. Available Demo Features for Ideathon Reviewers

1. **Dashboard Overview**:
   - Time-sensitive greeting ("Good morning / afternoon").
   - Four distinct interactive module cards leading to dedicated workflows.
   - Live upcoming reminders toggleable directly from the dashboard.
   - Quick-add buttons for hydration (+250ml, +500ml).

2. **AI Health Assistant**:
   - Try the suggested chips: *"What does blood pressure mean?"*, *"Explain dehydration in simple words."*
   - Type custom follow-up questions to test contextual memory.
   - Test red-flag phrases (e.g. *"I am feeling severe crushing chest pain"*) to see immediate emergency override.

3. **Symptom Guidance**:
   - Click one of the 4 pre-loaded synthetic scenarios:
     - **Tension Headache (Mild)**: Generates 4-section educational guidance.
     - **Seasonal Allergies (Moderate)**: Practical non-pharmacological self-care.
     - **Dehydration (Mild)**: Recovery hydration guidelines.
     - **Critical Chest Pain (Emergency Test)**: Triggers instant red-flag warning and emergency telephone links without AI latency.

4. **Medical Report Simplifier**:
   - Click **"Try Sample Report (Synthetic CMP)"** to load a realistic Comprehensive Metabolic Panel and Lipid Profile with flagged borderline glucose and LDL.
   - Click **Analyze Report** to view the 7 structured sections, test definitions, printed reference intervals, and questions for your doctor.
   - Filter by All, Flagged, or Normal tests.
   - Upload your own `.txt`, `.png`, `.jpg`, or `.pdf` file up to 10MB.

5. **Preventive Healthcare**:
   - **Wellness Tracker**: Adjust water, sleep hours, and physical activity; type a daily reflection note.
   - **Reminders**: Create, edit, mark complete, and delete medication schedules and clinical visits with full backend persistence.
   - **Wellness Tips**: Switch categories (*sleep, hydration, movement, stress*) to fetch fresh AI suggestions.

6. **Multilingual & Localization**:
   - Switch language at any time via the top header dropdown between **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.
   - All navigation items, disclaimer banners, symptom triage labels, and emergency alerts render in the selected language.

7. **Sign-In / Demo Personas**:
   - Click the profile avatar or "Sign In" button in the top navigation.
   - Switch between **Dr. Aarav Sharma (Patient)**, **Sunita Patel (Caregiver)**, or **Rohan Deshmukh (Medical Student)** to test role-based presentation.

8. **Live Diagnostics & Diagnostics Suite**:
   - Open **Settings** -> **System Diagnostics**.
   - Review live backend server latency, Gemini API connectivity, model name resolution, and memory usage.
   - Use the **Export Full Archive** button to trigger `/api/export-archive` for instant offline backup.

9. **Safety & Settings**:
   - Verify live API connectivity via `/api/health`.
   - Clear local cached demonstration data with one click.
   - Access the complete Emergency Hotlines Directory (911, 112, 988, Poison Control).

---

## 7. Healthcare Safety & Limitations
- **Informational Prototype Only**: IMD Care is created for educational ideathon demonstration purposes. It is **not** a certified medical device and does not provide clinical diagnostic services.
- **Zero Hallucination Guardrails**: Laboratory values and reference ranges are strictly extracted from input documents; never fabricated.
- **Non-Prescriptive**: IMD Care does not recommend or modify pharmaceutical prescriptions or dosages.
- **Emergency Priority**: In life-threatening emergencies, users are instructed to dial 911 (US/Canada), 112 (EU), 999 (UK), or 988 (Crisis) immediately.
