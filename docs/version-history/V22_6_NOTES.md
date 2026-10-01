# WorkTrack V22.6 — My Roster Load Fix

- Fixes the initial Next Duty card showing “No roster loaded” while the roster table is already populated.
- My Roster refreshes from the current user roster when the section is opened, without blocking menu animation.
- Next Duty is painted immediately from the freshly loaded roster and then refreshed from Supabase.
- Wake-up lead defaults to 2 hours (120 minutes) and remains user-changeable.
- No database migration required.
