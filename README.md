# 🎯 Resume ATS Pro — Full Stack Resume Analyzer

A complete ATS (Applicant Tracking System) resume checker with deep analysis,
AI-powered chatbot, job postings, and admin dashboard.

---

## ✨ Features

### ATS Deep Check (Free Analyzer & Job Apply)
- ✅ **Skill matching** — matches 200+ tech skills against job requirements
- 📈 **Measurable impact detection** — finds/flags missing metrics (%, $, x)
- ✍️ **Action verb checker** — detects weak vs strong verbs
- 🚫 **Buzzword detector** — flags vague terms like "synergy", "guru", "ninja"
- 🗑️ **Filler phrase detector** — flags "responsible for", "worked on", etc.
- 📐 **Format checks** — line length, bullet length, word count, tables
- 📂 **Section detection** — flags missing Education/Experience/Skills/Projects
- 📞 **Contact info check** — email, phone, LinkedIn, GitHub
- 🔢 **Score breakdown** — Skills (50) + Experience (20) + Education (15) + Keywords (15)

### AI Chatbot
- Context-aware suggestions based on YOUR specific ATS results
- **Powered by Groq API** (free tier, no credit card needed)
- Falls back to smart rule-based answers if no API key

### App Sections
- 🏠 **Dashboard** — stats, recent jobs, recent ATS scores
- 💼 **Jobs** — browse/search posted jobs, apply with resume
- 🎯 **Free ATS Checker** — analyze any resume + job description
- 📊 **My Results** — view all submission scores with drill-down
- 👑 **Admin Panel** — post jobs, view all resumes, manage feedback

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+

### 1. Database Setup
```sql
CREATE DATABASE resume_analyzer;
```

### 2. Backend Setup
```bash
cd backend

# Edit src/main/resources/application.properties:
# - Set DB_PASSWORD (or update spring.datasource.password)
# - Optional: Set GROQ_API_KEY for AI chatbot

mvn clean install -DskipTests
mvn spring-boot:run
# Runs on http://localhost:8081
```

Default admin: `admin` / `admin123`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5174
```

---

## 🤖 Enable AI Chatbot (Free)

1. Sign up at **https://console.groq.com** — free, no credit card
2. Create an API key (starts with `gsk_...`)
3. Add to `backend/src/main/resources/application.properties`:
   ```properties
   app.groq.api-key=gsk_your_key_here
   ```
4. Restart the backend

The chatbot will now give intelligent, context-aware resume advice using your actual ATS analysis results.

---

## 🏗️ Project Structure

```
resume-ats-pro/
├── backend/                        # Spring Boot (Java 17)
│   └── src/main/java/com/resume/analyzer/
│       ├── config/                 # Security, CORS, AppConfig
│       ├── controller/             # REST endpoints
│       │   ├── AuthController      # Login/Register
│       │   ├── ChatController      # AI chatbot (Groq API)
│       │   ├── JobController       # Job listings
│       │   ├── ResumeController    # Resume upload + analysis
│       │   ├── AdminController     # Admin operations
│       │   └── ...
│       ├── dto/                    # Request/Response DTOs
│       ├── entity/                 # JPA entities
│       ├── repository/             # Spring Data repos
│       ├── security/               # JWT auth
│       ├── service/                # Business logic
│       └── util/
│           ├── SkillExtractor.java # 🔑 Core ATS engine
│           └── ResumeParser.java   # PDF/DOCX/DOC/TXT parser
│
└── frontend/                       # React + Vite
    └── src/
        ├── api/client.js           # Axios API calls
        ├── components/Navbar.jsx
        ├── context/AuthContext.jsx
        └── pages/
            ├── Dashboard.jsx       # Home with stats
            ├── Jobs.jsx            # Job listings (FIXED)
            ├── FreeAnalyzer.jsx    # 🔑 Deep ATS checker + chatbot
            ├── UploadResume.jsx    # Job apply + ATS results
            ├── MyResults.jsx       # History with drill-down
            ├── Login.jsx / Register.jsx
            ├── Feedback.jsx
            └── admin/
                ├── AdminDashboard.jsx
                ├── AdminJobs.jsx
                ├── AdminResumes.jsx
                └── AdminFeedback.jsx
```

---

## 🔧 Bugs Fixed

| Bug | Fix |
|-----|-----|
| Dashboard blank / "failed to get jobs" | Each API call now has individual `.catch(() => [])` — one failure won't break the whole page |
| User jobs page empty | `getJobs()` was failing silently; now shows error message clearly |
| Free analyzer same suggestions for all | Replaced generic suggestions with per-resume deep analysis (buzzwords, fillers, metrics, etc.) |
| Chatbot gave same generic answers | Now receives resume's actual ATS context; uses Groq AI when key is set |
| Admin dashboard not loading | Fixed service package references (`impl` → top-level `service`) |

---

## 📡 API Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/auth/register` | Public | Register |
| POST | `/api/auth/login` | Public | Login → JWT |
| GET | `/api/jobs` | User | List active jobs |
| POST | `/api/resumes/analyze` | User | Submit resume for job |
| POST | `/api/resumes/free-analyze` | User | Deep ATS check |
| GET | `/api/resumes/my` | User | My submissions |
| POST | `/api/chat` | User | AI chatbot message |
| GET | `/api/notifications` | User | Notifications |
| POST | `/api/admin/jobs` | Admin | Post new job |
| DELETE | `/api/admin/jobs/{id}` | Admin | Delete job |
| GET | `/api/admin/stats` | Admin | Platform stats |
| GET | `/api/admin/resumes` | Admin | All submissions |
