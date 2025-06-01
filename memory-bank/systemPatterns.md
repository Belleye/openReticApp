# System Patterns

## Architecture Overview
- Frontend built with Vite + React for optimal performance and ease of development.
- PWA architecture with service workers ensuring offline functionality.
- ESP32-based backend providing irrigation control via HTTP endpoints.
- Modular design with clear separation between UI components, data models, and service integration.

## Technical Patterns
- Reactive state management using React hooks and Context API.
- Timer-driven state logic for all time-based controls (manual runs, snooze), using setInterval and effect hooks.
- RESTful API communication with the ESP32 using JSON payloads. Key endpoint `/postSchedule` expects the full `ScheduleData` (system and schedule state) for any update.
- Offline-first design with caching and error handling for network issues.
- Responsive UI patterns using Tailwind's responsive utilities for navigation and controls.
- FullCalendar used for interactive schedule visualization.
- Separate, focused modal components for Add (`AddScheduleModal`) and Edit/Delete (`EditScheduleModal`) operations.
- Passing original data array index via `extendedProps` in FullCalendar events to link UI interactions back to the source data.

## Component Relationships
- Dashboard UI binds to the scheduleData object to reflect real-time status and control state.
- Per-zone manual controls and snooze controls are decoupled and timer-driven, updating UI and state independently.
- Service layer handles HTTP communications between the frontend and ESP32.
- NavBar is now fully responsive and adapts to mobile/desktop layouts.
- Scheduler component integrates with manual control and calendar/scheduler UI elements.
- `ScheduleViewer` component integrates FullCalendar, Add/Edit modals, and manages local schedule state updates.

## Implementation Paths
- Iterative development, starting with UI scaffolding followed by backend integration.
- Progressive enhancement to ensure functionality in both online and offline modes.

## Key Decisions
- Adoption of Vite + React for modern front-end development.
- Utilization of Tailwind CSS for styling.
- Building the application as a PWA for cross-platform availability.

---

**Last Updated:** 2025-06-01
