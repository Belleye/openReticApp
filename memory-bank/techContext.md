# Technical Context

## Technologies Used
- React 18.2 and Vite for building the frontend.
- Tailwind CSS and shadcn/ui for styling and UI components.
- Scheduler libraries: @fullcalendar/react or react-big-calendar for scheduling functionalities.
- Service workers for PWA offline support.
- ESP32 for irrigation control using HTTP endpoints.
- **Confirmed**: `@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid` used for ScheduleViewer page.

## Development Setup
- Repository scaffolded using Vite with a React template.
- Node.js and npm for dependency management and script execution.
- Local development environment configured for PWA testing and offline mode verification.

## Technical Constraints
- Reliable handling of offline scenarios.
- Time synchronization between client local time and UTC for API interactions.
- Responsive design requirements for various device sizes.
- **Potential Challenge**: Integrating FullCalendar's default styling seamlessly with custom themes (e.g., dark mode) or UI libraries (Tailwind/shadcn) may require specific CSS overrides or configuration.

## Dependencies
- React 18.2
- Vite (latest stable version)
- Tailwind CSS
- shadcn/ui components
- Scheduler library: @fullcalendar/react or react-big-calendar.
- **Confirmed**: `@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`.

## Tool Usage Patterns
- Code is divided into modular, reusable components.
- Global state managed using React Context API.
- Service worker leveraged for caching and offline access.

--- 

**Last Updated:** 2025-04-29
