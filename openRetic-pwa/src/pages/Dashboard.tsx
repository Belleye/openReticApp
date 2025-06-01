import React, { useState, useEffect } from "react";
import { saveFullSchedule } from "@/services/apiService"; // Changed import from startManualZone to saveFullSchedule
import { useAppState, ScheduleData } from "@/context/AppStateContext"; // Added ScheduleData import
import ManualControlModal from "@/components/ManualControlModal";
import SnoozeModal from "@/components/SnoozeModal";

function getSnoozeCountdown(snoozeUntil: string | null): string | null {
  if (!snoozeUntil) return null;
  const until = new Date(snoozeUntil).getTime();
  const now = Date.now();
  const diffMs = until - now;
  if (diffMs <= 0) return null;
  const hours = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  const secs = Math.floor((diffMs % 60000) / 1000);
  return `${hours}h ${mins}m ${secs}s`;
}

function getManualCountdown(manualUntil: string | null): string | null {
  if (!manualUntil) return null;
  const until = new Date(manualUntil).getTime();
  const now = Date.now();
  const diffMs = until - now;
  if (diffMs <= 0) return null;
  const mins = Math.floor(diffMs / 60000);
  const secs = Math.floor((diffMs % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

const Dashboard = () => {
  const { scheduleData, setScheduleData, connectionState, setConnectionState } = useAppState();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [snoozeModalOpen, setSnoozeModalOpen] = useState(false);
  const snoozeUntil = scheduleData.system.snooze_until;
  const [snoozeCountdown, setSnoozeCountdown] = useState<string | null>(getSnoozeCountdown(snoozeUntil));
  const [manualCountdowns, setManualCountdowns] = useState<Record<number, string | null>>({});
  // Refresh button state
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);
  const [refreshMsgType, setRefreshMsgType] = useState<'success' | 'error' | null>(null);

  // Update snooze countdown every second
  useEffect(() => {
    if (!snoozeUntil) return;
    const interval = setInterval(() => {
      setSnoozeCountdown(getSnoozeCountdown(snoozeUntil));
    }, 1000);
    return () => clearInterval(interval);
  }, [snoozeUntil]);

  // Update manual countdowns every second
  useEffect(() => {
    const interval = setInterval(() => {
      const countdowns: Record<number, string | null> = {};
      scheduleData.system.zones.forEach((z) => {
        countdowns[z.id] = getManualCountdown(z.manual_until);
      });
      setManualCountdowns(countdowns);
    }, 1000);
    return () => clearInterval(interval);
  }, [scheduleData.system.zones]);

  // Auto-reset manual activation after manual_until
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let changed = false;
      const updatedZones = scheduleData.system.zones.map((z) => {
        if (z.manual_until && new Date(z.manual_until).getTime() <= now) {
          changed = true;
          return { ...z, active: false, manual_until: null };
        }
        return z;
      });
      if (changed) {
        setScheduleData({
          ...scheduleData,
          system: { ...scheduleData.system, zones: updatedZones },
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [scheduleData, setScheduleData]);

  // Helper to open modal for a zone
  const handleStartClick = (zoneId: number) => {
    setSelectedZone(zoneId);
    setModalOpen(true);
  };

  // Start manual mode for a zone
  const handleManualStart = async (durationMinutes: number) => { // Made async
    if (selectedZone == null) return;
    const originalZoneState = scheduleData.system.zones.find(z => z.id === selectedZone);

    const now = new Date();
    // manual_until should be a UTC ISO string, which toISOString() provides.
    const until = new Date(now.getTime() + durationMinutes * 60000).toISOString(); 

    // Create the new state object with the updated zone
    const updatedScheduleData: ScheduleData = {
      ...scheduleData,
      system: {
        ...scheduleData.system,
        zones: scheduleData.system.zones.map((z) =>
          z.id === selectedZone
            ? { ...z, active: true, manual_until: until }
            : z
        ),
      },
    };

    // Optimistic UI update
    setScheduleData(updatedScheduleData);

    try {
      // Send the entire updated schedule data to the backend
      await saveFullSchedule(updatedScheduleData);
      console.log(`[Dashboard] Manual start for zone ${selectedZone} successful. Full schedule saved.`);
    } catch (error) {
      console.error(`[Dashboard] Failed to start manual zone ${selectedZone} or save schedule:`, error);
      alert(`Error: Could not apply manual start for zone ${selectedZone}. Please check connection and try again.`);
      // Revert optimistic update if API call fails
      if (originalZoneState) {
        setScheduleData(prevData => ({
          ...prevData, // Use prevData to ensure we're reverting from the current state if multiple quick actions occurred
          system: {
            ...prevData.system,
            zones: prevData.system.zones.map((z) =>
              z.id === selectedZone ? originalZoneState : z
            ),
          },
        }));
      }
    }
  };

  // Stop manual mode for a zone
  const handleManualStop = async (zoneId: number) => {
    const originalZoneState = scheduleData.system.zones.find(z => z.id === zoneId);

    // Create the new state object with the updated zone (stopped)
    const updatedScheduleData: ScheduleData = {
      ...scheduleData,
      system: {
        ...scheduleData.system,
        zones: scheduleData.system.zones.map((z) =>
          z.id === zoneId
            ? { ...z, active: false, manual_until: null } // Set active to false and manual_until to null
            : z
        ),
      },
    };

    // Optimistic UI update
    setScheduleData(updatedScheduleData);

    try {
      // Send the entire updated schedule data to the backend
      await saveFullSchedule(updatedScheduleData);
      console.log(`[Dashboard] Manual stop for zone ${zoneId} successful. Full schedule saved.`);
    } catch (error) {
      console.error(`[Dashboard] Failed to stop manual zone ${zoneId} or save schedule:`, error);
      alert(`Error: Could not apply manual stop for zone ${zoneId}. Please check connection and try again.`);
      // Revert optimistic update if API call fails
      if (originalZoneState) {
        setScheduleData(prevData => ({
          ...prevData,
          system: {
            ...prevData.system,
            zones: prevData.system.zones.map((z) =>
              z.id === zoneId ? originalZoneState : z
            ),
          },
        }));
      }
    }
  };

  // --- Refresh logic ---
  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      const endpoint = localStorage.getItem("esp32_endpoint") || "http://openRetic.local/getSchedule";
      // Implement timeout with AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const resp = await fetch(endpoint, { method: "GET", signal: controller.signal });
      clearTimeout(timeoutId);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setScheduleData(data);
      setConnectionState("connected");
      setRefreshMsg("Schedule refreshed successfully.");
      setRefreshMsgType('success');
    } catch (e) {
      setConnectionState("demo");
      setRefreshMsg("ESP32 unreachable. Switched to demo mode.");
      setRefreshMsgType('error');
    } finally {
      setRefreshing(false);
      setTimeout(() => {
        setRefreshMsg(null);
        setRefreshMsgType(null);
      }, 3000);
    }
  };


  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-semibold text-lg mb-4">Zones</h2>
        <button
          className="ml-4 p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 flex items-center"
          title="Refresh schedule"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            // Simple spinner
            <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 01-8-8z" />
            </svg>
          ) : (
            // Refresh icon
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M19.418 9A7.977 7.977 0 0012 4c-4.418 0-8 3.582-8 8m16 0c0 4.418-3.582 8-8 8a7.977 7.977 0 01-7.418-5" />
            </svg>
          )}
        </button>
      </div>
      {refreshMsg && (
        <div
          className={`mb-4 text-sm text-center rounded p-2 ${
            refreshMsgType === 'error'
              ? 'text-red-700 bg-red-100'
              : 'text-blue-700 bg-blue-100'
          }`}
        >
          {refreshMsg}
          {/* TODO: Replace with toast/notification system */}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {scheduleData.system.zones.map((zone) => {
          const isActive = zone.active;
          const isManual = !!zone.manual_until;
          return (
            <div
              key={zone.id}
              className={`rounded-lg border p-4 shadow transition-all flex flex-col items-start gap-2 ${
                isActive ? "bg-green-100 border-green-400" : "bg-white border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{zone.name}</span>
                {isActive && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded bg-green-500 text-white">Active</span>
                )}
                {isManual && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded bg-blue-500 text-white">Manual</span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                Zone #{zone.id}
              </div>

              <div className="flex gap-2 mt-2">
                {!isActive ? (
                  <button
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    onClick={() => handleStartClick(zone.id)}
                  >
                    Start
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2"
                    onClick={() => handleManualStop(zone.id)}
                  >
                    {manualCountdowns[zone.id] ? (
                      <span>{manualCountdowns[zone.id]}</span>
                    ) : (
                      <span>Running</span>
                    )}
                    <span className="ml-2">(Cancel)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <ManualControlModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onStart={handleManualStart}
        zoneName={
          scheduleData.system.zones.find((z) => z.id === selectedZone)?.name || ""
        }
      />
      <SnoozeModal
        open={snoozeModalOpen}
        onClose={() => setSnoozeModalOpen(false)}
        onSnooze={(hours) => {
          const until = new Date(Date.now() + hours * 3600000).toISOString();
          setScheduleData({
            ...scheduleData,
            system: { ...scheduleData.system, snooze_until: until },
          });
        }}
      />
    </div>
  );
};

export default Dashboard;
