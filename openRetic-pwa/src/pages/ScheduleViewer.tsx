import React, { useMemo, useState, useEffect } from "react";
import { useAppState, ScheduleData, ScheduleEntry } from "@/context/AppStateContext";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { EventInput, EventClickArg } from '@fullcalendar/core';
import { Button } from "@/components/ui/button";
import AddScheduleModal from "@/components/AddScheduleModal";
import EditScheduleModal from "@/components/EditScheduleModal";
import { 
  addDays, startOfDay, getDay, getDate, isSameDay,
  parseISO, setHours, setMinutes, setSeconds, addSeconds, formatISO,
  isWithinInterval
} from 'date-fns';
import {
  saveFullSchedule, 
  fetchSchedule
} from '@/services/apiService';

// Map weekday names to date-fns getDay() result (Sun=0, Mon=1, ...)
const weekdayMap: { [key: string]: number } = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

const ScheduleViewer: React.FC = () => {
  const { scheduleData, setScheduleData } = useAppState();
  const { schedule, system } = scheduleData;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingScheduleIndex, setEditingScheduleIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch schedules on component mount
  useEffect(() => {
    const loadSchedules = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const fetchedSchedules = await fetchSchedule();
        // Update only the schedule part of the state, keep the system part
        setScheduleData(prevData => ({ 
            ...prevData, // Keep existing system state
            schedule: fetchedSchedules 
        }));
      } catch (error: unknown) {
        console.error("Failed to fetch schedules:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        setFetchError(`Error fetching schedules: ${errorMessage}`);
        // Optionally clear existing schedules or show demo data?
        // For now, keep potentially stale data but show error
      } finally {
        setIsLoading(false);
      }
    };

    loadSchedules();
  }, [setScheduleData]); // Dependency on setScheduleData ensures stability

  // Function to handle adding a new schedule entry
  const handleAddSchedule = async (newEntryData: Omit<ScheduleEntry, 'id'>) => {
    // Assign a temporary or placeholder ID if needed for React keys, but backend won't use it
    // For state update, we just need the structure
    const entryWithPlaceholderId = { ...newEntryData, id: Date.now().toString() }; 
    const originalScheduleData = { ...scheduleData }; // Clone the full original state
    const newScheduleArray = [...originalScheduleData.schedule, entryWithPlaceholderId];
    const newState = { ...scheduleData, schedule: newScheduleArray }; // Construct the new state object

    // 1. Optimistic UI update with the new state object
    setScheduleData(newState);
    setIsModalOpen(false); 

    try {
        // 2. Call API to save the entire updated state object
        await saveFullSchedule(newState); 
        console.log('Full schedule saved successfully after adding entry.');
        // No need to replace temp ID, as fetch will get the real data on next load
    } catch (error: unknown) { 
        console.error('Failed to save full schedule after adding entry:', error);
        // Rollback optimistic update on error using the cloned original state
        setScheduleData(originalScheduleData);
        const errorMessage = error instanceof Error ? error.message : String(error);
        alert(`Error saving schedule: ${errorMessage}`); 
        // Decide if modal should reopen or stay closed
    }
  };

  // Function to handle updating an existing schedule entry
  const handleUpdateSchedule = async (updatedEntryData: Omit<ScheduleEntry, 'id'>) => {
    if (editingScheduleIndex === null) return; 

    const entryToUpdate = scheduleData.schedule[editingScheduleIndex];
    // Preserve the original ID from the state
    const updatedEntryWithId = { ...updatedEntryData, id: entryToUpdate.id }; 
    const originalScheduleData = { ...scheduleData }; // Clone the full original state
    const newScheduleArray = [...originalScheduleData.schedule];
    newScheduleArray[editingScheduleIndex] = updatedEntryWithId;
    const newState = { ...scheduleData, schedule: newScheduleArray }; // Construct the new state object
    
    // 1. Optimistic UI update with the new state object
    setScheduleData(newState);
    setIsEditModalOpen(false); 
    setEditingScheduleIndex(null);

    try {
        // 2. Call API to save the entire updated state object
        await saveFullSchedule(newState);
        console.log('Full schedule saved successfully after updating entry.');
    } catch (error: unknown) {
        console.error('Failed to save full schedule after updating entry:', error);
        // Rollback optimistic update using the cloned original state
        setScheduleData(originalScheduleData);
        const errorMessage = error instanceof Error ? error.message : String(error);
        alert(`Error saving schedule: ${errorMessage}`);
        // Keep modal closed after error for simplicity
    }
  };

  // Function to handle deleting a schedule entry
  const handleDeleteSchedule = async () => {
    if (editingScheduleIndex === null) return;

    const originalScheduleData = { ...scheduleData }; // Clone the full original state
    // Create the new schedule array by filtering
    const newScheduleArray = originalScheduleData.schedule.filter((_, index) => index !== editingScheduleIndex);
    const newState = { ...scheduleData, schedule: newScheduleArray }; // Construct the new state object

    // 1. Optimistic UI update with the new state object
    setScheduleData(newState);
    setIsEditModalOpen(false); 
    setEditingScheduleIndex(null);

    try {
        // 2. Call API to save the entire updated state object
        await saveFullSchedule(newState);
        console.log('Full schedule saved successfully after deleting entry.');
    } catch (error: unknown) {
        console.error('Failed to save full schedule after deleting entry:', error);
        // Rollback optimistic update using the cloned original state
        setScheduleData(originalScheduleData);
        const errorMessage = error instanceof Error ? error.message : String(error);
        alert(`Error saving schedule: ${errorMessage}`);
        // Keep modal closed
    }
  };

  // Function to handle clicking on an event
  const handleEventClick = (clickInfo: EventClickArg) => {
    const originalIndex = clickInfo.event.extendedProps.originalIndex;
    if (originalIndex !== undefined && originalIndex !== null) {
        console.log("Editing schedule index:", originalIndex);
        setEditingScheduleIndex(originalIndex as number);
        setIsEditModalOpen(true);
    } else {
        console.error("Clicked event missing originalIndex:", clickInfo.event);
    }
  };

  const events = useMemo(() => {
    const generatedEvents: EventInput[] = [];
    const today = startOfDay(new Date());
    const rangeEnd = addDays(today, 7);

    // Create a map from zone ID to color for quick lookup
    const zoneIdToColorMap = system.zones.reduce((acc, zone) => {
      if (zone.id && zone.color) {
        acc[zone.id] = zone.color;
      }
      return acc;
    }, {} as { [key: number]: string });

    const getZoneName = (zoneId: number): string => {
      const zone = system.zones.find(z => z.id === zoneId);
      return zone ? zone.name : `Zone ${zoneId}`;
    };

    schedule.forEach((entry, index) => {
      if (!entry.start) return; // Skip entries without start time

      // entry.duration is already in minutes from fetchSchedule
      const durationInMinutes = Math.round(entry.duration);
      const title = `${getZoneName(entry.zone)} (${durationInMinutes} min)`;
      const eventColor = zoneIdToColorMap[entry.zone] || '#3788d8'; // Default color if not found
      const [hours, minutes] = entry.start.split(':').map(Number);
      const eventId = `${entry.id || `temp-${index}`}`; // Use real ID if available, else temp

      if (entry.type === 'once' && entry.date) {
        try {
          const startDate = parseISO(`${entry.date}T${entry.start}:00`);
          const endDate = addSeconds(startDate, entry.duration * 60);
          generatedEvents.push({
            id: eventId,
            title: title,
            start: startDate, 
            end: endDate,
            extendedProps: { originalIndex: index, entryData: entry },
            backgroundColor: eventColor,
            borderColor: eventColor
          });
        } catch (e) {
          console.error("Error parsing date for 'once' event:", entry, e);
        }
      } else if (entry.type === 'weekday' && entry.days) {
        const daysOfWeek = entry.days.map(day => weekdayMap[day]).filter(dayNum => dayNum !== undefined);
        if (daysOfWeek.length > 0) {
          generatedEvents.push({
            id: eventId, // Event ID for referencing
            title: title,
            startTime: entry.start, // 'HH:mm' format
            duration: { minutes: durationInMinutes }, // Use minutes for FullCalendar
            daysOfWeek: daysOfWeek, // Array of day numbers [0-6]
            allDay: false,
            extendedProps: { originalIndex: index, entryData: entry }, // Store original index
            backgroundColor: eventColor,
            borderColor: eventColor
          });
        }
      } else if (entry.type === 'daytype' && entry.pattern) {
        let currentDate = today;
        while (isWithinInterval(currentDate, { start: today, end: rangeEnd })) {
          const dayOfMonth = getDate(currentDate);
          const matchesPattern = (entry.pattern === 'odd' && dayOfMonth % 2 !== 0) || 
                                 (entry.pattern === 'even' && dayOfMonth % 2 === 0);

          if (matchesPattern) {
            const startDateTime = setSeconds(setMinutes(setHours(currentDate, hours), minutes), 0);
            const endDateTime = addSeconds(startDateTime, durationInMinutes * 60);
            generatedEvents.push({
              id: `${eventId}-${formatISO(currentDate, { representation: 'date' })}`,
              title: title,
              start: startDateTime,
              end: endDateTime,
              extendedProps: { originalIndex: index, entryData: entry },
              backgroundColor: '#F59E0B', // Different color for daytype
              borderColor: '#F59E0B'
            });
          }
          currentDate = addDays(currentDate, 1);
        }
      }
    });

    console.log("Generated FullCalendar events:", generatedEvents);
    return generatedEvents;
  }, [schedule, system.zones]); // Recompute when schedule or zones change

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Irrigation Schedule</h1>
        <Button onClick={() => setIsModalOpen(true)}>Add Schedule</Button>
      </div>

      {/* Display Loading or Error State */}
      {isLoading && <p>Loading schedules...</p>}
      {fetchError && <p className="text-red-500">{fetchError}</p>}

      {/* Only render calendar if not loading and no critical fetch error */}
      {!isLoading && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: ''
            }}
            events={events}
            timeZone="local"
            allDaySlot={false}
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            height="auto"
            eventClick={handleEventClick}
            dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'short' }}
            firstDay={1}
          />
        </div>
      )}

      <AddScheduleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        zones={system.zones}
        onSubmit={handleAddSchedule} 
      />

      {isEditModalOpen && editingScheduleIndex !== null && (
         <EditScheduleModal
           isOpen={isEditModalOpen}
           onClose={() => {
               setIsEditModalOpen(false);
               setEditingScheduleIndex(null);
           }}
           zones={system.zones}
           scheduleEntry={scheduleData.schedule[editingScheduleIndex] || null} 
           onSubmit={handleUpdateSchedule} 
           onDelete={handleDeleteSchedule} 
         />
      )}
    </div>
  );
};

export default ScheduleViewer;
