import React, { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import ManualControlModal from "@/components/ManualControlModal";

const Dashboard = () => {
  const { scheduleData, setScheduleData } = useAppState();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);

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
      <h1 className="text-2xl font-bold mb-4">Zone Dashboard</h1>
      <p className="mb-8">This will display real-time zone status, manual controls, snooze, and refresh features.</p>

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
                {isManual && zone.manual_until && (
                  <div className="text-xs text-blue-700 mt-1">
                    Manual until: {new Date(zone.manual_until).toLocaleString()}
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  {!isActive ? (
                    <button
                      className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                      onClick={() => handleStartClick(zone.id)}
                    >
                      Start
                    </button>
                  ) : (
                    <button
                      className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
                      onClick={() => handleManualStop(zone.id)}
                    >
                      Stop
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
    </div>
  );
};

export default Dashboard;
