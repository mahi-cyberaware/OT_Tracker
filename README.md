# WorkTrack V27.1

## Attendance • Hours • Overtime • Written Statements

WorkTrack is a private workforce management platform designed to simplify attendance tracking, working-hour calculations, overtime management, employee profiles, OCR-assisted incident capture, and professional written-statement preparation.

## ✨ V27.1 — Current Release

### 👤 Employee Profile
- Profile picture upload, change, and removal
- Employee information and profile management
- Supabase-backed secure profile storage

### 📊 Attendance & Hours
- Attendance tracking
- Working-hour calculation
- Overtime calculation
- Attendance percentage
- Monthly workforce overview

### 📝 AI Written Statements
- OCR-assisted incident information
- Base/Ramp-aware statement opening
- OCR treated as the questioning/complaint
- Staff explanation treated as the response
- AI-assisted professional statement generation
- Automatic provider fallback
- Built-in statement fallback when external AI is unavailable

### 📄 Professional PDF
- Staff statement formatting
- Incident details
- Employee details
- Signature and officer sections
- A4 print/PDF support

### 🔐 Security
- Supabase authentication
- Supabase Storage
- Row-level security architecture
- API credentials stored through environment variables
- AI credentials kept server-side

## 🤖 AI Providers

- Google Gemini
- Groq
- Cerebras
- OpenAI
- Built-in fallback statement engine

## 🏗️ Technology

- HTML5
- CSS3
- JavaScript
- Supabase
- OCR
- Vercel
- Progressive Web App (PWA)

## 🚀 Version History

| Version | Focus |
|---|---|
| V18 | Original WorkTrack foundation |
| V19–V22 | Attendance, UI and workflow improvements |
| V23 | AI/API and OCR integration |
| V24–V26 | UI, workflow and reliability improvements |
| **V27** | AI fallback and profile picture functionality |
| **V27.1** | Profile avatar, statement and update-slide fixes |

## 🎯 Core Workflow

```text
LOGIN
  ↓
WORKSPACE
  ↓
ATTENDANCE / HOURS / OVERTIME
  ↓
WRITTEN STATEMENT
  ↓
UPLOAD REPORT
  ↓
OCR
  ↓
INCIDENT DETAILS
  ↓
STAFF EXPLANATION
  ↓
AI GENERATION
  ↓
REVIEW & EDIT
  ↓
PRINT / SAVE PDF
```

## 📌 Project Status

**Current Version: V27.1**  
**Status: Active Development**

## 🔒 Private Project

WorkTrack is intended for authorized personal/workforce use.

**Built with focus. Built for operations.**
