import React, { useMemo, useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { EventInput, EventClickArg } from '@fullcalendar/core';
import { Button } from "@/components/ui/button";
import AddScheduleModal from "@/components/AddScheduleModal";
import EditScheduleModal from "@/components/EditScheduleModal";
import { ScheduleEntry } from '@/context/AppStateContext';
import {
  addDays, startOfDay, getDay, getDate, isSameDay,
  parseISO, setHours, setMinutes, setSeconds, addSeconds, formatISO,
  isWithinInterval
} from 'date-fns';

// Map weekday names to date-fns getDay() result (Sun=0, Mon=1, ...)
const weekdayMap: { [key: string]: number } = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

const ScheduleViewer = () => {
  const { scheduleData, setScheduleData } = useAppState();
  const { schedule, system } = scheduleData;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingScheduleIndex, setEditingScheduleIndex] = useState<number | null>(null);

  // Function to handle adding a new schedule entry
  const handleAddSchedule = (newEntry: Omit<ScheduleEntry, 'id' | 'zoneId'> & { zone: number }) => {
    // In a real app, you'd likely want a proper ID generation scheme
    // For now, just add to the existing list
    const updatedSchedule = [...scheduleData.schedule, newEntry];
    setScheduleData({ ...scheduleData, schedule: updatedSchedule });
    setIsModalOpen(false); // Close modal after adding
  };

  // Function to handle updating an existing schedule entry
  const handleUpdateSchedule = (updatedEntry: ScheduleEntry) => {
    if (editingScheduleIndex === null) return; // Safety check

    const updatedSchedule = [...scheduleData.schedule];
    // Assuming the updatedEntry might not have a backend ID yet, 
    // we rely on the index for now. If entries had unique IDs, we'd use that.
    updatedSchedule[editingScheduleIndex] = updatedEntry;

    setScheduleData({ ...scheduleData, schedule: updatedSchedule });
    setIsEditModalOpen(false); // Close modal after update
    setEditingScheduleIndex(null);
  };

  // Function to handle deleting a schedule entry
  const handleDeleteSchedule = () => {
    if (editingScheduleIndex === null) return; // Safety check

    const updatedSchedule = scheduleData.schedule.filter((_, index) => index !== editingScheduleIndex);

    setScheduleData({ ...scheduleData, schedule: updatedSchedule });
    setIsEditModalOpen(false); // Close modal after delete
    setEditingScheduleIndex(null);
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

    const getZoneName = (zoneId: number): string => {
      const zone = system.zones.find(z => z.id === zoneId);
      return zone ? zone.name : `Zone ${zoneId}`;
    };

    schedule.forEach((entry, index) => {
      for (let i = 0; i < 7; i++) {
        const currentDay = addDays(today, i);
        const dayOfWeek = getDay(currentDay);
        const dayOfMonth = getDate(currentDay);

        let shouldRun = false;

        if (entry.type === "weekday" && entry.days?.includes(Object.keys(weekdayMap).find(key => weekdayMap[key] === dayOfWeek) || '')) {
          shouldRun = true;
        } else if (entry.type === "daytype") {
          if (entry.pattern === "odd" && dayOfMonth % 2 !== 0) shouldRun = true;
          if (entry.pattern === "even" && dayOfMonth % 2 === 0) shouldRun = true;
        } else if (entry.type === "once" && entry.date) {
          try {
            const onceDate = startOfDay(parseISO(entry.date));
            if (isSameDay(currentDay, onceDate)) {
              shouldRun = true;
            }
          } catch (e) {
            console.error("Error parsing 'once' date:", entry.date, e);
          }
        }

        if (shouldRun) {
          try {
            const [hour, minute] = entry.start.split(':').map(Number);
            let startDateTime = setSeconds(setMinutes(setHours(currentDay, hour), minute), 0);
            let endDateTime = addSeconds(startDateTime, entry.duration);

            generatedEvents.push({
              title: getZoneName(entry.zone),
              start: formatISO(startDateTime),
              end: formatISO(endDateTime),
              extendedProps: {
                originalIndex: index
              }
            });
          } catch(e) {
            console.error("Error creating event date/time:", entry, currentDay, e);
          }
        }
      }
    });
    return generatedEvents;
  }, [schedule, system.zones]);

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Irrigation Schedule (Next 7 Days)</h1>
        <Button onClick={() => setIsModalOpen(true)}>Add Schedule</Button>
      </div>

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
          allDaySlot={false}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          height="auto"
          eventClick={handleEventClick}
        />
      </div>

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
