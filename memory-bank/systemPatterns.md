# System Patterns

## Architecture Overview
- Frontend built with Vite + React for optimal performance and ease of development.
- PWA architecture with service workers ensuring offline functionality.
- ESP32-based backend providing irrigation control via HTTP endpoints.
- Modular design with clear separation between UI components, data models, and service integration.

## Technical Patterns
- Reactive state management using React hooks and Context API.
- RESTful API communication with the ESP32 using JSON payloads.
- Offline-first design with caching and error handling for network issues.

## Component Relationships
- Dashboard UI binds to the scheduleData object to reflect real-time status and control state.
- Service layer handles HTTP communications between the frontend and ESP32.
- Scheduler component integrates with manual control and calendar/scheduler UI elements.

## Implementation Paths
- Iterative development, starting with UI scaffolding followed by backend integration.
- Progressive enhancement to ensure functionality in both online and offline modes.

## Key Decisions
- Adoption of Vite + React for modern front-end development.
- Utilization of Tailwind CSS for styling.
- Building the application as a PWA for cross-platform availability.

---

**Last Updated:** 2025-04-29
