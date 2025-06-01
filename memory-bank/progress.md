# Progress Update (2025-06-01)

## What Works
- Zone cards display correctly with real-time manual run status and controls.
- Manual start/stop is now consistent: blue Start button, blue countdown/cancel button when running.
- Each zone's manual run timer auto-resets and updates the UI when elapsed.
- Snooze control is implemented with a modal, live countdown, and cancel functionality. Snooze resets automatically when time elapses.
- NavBar is now fully responsive: stacks vertically on mobile, horizontal on desktop.
- UI is clean and focused: removed unnecessary debug, titles, and descriptions per user feedback.
- Refresh button implemented: fetches `/getSchedule`, handles success/failure with messages (blue/red), updates state.
- Connection status reflected in UI: NavBar title shows "(Disconnected - Demo Mode)" when disconnected.
- Schedule Viewer page implemented using FullCalendar.
- Calendar displays events generated based on schedule entries.
- Add Schedule modal allows creation of new schedule entries (updates local state).
- Edit Schedule modal allows modification/deletion of existing entries via calendar event click (updates local state).
- Full UI CRUD operations for schedule management (local state only) are complete.
- Full schedule API integration complete:
  - `fetchSchedule` correctly reads from `/getSchedule`, converting UTC times to local and durations from seconds to minutes.
  - `saveFullSchedule` correctly writes the entire `{ schedule, system }` object to `/postSchedule`, converting local times to UTC and durations from minutes to seconds.
  - Add, Modify, and Delete actions in `ScheduleViewer` persist changes via the API using optimistic updates with rollback.
  - Fixed duration display in calendar events to consistently show minutes throughout the UI while maintaining seconds in the API.

## What's Left / Next Steps
- Implement schedule viewer and editor per PRD.
- Integrate with backend/ESP32 API for real device control (currently demo mode only).
- Add tests for state logic and UI.
- *Consider replacing inline refresh messages with a toast/notification system.*

## Learnings
- Timer-based state management (for snooze and manual runs) is robust and keeps UI in sync.
- Consistent button design and embedded timers improve clarity and usability.
- Responsive design is critical for mobile usability; Tailwind's responsive utilities are effective for rapid fixes.
- Removing extra UI elements helps users focus on core controls.
- FullCalendar integration provides good schedule visualization.
- Correct time/duration conversions (`apiService`) are essential for API communication. The API expects durations in seconds while the UI displays them in minutes.
- API endpoint `/postSchedule` requires the full `{ schedule, system }` payload for saving.

## Issues
- No major blockers. All implemented features are working as intended in demo mode.
- Fixed: Calendar events now correctly display duration in minutes instead of seconds.

## Decisions
- Use context-based state for rapid prototyping and UI feedback.
- Favor simplicity and clarity in UI and controls.
- Use optimistic UI updates for schedule modifications.

---
This update reflects the current state of the openRetic PWA as of June 1, 2025.
