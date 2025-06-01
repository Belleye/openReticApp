# Product Context

## Problem Statement
- Manual irrigation control is inefficient and error-prone; an automated solution is needed to integrate with an ESP32-based reticulation controller.
- Users face challenges in scheduling, monitoring, and managing irrigation zones effectively.

## Target Users
- Homeowners and gardeners: Need efficient irrigation control with remote management.
- Irrigation professionals: Require a reliable, offline-capable tool for managing irrigation systems.

## User Experience Goals
- Intuitive and responsive interface irrespective of network connectivity.
- Seamless offline-first experience with local network access to the ESP32.
- Easy scheduling and manual control for both real-time adjustments and planned operations.

## Key Features Derived from PRD & Tasks
- Zone Dashboard with real-time status for 8 zones (1 master + 7 irrigation zones).
- Manual control functionality with start/stop actions and duration modal.
- Snooze functionality with customizable duration and countdown timer.
- PWA installation and offline capabilities through service worker caching.
- Communication with ESP32 via HTTP endpoints with fallback modes.

---

**Last Updated:** 2025-06-01
