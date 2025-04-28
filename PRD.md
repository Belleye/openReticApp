# Product Requirements Document: openRetic PWA

## Project Overview
openRetic is a Progressive Web App (PWA) that serves as a user interface for an ESP32-based reticulation controller managing 8 relays (1 master and 7 irrigation zones). The PWA provides scheduling, manual control, and monitoring of irrigation activities. It interacts with the ESP32 via HTTP endpoints accessible on the local network (`openRetic.local`), but is fully functional even when disconnected from hardware.

## Goals
- Provide a fully interactive irrigation control interface.
- Operate both with and without hardware connected.
- Offer a local network-based control system with offline-first design.
- Allow users to install the PWA from the web and use it natively on their devices (e.g., iOS, Android, Windows, etc.).
- Support offline mode.
- All PWA displayed times are in local time.
- All API calls are in UTC.
- Support DST handling.
- Support manual zone activation via ESP32.
- Support snoozing of manual zone activations to ESP32.
- Support saving of zone names to ESP32.
- Support saving of connection settings.
- Support saving of schedule to ESP32.
- Support loading of schedule from ESP32.

## Key Features

### 1. Zone Dashboard
- Real-time status for each zone and master relay.
- Manual start/stop controls for each zone.
- Visual indicators for currently active zones.

### 1.1 Manual Control
- Start/stop controls for each zone.
- Visual indicators for currently active zones.
- A modal dialog appears when a manual start is requested, allowing the user to specify the duration. default is 5 minutes.
- The JSON payload is updated with these changes and sent to the ESP32 via the `/postSchedule` endpoint.

### 1.2 Snooze
- A snooze button is available in the top-right corner of the dashboard.
- When clicked, a modal dialog appears, allowing the user to specify the duration (in hours). default is 12 hours.
- The JSON payload is updated with these changes and sent to the ESP32 via the `/postSchedule` endpoint.
- The Snooze button should change to a countdown timer that shows the remaining duration.
- If clicked again, the snooze should be cancelled and the button should return to its original state.
- the json payload should be updated with the new snooze duration and sent to the ESP32 via the `/postSchedule` endpoint.

### 1.3 Refresh Button
- A refresh button is available in the top-right corner of the dashboard.
- When clicked, the app should attempt to fetch the latest schedule from the ESP32 via the `/getSchedule` endpoint.
- If successful, the app should update the UI with the new schedule and display a toast message.
- If the ESP32 is unreachable, the app should fall back to demo mode and display a toast message.

### 2. Settings Page
- Configuration for ESP32 connection (IP address or hostname).
- Option to save connection settings to local storage.
- A button to test the connection to the ESP32.
- Display of current connection status.
- Ability to add colloquial names to zones that will display in the calendar/scheduling view.
- a button to save the colloquial names the ESP32. using the `/postSchedule` endpoint.

### 3. Schedule Viewer
- Calendar-based view of the irrigation schedule.
- Should display the current day and next 7 days.
- Displays schedules with clear zone segmentation and timing.
- Highlights overlapping schedules to alert users of potential conflicts.
- Uses colloquial zone names from JSON payload when available.

### 3.1 Schedule Add/Modify/Remove
- Form-based schedule builder.
- User can add, modify, or remove entries.
- Supports the following schedule types:
  - `weekday`: Recurring on specific days
  - `daytype`: Based on odd/even calendar days
  - `once`: One-time specific date run
- Client-side JSON builder with validation.
- All times to be converted to UTC. Allowing for DST handling.
- JSON payload is updated with these changes and sent to the ESP32 via the `/postSchedule` endpoint.

### 4. Connectivity Awareness
- Requests target the configured endpoint (IP address or hostname from Settings).
- Default target is `http://openRetic.local/` if no custom setting is provided.
- Displays toast notifications when connection fails.
- Implements timeout handling and retry logic for API requests.
- Loads and displays a sample schedule when the ESP32 is unreachable.
- Fully functional in offline mode to demonstrate capabilities without hardware.

### 5. Sync and Action Panel
- `GET /getSchedule` — retrieve latest schedule. All times are in UTC.
- `POST /postSchedule` — update schedule. All times are in UTC.
- PWA to handle conversion between UTC and local time, including DST.
- 
## Sample Schedule JSON
```json
{
  "schedule": [
    {
      "zone": 1,
      "type": "weekday",
      "days": ["Mon", "Wed", "Fri"],
      "start": "06:00",
      "duration": 900
    },
    {
      "zone": 2,
      "type": "daytype",
      "pattern": "odd",
      "start": "07:00",
      "duration": 600
    },
    {
      "zone": 3,
      "type": "once",
      "date": "2025-06-01",
      "start": "05:30",
      "duration": 300
    }
  ],
  "system": {
    "snooze_until": "2025-04-13T10:09:28Z",
    "last_updated": "2025-04-12T10:09:28Z",
    "zones": [
      {
        "id": 1,
        "name": "Front Lawn",
        "active": false,
        "manual_until": null
      },
      {
        "id": 2,
        "name": "Back Yard",
        "active": false,
        "manual_until": null
      },
      {
        "id": 3,
        "name": "Garden",
        "active": true,
        "manual_until": "2025-04-13T12:30:00Z"
      },
      {
        "id": 4,
        "name": "Side Yard",
        "active": false,
        "manual_until": null
      },
      {
        "id": 5,
        "name": "Flower Beds",
        "active": false,
        "manual_until": null
      },
      {
        "id": 6,
        "name": "Vegetable Garden",
        "active": false,
        "manual_until": null
      },
      {
        "id": 7,
        "name": "Patio Plants",
        "active": false,
        "manual_until": null
      }
    ]
  }
}
```

## Architecture
- **Frontend**: HTML5, CSS3, JavaScript with modern libraries
- **UI Framework**: Tailwind CSS and/or shadcn components
- **Hosted Location**: GitHub Pages
- **Endpoint Target**: Configurable via settings (IP address, hostname, or mDNS)
- The end point operates in UTC, while the PWA displays local time (e.g., based on user's timezone)
- **Offline Support**:
  - Full app install via PWA with comprehensive offline caching
  - Example schedule loaded if ESP32 is unavailable
  - User notified with toast messages for any connectivity issues
  - Fully functional demo mode without hardware
- **UI and Data Model Binding Standard**:
  - The application uses a single source of truth: an in-memory scheduleData JSON object that reflects the current schedule and system state.
  - All UI components (dashboard, schedule viewer, editor) are directly bound to this in-memory object.
  - Any changes to scheduleData (e.g., via syncing, editing, manual zone control) must trigger automatic UI updates via reactive binding.
  - No separate calls to “redraw” or “re-fetch” should be required after data changes.
  - The UI should observe changes to the scheduleData object, including nested keys (e.g., system.zones[x].active), and reflect them in real time.
- **Connection State Management and Demo Mode Behavior**
  - The app maintains a single, observable connection state with one of the following statuses:
    - connected: Successfully communicating with the configured ESP32 endpoint.
    - disconnected: Failed to communicate with the ESP32 after retry logic.
    - demo: Operating with local sample data because no hardware is available.
  - Connection status is checked:
    - On app startup.
    - On manual refresh.
    - After /postSchedule
    - After any failed API call.
  - UI Behavior:
    - The UI must always reflect the current connection state clearly (e.g., status banner, icon, or toast).
    - When connected: Display live schedule and relay states from the ESP32.
    - When disconnected or in demo mode: Automatically switch to the demo schedule dataset, with clear indication that this is simulated data.
  - Demo mode should never activate silently while connected.
  - Failover logic:
    - Only enter demo mode after a defined number of retries (e.g., 3 consecutive failures).
    - Connection retries use exponential backoff with a maximum retry interval (e.g., max every 60 seconds).
  - Reconnection logic:
    - On successful communication after demo mode has been activated, automatically return to connected mode.
    - UI elements refresh to reflect live data immediately upon reconnection.

## Constraints
- The PWA communicates only over the local network
- ESP32 must be accessible via IP address, hostname, or mDNS
- PWA must handle disconnections gracefully and fall back to demo mode
- Connection settings must be persisted in local storage
