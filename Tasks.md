
# Tasks.md

## Project Setup
- [ ] **Initialize repository**  
  - Create GitHub repo (public/private as required)  
  - Scaffold a Vite + React project:
    ```bash
    npm init vite@latest openRetic -- --template react
    ```
- [ ] **Install dependencies**  
  - React, Vite  
  - Tailwind CSS  
  - shadcn/ui components  
  - **Calendar / Scheduler**  
    - `@fullcalendar/react` + plugins (MIT, well-documented)  
    - _Alternative_: `react-big-calendar` (MIT, Date-fns support)

- [ ] **PWA configuration**  
  - Create `manifest.json` (icons, name, display mode)  
  - Implement service worker for offline caching  
  - Define caching strategy (static assets, API fallback)

## 1. Data Model & Reactive Binding
- [ ] **Define** `scheduleData` object matching sample JSON schema  
- [ ] **Implement reactive binding** using React hooks or Context API  
  - Ensure all nested properties (e.g., `system.zones[x].active`) trigger re-renders
- [ ] **Single source of truth**
  - Ensure the app uses a single in-memory `scheduleData` object as the source of truth
  - All UI components must be bound reactively to this object
  - No manual redraws should be required after data changes; UI updates automatically

## 2. Zone Dashboard
- [ ] **Dashboard UI**  
  - Render cards for 8 zones + master relay  
  - Show real-time status (active/inactive) via reactive state  
- [ ] **Manual Control**  
  - Add Start/Stop buttons on each zone card  
  - On “Start”, open duration modal (default: 5 min)  
  - Update `scheduleData.system.zones[z].manual_until`  
  - Send updated JSON to `POST /postSchedule` endpoint  
- [ ] **Visual indicators**  
  - Highlight cards for active/manual zones automatically

## 3. Snooze Functionality
- [ ] **Snooze button** in dashboard header  
- [ ] **Duration modal** (default: 12 hours)  
- [ ] **Update** `scheduleData.system.snooze_until` + `POST /postSchedule`  
- [ ] **Countdown timer** replacing Snooze button  
  - Cancel on click → reset `snooze_until` + POST

## 4. Refresh & Demo Mode
- [ ] **Refresh button** in dashboard header  
  - On click: `GET /getSchedule` → update `scheduleData` → toast success  
  - On failure after 3 retries: switch to demo mode, load sample schedule → toast fallback  
- [ ] **Demo mode indicator**  
  - Display banner/icon when using sample data

## 5. Settings Page
- [ ] **Connection settings UI**  
  - Input for IP/hostname (default `http://openRetic.local/`)  
  - Persist to `localStorage`  
- [ ] **Test Connection** button  
  - Ping `/getSchedule`, display status (connected/disconnected)  
- [ ] **Zone naming**  
  - Inputs for colloquial zone names  
  - “Save Names” button → update `scheduleData.zones[].name` → POST

## 6. Schedule Viewer & Editor
- [ ] **Calendar view**  
  - Show today + next 7 days  
  - Render schedule entries by zone & time, highlight conflicts  
- [ ] **Form builder**  
  - Create/Edit/Remove entries (`weekday`, `daytype`, `once`)  
  - Validate inputs; convert local times → UTC with DST handling  
  - Update `scheduleData.schedule[]` → `POST /postSchedule`

## 7. Connectivity & State Management
- [ ] **API service layer**  
  - Centralize `GET`/`POST` calls with timeout & exponential backoff (max 60s)  
- [ ] **Connection state**  
  - Manage statuses: `connected`, `disconnected`, `demo`  
  - Trigger checks on start, refresh, after any API call  
- [ ] **Failover/Reconnection logic**  
  - Enter demo after 3 consecutive failures  
  - Auto-recover on first success post-failure

## 8. PWA & Offline Support
- [ ] **Cache assets & API responses** for offline use  
- [ ] **Demo schedule bundle** served when hardware unavailable  
- [ ] **Notify user** via toasts on connectivity changes

## 9. Time & DST Handling
- [ ] **Implement UTC↔Local conversion utilities**  
- [ ] **Unit tests** for edge cases (DST transitions, timezone offsets)

## 10. Testing & Quality (Manual)
- [ ] **Manual test: Zone Dashboard UI**  
  - Verify cards render correctly and status updates reflect live/demo data  
- [ ] **Manual test: Manual control flows**  
  - Confirm Start/Stop, duration modal behavior, correct JSON payload  
- [ ] **Manual test: Snooze functionality**  
  - Validate duration modal, countdown timer, cancel flow, correct POST updates  
- [ ] **Manual test: Refresh & Demo Mode**  
  - Simulate offline → demo mode activation, toast notifications, schedule reload  
- [ ] **Manual test: Settings page**  
  - Save/test connection, zone naming persisted and POSTed correctly  
- [ ] **Manual test: Schedule Viewer & Editor**  
  - Ensure calendar displays entries, supports CRUD, UTC conversions  
- [ ] **Manual test: PWA behavior**  
  - Installability, offline startup, service worker caching functionality  
- [ ] **Git commit**  
  - After passing all manual tests, run:
    ```bash
    git add .
    git commit -m "test: manual test pass"
    ```

## 11. Deployment
- [ ] **Configure GitHub Pages** (deploy `gh-pages` branch)  
- [ ] **CI pipeline**  
  - Build & lint on push  
  - Optional: auto-deploy on merge to `main`

---

*Notes:*  
- Chosen stack: React + Vite, Tailwind CSS, shadcn/ui  
- Scheduler: FullCalendar (`@fullcalendar/react`), with `react-big-calendar` as alternative  
- Manual testing detailed; commit step included
