# Implementation Plan: Refresh Button for Schedule/Zone State

## Objective
Enable users to manually refresh the current schedule and zone state from the ESP32, ensuring the UI always reflects the latest data and connection status.

## Requirements (from PRD & memory-bank)
- Place a refresh button in the top-right of the dashboard.
- On click, attempt to fetch the latest schedule from ESP32 via `/getSchedule`.
- On success: update the UI and show a toast confirming the refresh.
- On failure: switch to demo mode, show a toast indicating fallback.
- Must handle connectivity gracefully (timeouts, errors).
- Button and logic must be mobile-friendly and visually consistent.

## Implementation Steps

1. **UI Integration**
   - Add a refresh icon/button to the dashboard’s top-right controls.
   - Ensure it is accessible and styled per Tailwind/shadcn/ui patterns.

2. **API Logic**
   - Implement a function to call the `/getSchedule` endpoint using the configured ESP32 address.
   - Add error/timeout handling (fallback to demo mode on failure).

3. **State Management**
   - On successful fetch, update the schedule and zone state in global/context state.
   - On failure, trigger fallback logic and display demo data.

4. **Feedback/UX**
   - Show a toast notification for both success and failure.
   - Provide loading/disabled state for the button during fetch.

5. **Testing**
   - Add tests for fetch logic, error handling, and UI feedback.
   - Test on both desktop and mobile layouts.

## Acceptance Criteria
- Refresh button is visible and works as described.
- UI updates correctly on both success and failure.
- User receives clear feedback for all outcomes.
- No regression to existing manual/snooze controls or offline mode.

---
**Added:** 2025-04-29
