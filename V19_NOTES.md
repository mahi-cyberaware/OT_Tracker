# WorkTrack V19 — Mobile PWA + Smart Duty Reminder

V19 is based on the working V18 roster-management build.

## New in V19
- Progressive Web App manifest
- Installable WorkTrack app on supported Android browsers
- WorkTrack home-screen icon
- Standalone app-style display
- Service worker for app-shell caching and faster repeat loading
- Install WorkTrack button when the browser provides the install prompt
- Existing smart duty reminder remains tied to the private roster
- Existing Employee ID privacy and Admin roster controls remain unchanged

## Important notification limitation
A PWA/browser cannot guarantee a true Android alarm at an exact future time after the browser/OS has stopped the web app. V19 improves installability and notification support, but exact background wake-up alarms require platform support beyond a normal web page.

## Database
No new database migration is required for the PWA changes.

V19.1: Added prominent tomorrow-duty alert dialog and Test duty alert button. No database migration required.
