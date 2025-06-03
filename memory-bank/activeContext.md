# Active Context (2025-06-03)

## Current Focus
- **UI Updates & Integration**: Ensure `ScheduleViewer` uses updated zone colors from settings and verify consistent color/name usage across all components.
- **Testing & Polish**: Add tests for settings functionality (UI and logic), thoroughly test API interactions for settings changes, and test `localStorage` persistence for ESP32 endpoint.

## Recent Changes
- **Implemented Settings Page**:
  - Users can customize zone names and colors; changes are persisted to the ESP32 via `saveFullSchedule`.
  - Users can configure the ESP32 IP address/hostname; this setting is persisted in `localStorage`.
  - `apiService` now dynamically uses the configured ESP32 endpoint from `localStorage`.
  - Connection test functionality for the configured ESP32 endpoint.
- Added support for zone colors in the API (stored in `system.zones[].color`)
- Refactored Dashboard UI: removed debug/readout, titles, and descriptions for clarity
- Manual zone control: blue Start button, blue countdown/cancel button when active
- Per-zone timer logic for auto-reset of manual runs
- Snooze control: modal for duration, live countdown/cancel button
- NavBar: fully responsive for mobile and desktop
- Refresh button added: fetches `/getSchedule`, updates context state, shows spinner/messages for success/failure
- NavBar title updated: displays "(Disconnected - Demo Mode)" suffix when `connectionState` is 'demo'
- Implemented `ScheduleViewer` page using FullCalendar
- Added `AddScheduleModal` for creating new schedule entries
- Implemented event generation logic for FullCalendar based on schedule data
- Added `EditScheduleModal` for modifying/deleting existing schedule entries
- Implemented event click handling on the calendar to open the edit modal
- Completed local state management for Add, Modify, and Delete operations for schedules
- **Completed full schedule API integration:**
  - `fetchSchedule` correctly reads from `/getSchedule`, converting UTC times to local and durations from seconds to minutes
  - `saveFullSchedule` correctly writes the entire `{ schedule, system }` object to `/postSchedule`, converting local times to UTC and durations from minutes to seconds
  - Add, Modify, and Delete operations in `ScheduleViewer` now successfully persist changes via the API using optimistic updates with rollback on error
  - Resolved issues with duration calculations in `EditScheduleModal` and `apiService`

## Next Steps
1.  **UI Updates & Integration (Post-Settings Implementation)**
    *   Ensure `ScheduleViewer` uses updated zone colors for events.
    *   Verify consistent color and name usage across all components.
2.  **Testing & Polish**
    *   Add tests for settings functionality (UI and logic).
    *   Thoroughly test API interactions for settings changes.
    *   Test `localStorage` persistence for ESP32 endpoint.
    *   *Consider replacing inline refresh messages with a toast/notification system.*

## Active Decisions
- Use timer-driven state updates for all time-based controls
- UI surfaces only essential controls and feedback for clarity
- Responsive design is mandatory for all navigation and control elements
- Removing extra UI elements helps users focus on core controls
- Use optimistic UI updates with error rollback for schedule modifications (`ScheduleViewer`) and dashboard controls (manual zone start/stop, system snooze).
- Context state (`connectionState`) effectively drives UI indicators (e.g., NavBar title suffix)
- Zone colors will be stored in the existing `system.zones` array to maintain a single source of truth
- Default colors will be provided for new zones but will be user-configurable
- ESP32 endpoint configuration will be stored in `localStorage` for client-side persistence.

## Learnings
- Settings page implementation allows for greater user customization and system flexibility.
- Storing user-configurable ESP32 endpoint in `localStorage` is a robust approach for client-side persistence and allows dynamic API interaction.
- Persisting zone names and colors to the ESP32 ensures consistency across potential future clients or direct ESP32 interactions.
- Timer-based state management (for snooze and manual runs) keeps UI and state in sync
- Consistent button design and embedded timers improve clarity and usability
- Responsive design is critical for mobile usability; Tailwind's responsive utilities are effective for rapid fixes
- Removing extra UI elements helps users focus on core controls
- Context state (`connectionState`) effectively drives UI indicators (e.g., NavBar title suffix)
- FullCalendar provides a robust way to visualize schedule events
- Passing original array indices via `extendedProps` in FullCalendar events simplifies linking calendar clicks back to source data for editing/deleting
- Separating Add and Edit modals simplifies component logic, even with similar forms
- Correct time (UTC/Local) and duration (Sec/Min) conversions between PWA state and API are crucial and now implemented in `apiService`
- Debugging confirmed `saveFullSchedule` requires the full `{ schedule, system }` payload for all state changes, including manual zone operations and system snooze.
- Zone colors in the API should be stored as hex codes (e.g., "#3B82F6") for maximum compatibility with web standards
- The ESP32 API successfully persists custom zone colors in the system.zones array.

---
This update reflects the current active context for the openRetic PWA as of June 3, 2025.
