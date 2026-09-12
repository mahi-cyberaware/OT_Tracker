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

# WorkTrack — Attendance • Hours • Overtime

**WorkTrack** is a modern, mobile-friendly attendance, working-hours, overtime, and duty-roster tracking application.

It is designed to make daily attendance management simple while providing smart roster visibility, overtime calculations, reports, reminders, and a secure private-user experience.

---

## ✨ Overview

WorkTrack combines:

- 🔐 Secure user authentication
- 👤 Personal employee profile
- 🕒 Check-in / check-out tracking
- ⏱️ Automatic worked-hours calculation
- 💰 Overtime calculation
- 📅 Monthly calendar and attendance history
- 📊 Monthly analytics
- 🗓️ Private duty roster
- 🚨 Smart next-duty reminders
- 🛡️ Admin-only roster management
- 📄 PDF and CSV exports
- 📱 Progressive Web App (PWA) support
- ⚙️ Personal settings and account security

---

## 🚀 Main Features

### 🔐 Authentication

- User registration and login
- Email-based authentication
- Password change
- Email change
- Mobile number add/change
- Private user sessions
- Supabase Authentication integration

---

### 👤 Employee Profile

Users can maintain personal information including:

- First name
- Surname
- Company
- Employee ID
- Position
- Email
- Mobile number

---

## 🕒 Attendance Management

WorkTrack supports the following attendance statuses:

- Present
- Absent
- Sick Leave
- Annual Leave
- Comp-Off
- Day Off
- Public Holiday

Each attendance record can contain:

- Date
- Check-in
- Check-out
- Worked hours
- Regular hours
- Overtime
- Overtime reason
- Notes

### Overnight Shifts

Overnight duties are fully supported.

Example:

`20:00 → 04:00`

The system correctly recognizes that the checkout occurs on the following day.

Another example:

`20:00 → 08:00`

---

## 📊 Dashboard

The dashboard provides a monthly overview of:

- Working days
- Day-off count
- Leave count
- Attendance percentage
- Regular hours
- Overtime hours
- Total worked hours
- Average hours per day
- Public-holiday work

The dashboard is designed to provide important information at a glance.

---

## 📅 Monthly Calendar

The monthly calendar provides a visual attendance overview.

Users can:

- Navigate between months
- View attendance by date
- Identify overtime days
- Identify leave/off days
- Identify public holidays
- Open attendance details
- Edit attendance records

---

# 🗓️ Smart Duty Roster

WorkTrack provides a private duty roster for each employee.

Roster matching is primarily based on:

**Employee ID**

Each employee can view only their own roster.

Roster information includes:

- Date
- Day
- Duty start
- Duty end
- Day Off
- Duty status

### Overnight Roster

The roster supports overnight duties such as:

`20:00 → 08:00`

---

# 🚨 Smart Next Duty

WorkTrack automatically identifies the next scheduled duty from the latest private roster.

The system displays:

- Next duty date
- Next duty time
- Wake-up time
- Reminder information

Example:

**Next Duty**

`20:00 → 08:00`

**Wake-up**

`18:00`

when the user has selected a 2-hour wake-up lead time.

---

## ⏰ Wake-Up Reminder

The default wake-up lead time is:

**2 hours before duty**

Users can change it according to their preference.

Available options:

- 30 minutes
- 1 hour
- 1 hour 30 minutes
- 2 hours
- 3 hours

The selected value is used to calculate the wake-up time automatically.

### Important

When the roster is updated, the next-duty calculation uses the latest roster information.

For example:

Old:

`20:00 → 04:00`

Updated:

`20:00 → 08:00`

The next-duty display should automatically reflect:

`20:00 → 08:00`

---

# 🔔 Duty Notifications

WorkTrack includes smart duty reminders.

Depending on device/browser permissions, reminders may use:

- In-app alerts
- Browser notifications
- PWA notifications

Users can enable or disable tomorrow-duty notifications.

A test duty alert is also available.

> Web/PWA notifications depend on browser and Android operating-system permissions. A web application cannot guarantee native alarm behavior when the browser/PWA has been completely stopped by the operating system.

---

# 👑 Admin Roster Management

Roster administration is restricted to authorized administrators.

Administrators can:

- Upload the latest Excel roster
- Match employees using Employee ID
- Add roster entries
- Edit roster entries
- Delete roster entries
- Search employees
- Search by Employee ID
- Search by employee name
- Filter by month
- Filter by status
- Use the `None` filter
- Export roster to PDF
- Export roster to Excel

Normal users cannot manage the complete team roster.

---

## 🔎 Roster Filters

The roster management system supports filtering.

Available options include:

- All statuses
- Duty
- Day Off
- Annual Leave
- Sick Leave
- Comp-Off
- Public Holiday
- None

### None Filter

The `None` option can be used when the administrator wants the filtered result to show no roster entries rather than displaying the full roster.

---

# 📈 Analytics

WorkTrack provides monthly analytics including:

### Worked Hours

Visual representation of worked hours by day.

### Overtime

Visual representation of overtime by day.

### Status Mix

Overview of attendance statuses such as:

- Present
- Leave
- Day Off
- Public Holiday

Analytics help identify working-hour and overtime patterns.

---

# 💰 Overtime Calculation

WorkTrack calculates overtime automatically.

Formula:

```text
Overtime = Worked Hours − Duty Hours
