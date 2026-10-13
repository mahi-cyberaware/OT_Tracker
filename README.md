WorkTrack V29.0

<p align="center">
  <img src="https://img.shields.io/badge/WorkTrack-V29.0-4F46E5?style=for-the-badge&logo=github&logoColor=white" alt="WorkTrack V29.0">
  <img src="https://img.shields.io/badge/Status-Active%20Development-16A34A?style=for-the-badge" alt="Active Development">
</p><p align="center">
  <img src="https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=black" alt="Supabase">
  <img src="https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=flat-square" alt="PWA">
</p><p align="center">
  <b>Attendance • Hours • Overtime • Written Statements</b>
</p>---
WorkTrack V18

# WorkTrack — Attendance & Overtime

A simple multi-user attendance tracker built with HTML, CSS, JavaScript, Supabase and Vercel.

## Current calculation
- Worked hours = Check-out minus Check-in.
- Overnight shifts are supported (for example 18:00 → 04:00 = 10 hours).
- Overtime = Worked hours minus daily duty hours, never below zero.
- Break minutes are not used by the current app.
- Existing `break_minutes` database column is retained for compatibility and is always saved as 0 by the current UI.

## Features
- Email sign up / login with Supabase Auth.
- Production redirect to the Vercel site after email confirmation.
- Private records using Supabase Row Level Security.
- Monthly dashboard and calendar.
- Present, Leave, Off day and Holiday statuses.
- Edit and delete attendance.
- Monthly CSV export.
- Configurable daily duty hours (default 9).
- Mobile-friendly responsive layout.

## Deployment
Static files can be deployed directly to Vercel. Update `app.js` only if the Supabase project credentials or production URL change.

## Security
Use the Supabase Publishable key in the browser. Never put a Supabase Secret/service-role key in frontend code.


V16 adds a menu-based interface, footer, About, Contact, and Security & Privacy sections.

V16 adds a unified clickable WorkTrack logo, centered footer, and repaired reminder controls/notification flow.


V16 adds an authenticated Change Password option under the user menu.


V16 moves Change Password from the main menu into Settings.


V16 adds secure password change: current-password verification or email OTP recovery before setting a new password.


V16 adds a polished Home experience with WorkTrack branding, insight slider, today's work card, and quick actions. No database migration is required.


## V18 — Smart Roster & Duty Reminder
- Admin-only full-roster Excel import with Employee ID matching.
- Revised uploads replace represented employees within the uploaded date range.
- Admin can edit or delete individual roster entries.
- Users can view only their own saved roster.
- Tomorrow duty and wake-up reminder follow roster changes automatically.
- Overnight duty times are supported.


## V19.2.1 Smart Duty Alerts

- Prominent in-app 🚨 dialog for tomorrow's scheduled duty.
- Shows duty date, duty time, and calculated wake-up time.
- Optional device notification is also sent when browser notification permission is granted.
- Includes a **Test duty alert** button.
- Day Off and non-duty entries do not trigger a duty alert.

> Web/PWA alerts are subject to Android/browser background restrictions; a web app cannot guarantee a native alarm after the operating system has fully stopped the app.
