# Active Context (2025-04-29)

## Current Focus
- Integrating schedule management actions (Add, Modify, Delete) with the backend API service.
- Ensuring schedule state is correctly persisted and synchronized via API calls.

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

## Next Steps
- Integrate `handleAddSchedule`, `handleUpdateSchedule`, `handleDeleteSchedule` with backend API calls (`apiService.ts`).
- Define and implement necessary API service functions (`updateScheduleEntry`, `deleteScheduleEntry`) if they don't exist.
- Determine strategy for state updates after API calls (re-fetch vs. optimistic update).
- Add tests for UI, state logic, and API interactions.
- *Consider replacing inline refresh messages with a toast/notification system.*

## Active Decisions
- Use timer-driven state updates for all time-based controls.
- UI surfaces only essential controls and feedback for clarity.
- Responsive design is mandatory for all navigation and control elements.
- Removing extra UI elements helps users focus on core controls.
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

---
This update reflects the current active context for the openRetic PWA as of April 29, 2025.
