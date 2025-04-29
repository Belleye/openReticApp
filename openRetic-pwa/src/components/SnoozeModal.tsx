import React, { useState } from "react";

interface SnoozeModalProps {
  open: boolean;
  onClose: () => void;
  onSnooze: (durationHours: number) => void;
  defaultHours?: number;
}

const SnoozeModal: React.FC<SnoozeModalProps> = ({ open, onClose, onSnooze, defaultHours = 12 }) => {
  const [hours, setHours] = useState(defaultHours);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
        <h2 className="font-bold text-xl mb-2">Snooze System</h2>
        <label className="block mb-4">
          <span className="text-gray-700">Snooze Duration (hours):</span>
          <input
            type="number"
            min={1}
            max={48}
            className="block w-full mt-1 border rounded px-2 py-1"
            value={hours}
            onChange={e => setHours(Number(e.target.value))}
          />
        </label>
        <div className="flex gap-2 justify-end">
          <button
            className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            onClick={() => { onSnooze(hours); onClose(); }}
          >
            Snooze
          </button>
        </div>
      </div>
    </div>
  );
};

export default SnoozeModal;
