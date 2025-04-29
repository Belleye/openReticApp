# Active Context (2025-04-29)

## Current Focus
- Investigating potential issue with Sunday events not rendering in ScheduleViewer.
- Adding tests for UI components, state logic, and API interactions.

## Recent Changes
- Refactored Dashboard UI: removed debug/readout, titles, and descriptions for clarity.
- Manual zone control: blue Start button, blue countdown/cancel button when active.
- Per-zone timer logic for auto-reset of manual runs.
- Snooze control: modal for duration, live countdown/cancel button.
- NavBar: fully responsive for mobile and desktop.
- Refresh button added: fetches `/getSchedule`, updates context state, shows spinner/messages for success/failure.
- NavBar title updated: displays "(Disconnected - Demo Mode)" suffix when `connectionState` is 'demo'.
- Implemented `ScheduleViewer` page using FullCalendar.
- Added `AddScheduleModal` for creating new schedule entries.
- Implemented event generation logic for FullCalendar based on schedule data.
- Added `EditScheduleModal` for modifying/deleting existing schedule entries.
- Implemented event click handling on the calendar to open the edit modal.
- Completed local state management for Add, Modify, and Delete operations for schedules.
- **Completed full schedule API integration:**
  - `fetchSchedule` correctly reads from `/getSchedule`, converting UTC times to local and durations from seconds to minutes.
  - `saveFullSchedule` correctly writes the entire `{ schedule, system }` object to `/postSchedule`, converting local times to UTC and durations from minutes to seconds.
  - Add, Modify, and Delete operations in `ScheduleViewer` now successfully persist changes via the API using optimistic updates with rollback on error.
  - Resolved issues with duration calculations in `EditScheduleModal` and `apiService`.

## Next Steps
- Investigate Sunday event rendering issue in `ScheduleViewer` / FullCalendar.
- Add tests for UI, state logic, and API interactions.
- *Consider replacing inline refresh messages with a toast/notification system.*

## Active Decisions
- Use timer-driven state updates for all time-based controls.
- UI surfaces only essential controls and feedback for clarity.
- Responsive design is mandatory for all navigation and control elements.
- Removing extra UI elements helps users focus on core controls.
- Use optimistic UI updates with error rollback for schedule modifications (`ScheduleViewer`).
- Context state (`connectionState`) effectively drives UI indicators (e.g., NavBar title suffix).

## Learnings
- Timer-based state management (for snooze and manual runs) keeps UI and state in sync.
- Consistent button design and embedded timers improve clarity and usability.
- Responsive design is critical for mobile usability; Tailwind's responsive utilities are effective for rapid fixes.
- Removing extra UI elements helps users focus on core controls.
- Context state (`connectionState`) effectively drives UI indicators (e.g., NavBar title suffix).
- FullCalendar provides a robust way to visualize schedule events.
- Passing original array indices via `extendedProps` in FullCalendar events simplifies linking calendar clicks back to source data for editing/deleting.
- Separating Add and Edit modals simplifies component logic, even with similar forms.
- Correct time (UTC/Local) and duration (Sec/Min) conversions between PWA state and API are crucial and now implemented in `apiService`.
- Debugging confirmed `saveFullSchedule` requires the full `{ schedule, system }` payload.

---
This update reflects the current active context for the openRetic PWA as of April 29, 2025.
