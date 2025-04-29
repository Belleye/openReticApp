import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Zone, ScheduleEntry } from '@/context/AppStateContext';

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  zones: Zone[];
  scheduleEntry: ScheduleEntry | null; // Entry being edited
  onSubmit: (updatedEntry: ScheduleEntry) => void; // Function to save changes
  onDelete: () => void; // Add onDelete prop
}

const EditScheduleModal: React.FC<EditScheduleModalProps> = ({ isOpen, onClose, zones, scheduleEntry, onSubmit, onDelete }) => {
  // Form State - Initialize with scheduleEntry data
  const [zone, setZone] = useState<string>(''); 
  const [type, setType] = useState<ScheduleEntry['type']>('weekday');
  const [days, setDays] = useState<string[]>([]);
  const [pattern, setPattern] = useState<'odd' | 'even' | ''>('');
  const [date, setDate] = useState<string>(''); 
  const [startTime, setStartTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(0); // In minutes for the form

  // Populate form when scheduleEntry or isOpen changes
  useEffect(() => {
    if (isOpen && scheduleEntry) {
        setZone(String(scheduleEntry.zone));
        setType(scheduleEntry.type);
        setDays(scheduleEntry.days || []);
        setPattern((scheduleEntry.pattern as 'odd' | 'even') || '');
        setDate(scheduleEntry.date || '');
        setStartTime(scheduleEntry.start);
        setDuration(scheduleEntry.duration / 60); // Convert seconds to minutes for display
    } else if (!isOpen) {
        // Optionally clear form on close, though reopening usually repopulates
    }
  }, [isOpen, scheduleEntry]);


  const handleDayChange = (day: string, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setDays([...days, day]);
    } else {
      setDays(days.filter(d => d !== day));
    }
  };

  const handleSave = () => {
    if (!scheduleEntry) return; // Should not happen if modal is open

    if (!zone) {
        alert('Please select a zone.'); 
        return;
    }

    // Construct the updated entry, preserving the original ID if it exists
    // In a real app, schedule entries might have unique IDs from the backend
    const updatedEntry: ScheduleEntry = {
        ...scheduleEntry, // Keep original properties like potential ID
        zone: parseInt(zone, 10),
        type,
        start: startTime || '00:00', 
        duration: (duration || 0) * 60, 
        // Clear out conditional props not relevant to the current type
        days: type === 'weekday' ? days : undefined,
        pattern: type === 'daytype' ? pattern : undefined,
        date: type === 'once' ? date : undefined,
    };

    // Remove undefined keys cleaner
    if (updatedEntry.days === undefined) delete updatedEntry.days;
    if (updatedEntry.pattern === undefined) delete updatedEntry.pattern;
    if (updatedEntry.date === undefined) delete updatedEntry.date;

    // Basic validation for conditional fields
    if (type === 'weekday' && (!updatedEntry.days || updatedEntry.days.length === 0)) {
        alert('Please select at least one day for weekday schedule.');
        return;
    }
    if (type === 'daytype' && !updatedEntry.pattern) {
        alert('Please select a pattern (Odd/Even) for daytype schedule.');
        return;
    }
    if (type === 'once' && !updatedEntry.date) {
        alert('Please select a date for once schedule.');
        return;
    }

    onSubmit(updatedEntry);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this schedule entry?')) {
        onDelete(); // Call the prop function passed from parent
    }
  };

  if (!isOpen || !scheduleEntry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Use same structure as AddScheduleModal, just change titles/defaults */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Schedule Entry</DialogTitle> {/* Changed Title */} 
          <DialogDescription>
            Modify the details for the irrigation schedule.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
           {/* Zone Selection */} 
           <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="edit-zone" className="text-right">Zone</Label>
             <Select value={zone} onValueChange={setZone}>
               <SelectTrigger id="edit-zone" className="col-span-3">
                 <SelectValue placeholder="Select a zone" />
               </SelectTrigger>
               <SelectContent>
                 {zones.map((z) => (
                   <SelectItem key={z.id} value={String(z.id)}>
                     {z.name} (ID: {z.id})
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
 
           {/* Type Selection */} 
           <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">Type</Label>
              <RadioGroup
                id="edit-type"
                value={type}
                onValueChange={(value) => setType(value as ScheduleEntry['type'])}
                className="col-span-3 flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekday" id="edit-r-weekday" />
                  <Label htmlFor="edit-r-weekday">Weekday</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daytype" id="edit-r-daytype" />
                  <Label htmlFor="edit-r-daytype">Day Type</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="once" id="edit-r-once" />
                  <Label htmlFor="edit-r-once">Once</Label>
                </div>
              </RadioGroup>
            </div>
 
           {/* Conditional Fields */} 
           {type === 'weekday' && (
             <div className="grid grid-cols-4 items-start gap-4">
               <Label className="text-right pt-2">Days</Label>
               <div className="col-span-3 grid grid-cols-4 gap-2">
                 {weekdays.map(day => (
                   <div key={day} className="flex items-center space-x-2">
                     <Checkbox
                        id={`edit-cb-${day}`}
                        checked={days.includes(day)}
                        onCheckedChange={(checked) => handleDayChange(day, checked)}
                      />
                     <Label htmlFor={`edit-cb-${day}`} className="text-sm font-normal">{day}</Label>
                   </div>
                 ))}
               </div>
             </div>
            )}
 
           {type === 'daytype' && (
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="edit-pattern" className="text-right">Pattern</Label>
               <RadioGroup
                 id="edit-pattern"
                 value={pattern}
                 onValueChange={(value) => setPattern(value as 'odd' | 'even')}
                 className="col-span-3 flex space-x-4"
                 >
                 <div className="flex items-center space-x-2">
                    <RadioGroupItem value="odd" id="edit-p-odd" />
                    <Label htmlFor="edit-p-odd">Odd Days</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="even" id="edit-p-even" />
                    <Label htmlFor="edit-p-even">Even Days</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
 
           {type === 'once' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-date" className="text-right">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="col-span-3"
                />
              </div>
            )}
 
           {/* Start Time */} 
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-start-time" className="text-right">Start Time</Label>
              <Input
                id="edit-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="col-span-3"
              />
            </div>
 
           {/* Duration */}  
           <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="edit-duration" className="text-right">Duration (min)</Label>
             <Input
               id="edit-duration"
               type="number"
               value={duration} 
               onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value, 10) || 1))}
               min="1"
               className="col-span-3"
             />
           </div>
 
         </div>
        <DialogFooter>
          {/* Delete Button added on the left */}
          <Button type="button" variant="destructive" onClick={handleDelete} className="mr-auto">Delete</Button> 
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleSave}>Save Changes</Button> {/* Changed Button Text */} 
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditScheduleModal;
