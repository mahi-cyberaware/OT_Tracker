# 🚀 WorkTrack

### Attendance • Working Hours • Overtime • Smart Roster

**WorkTrack** is a modern, private attendance and duty-management web
application designed to make daily work tracking simple, organized, and
useful for people with changing duty schedules.

It combines **attendance tracking, working-hour calculations, overtime
management, private duty rosters, roster administration, and smart duty
reminders** in one responsive application.

------------------------------------------------------------------------

## ✨ What WorkTrack Does

WorkTrack helps users:

-   🕘 Record check-in and check-out
-   ⏱️ Automatically calculate worked hours
-   💰 Calculate overtime against configured duty hours
-   📅 View monthly attendance and duty history
-   📊 Understand working hours and overtime through analytics
-   📝 Add notes and overtime reasons
-   📄 Export attendance reports
-   📋 View a private duty roster
-   🔔 Receive reminders for tomorrow's scheduled duty
-   🌙 Handle overnight shifts such as `20:00–08:00`
-   👤 Maintain personal profile information
-   🔐 Keep user records private with Supabase Row Level Security

------------------------------------------------------------------------

# 🏠 Dashboard

The WorkTrack dashboard gives users a quick overview of their month.

### Dashboard information includes

-   Working days
-   Day-off records
-   Leave records
-   Attendance percentage
-   Regular hours
-   Overtime
-   Total worked hours
-   Average hours per day
-   Public-holiday work

The Home experience also highlights the user's current work information
and provides quick access to important WorkTrack features.

------------------------------------------------------------------------

# 📋 Attendance Management

Users can record their daily attendance with:

-   Work date
-   Check-in time
-   Check-out time
-   Attendance status
-   Notes
-   Overtime reason when overtime is generated

### Supported statuses

-   ✅ Present
-   ❌ Absent
-   🤒 Sick Leave
-   🌴 Annual Leave
-   🔄 Comp-Off
-   💤 Day Off
-   🎉 Public Holiday

WorkTrack keeps attendance records separate from roster information so
users can compare their **scheduled duty** with their **actual work**.

------------------------------------------------------------------------

# ⏰ Working Hours & Overtime

WorkTrack automatically calculates worked hours.

For a normal shift:

`08:00 → 17:00`

For an overnight shift:

`20:00 → 08:00`

the application understands that the end time belongs to the following
day.

### Overtime

Overtime is calculated as:

`Worked Hours − Duty Hours`

If the result is negative, overtime is treated as zero.

The configured regular duty duration can be maintained through the
user's profile/settings.

------------------------------------------------------------------------

# 📅 Smart Roster

WorkTrack supports changing duty rosters.

A roster can contain schedules such as:

``` text
0800-1600
1600-0000
1800-0200
2000-0800
OFF
```

Overnight duties are handled correctly.

## 🔐 Private roster architecture

Roster visibility is based on the user's **Employee ID** and
authenticated account.

For example:

``` text
Employee ID 200396
        ↓
Mahesh's WorkTrack account
        ↓
Mahesh's private roster
```

A user cannot browse another employee's roster.

------------------------------------------------------------------------

# 👑 Admin Roster Management

Roster administration is restricted to the WorkTrack administrator.

The administrator can:

-   📤 Upload the latest roster
-   🔄 Update roster information
-   ✏️ Correct an individual employee/date
-   🗑️ Delete an incorrect entry
-   🔎 Search by Employee ID
-   🔎 Search by employee name
-   📅 Filter by month
-   🏷️ Filter by roster status

This keeps a large team roster manageable instead of displaying every
employee in one long list.

### Employee ID matching

Employee ID is the primary matching key.

This allows the administrator to upload a roster containing many
employees while WorkTrack associates each employee's duty schedule with
the correct WorkTrack account.

------------------------------------------------------------------------

# 🔔 Smart Duty Reminder

WorkTrack can identify the user's next scheduled duty.

Example:

> **Tomorrow's Duty**\
> 16:00 -- 00:00\
> Wake-up: 15:00

If the next day is a **Day Off**, the application does not treat it as a
normal duty reminder.

Wake-up timing can be configured according to the user's preference.

> **Important:** Browser and mobile operating-system notification
> restrictions can affect notification delivery when the web application
> is completely closed. WorkTrack uses the notification capabilities
> available to the device and browser.

------------------------------------------------------------------------

# 📊 Analytics

WorkTrack provides visual information about attendance and working
patterns, including:

-   Worked hours by day
-   Overtime by day
-   Attendance/status distribution
-   Monthly totals

This makes it easier to understand working patterns without manually
calculating every day.

------------------------------------------------------------------------

# 📄 Reports & Export

WorkTrack supports exporting attendance information for personal
records.

Roster data can also be exported for download, including:

-   📄 PDF
-   📊 Excel

Exports are designed around the user's accessible roster data rather
than exposing another employee's private roster.

------------------------------------------------------------------------

# 👤 User Profile

Users can maintain their WorkTrack profile information, including:

-   First name
-   Surname
-   Company
-   Employee ID
-   Position
-   Email account

Employee ID is especially important because it connects a user's account
with their private roster.

------------------------------------------------------------------------

# 🔐 Security & Privacy

WorkTrack is designed with privacy in mind.

### Authentication

User authentication is handled by **Supabase Authentication**.

### Row Level Security

Supabase **Row Level Security (RLS)** is used to restrict database
access so authenticated users can access only records belonging to their
account.

Roster administration is additionally restricted to the administrator.

### Important security practices

-   Never expose a Supabase secret/service-role key in frontend code.
-   Use the Supabase publishable key in the browser.
-   Keep authentication credentials private.
-   Sign out when using a shared device.
-   Use HTTPS in production.

------------------------------------------------------------------------

# 🏗️ Technology

WorkTrack is built using a lightweight web architecture:

  Technology     Purpose
  -------------- ----------------------------------
  HTML           Application structure
  CSS            Responsive glass-style interface
  JavaScript     Application logic
  Supabase       Authentication and database
  PostgreSQL     Persistent application data
  Supabase RLS   Database-level privacy
  Vercel         Production deployment
  GitHub         Source-code repository

The application is designed to work well on both **mobile and desktop
screens**.

------------------------------------------------------------------------

# 📁 Project Structure

``` text
WorkTrack/
├── index.html
├── app.js
├── style.css
├── README.md
└── supabase/
    ├── v10_migration.sql
    └── v18_roster_migration.sql
```

------------------------------------------------------------------------

# 🚀 Deployment

WorkTrack can be deployed using GitHub and Vercel.

### Basic deployment flow

``` text
Edit WorkTrack
      ↓
GitHub repository
      ↓
Vercel deployment
      ↓
Live WorkTrack application
      ↓
Supabase backend
```

When the repository's production branch is updated, Vercel can
automatically create a new deployment.

------------------------------------------------------------------------

# 🗄️ Database

The application uses Supabase PostgreSQL.

Core data includes:

### Profiles

Stores user-related application profile information such as duty-hour
configuration and profile identity.

### Attendance

Stores daily attendance records, including:

-   User
-   Work date
-   Check-in
-   Check-out
-   Status
-   Notes
-   Overtime reason

### Roster

Stores private scheduled duty information associated with an employee
and WorkTrack account.

------------------------------------------------------------------------

# 🧪 Testing Philosophy

WorkTrack should be tested with a small number of known users before
expanding to a larger group.

The recommended first test account is:

``` text
Employee ID: 200396
```

After the administrator confirms that roster matching, privacy, editing,
reminders, and exports work correctly, additional users can be added.

------------------------------------------------------------------------

# 🛣️ Future Improvements

Possible future enhancements include:

-   📱 Improved Android/PWA alarm integration
-   🔔 More reliable background notifications
-   📆 Calendar synchronization
-   📥 Automatic roster version comparison
-   📝 Roster change history
-   📊 Payroll calculation improvements
-   📈 Advanced monthly analytics
-   👥 Expanded team administration
-   📤 Additional report formats
-   🌐 Multi-language support

------------------------------------------------------------------------

# 👨‍💻 Creator

## Mahi --- Creator of WorkTrack

**Operations Officer and creator of WorkTrack**, built to make
attendance, working hours, duty rosters, and overtime tracking simple
and organized.

------------------------------------------------------------------------

# 📬 Contact

**Email:** myprogrammwork1@gmail.com\
**Phone:** +971 50 763 5453\
**GitHub:** mahi-cyberaware

------------------------------------------------------------------------

# 📜 License

This project is intended for personal/team use.

If you distribute or modify the project, ensure that you protect user
credentials, employee information, roster data, and other private
information.

------------------------------------------------------------------------

## ❤️ WorkTrack

**Track your attendance.\
Understand your hours.\
Know your next duty.\
Stay organized.**

> **WorkTrack --- Attendance • Hours • Overtime**
