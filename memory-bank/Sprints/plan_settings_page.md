# Plan: Settings Page Implementation

## Objective
Update the Settings.tsx page in the openRetic PWA to allow users to customize application and system behavior.

## Key Features
1.  **Zone Configuration:**
    *   Allow users to edit the `name` for each zone.
    *   Allow users to select/edit the `color` (hex code) for each zone using a color picker.
    *   Changes to zone names and colors should be persisted by sending the updated `system.zones` array (as part of the full `ScheduleData` object) to the ESP32 via the `saveFullSchedule` API call.
    *   UI should reflect these changes across the application (e.g., Dashboard zone cards, ScheduleViewer event colors).
2.  **ESP32 Endpoint Configuration:**
    *   Allow users to set/update the IP address or hostname for the ESP32 controller.
    *   This setting should be stored in the browser's `localStorage` (e.g., under a key like `openretic_endpoint`).
    *   The `apiService.ts` and any other relevant network-calling functions (like the refresh handler in `Dashboard.tsx`) should dynamically use this stored endpoint.
    *   Provide a way to test the connection to the new endpoint.

## UI/UX Considerations
*   DONE: Create a new route and page component (e.g., `/settings`, `SettingsPage.tsx`).
*   Group settings logically (e.g., "Zone Settings", "Network Settings").
*   Use clear input fields for names and IP/hostname.
*   Implement a user-friendly color picker for zone colors.
*   Provide "Save" buttons for each section or a global save.
*   Ensure responsive design for the settings page.

## Technical Implementation Steps

### 1. Base Settings Page Setup
    - Create `SettingsPage.tsx` component.
    - Add a route for `/settings` in `App.tsx`.
    - Add a link to the Settings page in the `NavBar.tsx`.
    - Basic layout for the page.

### 2. ESP32 Endpoint Configuration
    - **UI Elements:**
        - Input field for ESP32 IP/hostname.
        - "Save Endpoint" button.
        - "Test Connection" button.
    - **Logic:**
        - On load, read current endpoint from `localStorage`.
        - On save, update `localStorage`.
        - `apiService.ts` and other network functions should be updated to read the endpoint from `localStorage` first, then fallback to a default if not set.
        - Test connection: attempt a simple GET request (e.g., to `/getSchedule` or a dedicated `/ping` endpoint if available) and display status.

### 3. Zone Configuration (Name & Color)
    - **UI Elements (per zone):**
        - Display current zone name and color.
        - Input field for zone name.
        - Color picker for zone color.
    - **UI Elements (global for zone settings):**
        - "Save Zone Settings" button.
    - **Logic:**
        - Fetch current `scheduleData.system.zones` from `AppStateContext`.
        - Allow editing of name and color for each zone.
        - On save:
            - Construct the `updatedScheduleData` with the modified `system.zones` array.
            - Call `saveFullSchedule(updatedScheduleData)`.
            - Handle API response (success/error, update `AppStateContext` via `setScheduleData` on success).
            - Consider optimistic updates with rollback.

### 4. State Management
    - Use local component state for form inputs.
    - Interact with `AppStateContext` (`scheduleData`, `setScheduleData`) for zone configurations.
    - Use `localStorage` for the ESP32 endpoint.

### 5. Styling and Responsiveness
    - Apply Tailwind CSS for styling.
    - Ensure the page is usable on various screen sizes.

## Future Considerations (Out of Scope for Initial Implementation)
-   Export/Import of settings.
-   Theme selection (light/dark mode toggle if not already app-wide).
-   Reset to default settings.
