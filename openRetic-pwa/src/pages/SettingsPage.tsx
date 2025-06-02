import React, { useState, useEffect, ChangeEvent } from 'react';
import { useAppState } from '@/context/AppStateContext';
import { Zone } from '@/context/AppStateContext'; // Import Zone type
import { testApiConnection, saveFullSchedule } from '@/services/apiService';

const ENDPOINT_STORAGE_KEY = 'openretic_endpoint';

const SettingsPage: React.FC = () => {
  const [endpointInput, setEndpointInput] = useState<string>('');
  const [savedEndpoint, setSavedEndpoint] = useState<string>('');
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const { scheduleData, setScheduleData } = useAppState();
  const [editableZones, setEditableZones] = useState<Zone[]>([]);
  const [zoneSaveStatus, setZoneSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    const storedEndpoint = localStorage.getItem(ENDPOINT_STORAGE_KEY);
    const initialEndpoint = storedEndpoint || 'http://openRetic.local'; // Default if nothing stored
    setEndpointInput(initialEndpoint);
    setSavedEndpoint(initialEndpoint);

    // Initialize editableZones when scheduleData is available
    if (scheduleData && scheduleData.system && scheduleData.system.zones) {
      // Deep copy to prevent direct mutation of context state
      setEditableZones(JSON.parse(JSON.stringify(scheduleData.system.zones)));
    }
  }, [scheduleData]); // Add scheduleData as a dependency

  const handleEndpointChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndpointInput(event.target.value);
    setSaveStatus(null); // Clear save status on new input
  };

  const handleSaveEndpoint = () => {
    if (endpointInput.trim() === '') {
        setSaveStatus('Error: Endpoint cannot be empty.');
        return;
    }
    try {
        // Basic validation for http/https prefix
        if (!endpointInput.startsWith('http://') && !endpointInput.startsWith('https://')) {
            setSaveStatus('Error: Endpoint must start with http:// or https://');
            return;
        }
        new URL(endpointInput); // Validate if it's a parsable URL
        localStorage.setItem(ENDPOINT_STORAGE_KEY, endpointInput);
        setSavedEndpoint(endpointInput);
        setSaveStatus('Endpoint saved successfully!');
        setTestStatus(null); // Clear test status as endpoint changed
    } catch (error) {
        setSaveStatus('Error: Invalid URL format.');
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('Testing connection...');
    try {
      // Test with the *currently saved and applied* endpoint, not just input buffer
      const success = await testApiConnection(); 
      setTestStatus(success ? 'Connection successful!' : 'Connection failed.');
    } catch (error) {
      console.error('Test connection error:', error);
      setTestStatus(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleZoneInputChange = (index: number, field: keyof Zone, value: string) => {
    const updatedZones = [...editableZones];
    // Type assertion for safety, though 'active' and 'id' are not directly changed here
    (updatedZones[index] as any)[field] = value;
    setEditableZones(updatedZones);
    setZoneSaveStatus(null); // Clear status on new input
  };

  const handleSaveZoneSettings = async () => {
    setZoneSaveStatus('Saving zone settings...');
    try {
      // Validate zone names (e.g., not empty)
      for (const zone of editableZones) {
        if (!zone.name.trim()) {
          setZoneSaveStatus(`Error: Zone ${zone.id} name cannot be empty.`);
          return;
        }
      }

      const updatedScheduleData = {
        ...scheduleData,
        system: {
          ...scheduleData.system,
          zones: editableZones,
        },
      };
      await saveFullSchedule(updatedScheduleData);
      setScheduleData(updatedScheduleData); // Update global state
      setZoneSaveStatus('Zone settings saved successfully!');
    } catch (error) {
      console.error('Error saving zone settings:', error);
      setZoneSaveStatus(`Error saving zone settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } 
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      {/* ESP32 Endpoint Configuration Section */}
      <div className="mb-8 p-4 border rounded shadow-sm">
        <h2 className="text-xl font-semibold mb-3">ESP32 Endpoint Configuration</h2>
                <div className="mb-4">
          <label htmlFor="esp32Endpoint" className="block text-sm font-medium text-gray-700 mb-1">
            ESP32 IP Address / Hostname
          </label>
          <input
            type="text"
            id="esp32Endpoint"
            value={endpointInput}
            onChange={handleEndpointChange}
            placeholder="e.g., http://192.168.1.100 or http://openretic.local"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={handleSaveEndpoint}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Endpoint
          </button>
          <button
            onClick={handleTestConnection}
            disabled={!savedEndpoint || endpointInput !== savedEndpoint} // Disable if input not saved
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
          >
            Test Connection
          </button>
        </div>
        {saveStatus && (
          <p className={`text-sm mt-2 ${saveStatus.startsWith('Error:') ? 'text-red-600' : 'text-green-600'}`}>
            {saveStatus}
          </p>
        )}
        {testStatus && (
          <p className={`text-sm mt-2 ${testStatus.includes('failed') || testStatus.includes('Error:') ? 'text-red-600' : 'text-green-600'}`}>
            {testStatus}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Current active endpoint: {savedEndpoint || 'Not set'}
        </p>
      </div>

      {/* Zone Configuration Section */}
      <div className="p-4 border rounded shadow-sm">
        <h2 className="text-xl font-semibold mb-3">Zone Configuration</h2>
        {/* Content for zone configuration will go here */}
        {editableZones.length > 0 ? (
          <form onSubmit={(e) => e.preventDefault()}> {/* Prevent default form submission */}
            <div className="space-y-4">
              {editableZones.map((zone, index) => (
                <div key={zone.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 border rounded-md bg-gray-50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full" style={{ backgroundColor: zone.color }} title={`Current color: ${zone.color}`}></div>
                  <div className="flex-grow">
                    <label htmlFor={`zoneName-${zone.id}`} className="block text-sm font-medium text-gray-700">
                      Zone {zone.id} Name
                    </label>
                    <input
                      type="text"
                      id={`zoneName-${zone.id}`}
                      value={zone.name}
                      onChange={(e) => handleZoneInputChange(index, 'name', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <label htmlFor={`zoneColor-${zone.id}`} className="block text-sm font-medium text-gray-700">
                      Color
                    </label>
                    <input
                      type="color"
                      id={`zoneColor-${zone.id}`}
                      value={zone.color}
                      onChange={(e) => handleZoneInputChange(index, 'color', e.target.value)}
                      className="mt-1 block w-20 h-10 p-0 border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleSaveZoneSettings}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Zone Settings
            </button>
            {zoneSaveStatus && (
              <p className={`text-sm mt-2 ${zoneSaveStatus.startsWith('Error:') ? 'text-red-600' : 'text-green-600'}`}>
                {zoneSaveStatus}
              </p>
            )}
          </form>
        ) : (
          <p>Loading zone data or no zones configured.</p>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
