import React, { createContext, useContext, useState, useMemo } from "react";

// Types for schedule and zones, matching PRD sample
export type Zone = {
  id: number;
  name: string;
  active: boolean;
  manual_until: string | null;
  color: string; // Added for zone-specific event colors
};

export type SystemState = {
  snooze_until: string | null;
  last_updated: string | null;
  zones: Zone[];
};

export type ScheduleEntry = {
  id?: number | string; // Add optional ID for backend integration
  zone: number;
  type: "weekday" | "daytype" | "once";
  days?: string[];
  pattern?: string;
  date?: string;
  start: string;
  duration: number;
};

export type ScheduleData = {
  schedule: ScheduleEntry[];
  system: SystemState;
};

export type ConnectionState = "connected" | "disconnected" | "demo";

interface AppState {
  scheduleData: ScheduleData;
  // Use React's Dispatch type for state setters
  setScheduleData: React.Dispatch<React.SetStateAction<ScheduleData>>;
  connectionState: ConnectionState;
  setConnectionState: (state: ConnectionState) => void;
}

// Sample schedule from PRD
const sampleSchedule: ScheduleData = {
  schedule: [
    {
      zone: 1,
      type: "weekday",
      days: ["Mon", "Wed", "Fri"],
      start: "06:00",
      duration: 900,
    },
    {
      zone: 2,
      type: "daytype",
      pattern: "odd",
      start: "07:00",
      duration: 600,
    },
    {
      zone: 3,
      type: "once",
      date: "2025-06-01",
      start: "05:30",
      duration: 300,
    },
  ],
  system: {
    snooze_until: "2025-04-13T10:09:28Z",
    last_updated: "2025-04-12T10:09:28Z",
    zones: [
      { id: 1, name: "Front Lawn", active: false, manual_until: null, color: "#3B82F6" }, // Default Blue
      { id: 2, name: "Back Yard", active: false, manual_until: null, color: "#10B981" }, // Default Green
      { id: 3, name: "Garden", active: true, manual_until: "2025-04-13T12:30:00Z", color: "#F59E0B" }, // Default Amber
      { id: 4, name: "Side Yard", active: false, manual_until: null, color: "#6366F1" }, // Default Indigo
      { id: 5, name: "Flower Beds", active: false, manual_until: null, color: "#EC4899" }, // Default Pink
      { id: 6, name: "Vegetable Garden", active: false, manual_until: null, color: "#8B5CF6" }, // Default Purple
      { id: 7, name: "Patio Plants", active: false, manual_until: null, color: "#D97706" }  // Default Orange
    ],
  },
};

const AppStateContext = createContext<AppState | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scheduleData, setScheduleData] = useState<ScheduleData>(sampleSchedule);
  const [connectionState, setConnectionState] = useState<ConnectionState>("demo");

  const value = useMemo(
    () => ({ scheduleData, setScheduleData, connectionState, setConnectionState }),
    [scheduleData, connectionState]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
