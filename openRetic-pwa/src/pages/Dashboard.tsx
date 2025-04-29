import React, { useState, useEffect } from "react";
import { useAppState } from "@/context/AppStateContext";
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
  const { scheduleData, setScheduleData } = useAppState();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [snoozeModalOpen, setSnoozeModalOpen] = useState(false);
  const snoozeUntil = scheduleData.system.snooze_until;
  const [snoozeCountdown, setSnoozeCountdown] = useState<string | null>(getSnoozeCountdown(snoozeUntil));
  const [manualCountdowns, setManualCountdowns] = useState<Record<number, string | null>>({});

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
  const handleManualStart = (durationMinutes: number) => {
    if (selectedZone == null) return;
    const now = new Date();
    const until = new Date(now.getTime() + durationMinutes * 60000).toISOString();
    setScheduleData({
      ...scheduleData,
      system: {
        ...scheduleData.system,
        zones: scheduleData.system.zones.map((z) =>
          z.id === selectedZone
            ? { ...z, active: true, manual_until: until }
            : z
        ),
      },
    });
  };

  // Stop manual mode for a zone
  const handleManualStop = (zoneId: number) => {
    setScheduleData({
      ...scheduleData,
      system: {
        ...scheduleData.system,
        zones: scheduleData.system.zones.map((z) =>
          z.id === zoneId
            ? { ...z, active: false, manual_until: null }
            : z
        ),
      },
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="font-semibold text-lg mb-4">Zones</h2>
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
