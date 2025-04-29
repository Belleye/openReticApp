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
import { Zone, ScheduleEntry } from '@/context/AppStateContext'; // Import types

// Define weekdays for checkboxes
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  zones: Zone[];
  onSubmit: (newEntry: Omit<ScheduleEntry, 'id'>) => void;
}

const AddScheduleModal: React.FC<AddScheduleModalProps> = ({ isOpen, onClose, zones, onSubmit }) => {
  // Form State
  const [zone, setZone] = useState<string>(''); // Store zone ID as string for Select
  const [type, setType] = useState<ScheduleEntry['type']>('weekday');
  const [days, setDays] = useState<string[]>([]);
  const [pattern, setPattern] = useState<'odd' | 'even' | ''>('');
  const [date, setDate] = useState<string>(''); // YYYY-MM-DD
  const [startTime, setStartTime] = useState<string>(''); // HH:MM
  const [duration, setDuration] = useState<number>(15); // Default duration in minutes

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
        // Reset to defaults when opened
        setZone(zones.length > 0 ? String(zones[0].id) : '');
        setType('weekday');
        setDays([]);
        setPattern('');
        setDate('');
        setStartTime('06:00');
        setDuration(15);
    }
  }, [isOpen, zones]);


  const handleDayChange = (day: string, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setDays([...days, day]);
    } else {
      setDays(days.filter(d => d !== day));
    }
  };

  const handleSave = () => {
    // Basic validation (ensure zone is selected)
    if (!zone) {
        alert('Please select a zone.'); // Simple validation feedback
        return;
    }

    const newEntry: Omit<ScheduleEntry, 'id'> = {
        zone: parseInt(zone, 10),
        type,
        start: startTime || '00:00', // Provide default if empty
        duration: (duration || 0) * 60, // Convert minutes to seconds, handle potential NaN
    };

    // Add conditional properties
    if (type === 'weekday') {
        if (days.length === 0) {
            alert('Please select at least one day for weekday schedule.');
            return;
        }
        newEntry.days = days;
    } else if (type === 'daytype') {
        if (!pattern) {
            alert('Please select a pattern (Odd/Even) for daytype schedule.');
            return;
        }
        newEntry.pattern = pattern;
    } else if (type === 'once') {
        if (!date) {
            alert('Please select a date for once schedule.');
            return;
        }
        newEntry.date = date;
    }

    // Call the onSubmit prop passed from the parent
    onSubmit(newEntry);

    // No need to call onClose here, parent component handles it after state update
    // onClose(); 
  };


  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md"> {/* Adjusted width */}
        <DialogHeader>
          <DialogTitle>Add New Schedule Entry</DialogTitle>
          <DialogDescription>
            Configure the details for the new irrigation schedule.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Zone Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="zone" className="text-right">Zone</Label>
            <Select value={zone} onValueChange={setZone}>
              <SelectTrigger className="col-span-3">
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
             <Label htmlFor="type" className="text-right">Type</Label>
             <RadioGroup
               value={type}
               onValueChange={(value) => setType(value as ScheduleEntry['type'])}
               className="col-span-3 flex space-x-4"
             >
               <div className="flex items-center space-x-2">
                 <RadioGroupItem value="weekday" id="r-weekday" />
                 <Label htmlFor="r-weekday">Weekday</Label>
               </div>
               <div className="flex items-center space-x-2">
                 <RadioGroupItem value="daytype" id="r-daytype" />
                 <Label htmlFor="r-daytype">Day Type</Label>
               </div>
               <div className="flex items-center space-x-2">
                 <RadioGroupItem value="once" id="r-once" />
                 <Label htmlFor="r-once">Once</Label>
               </div>
             </RadioGroup>
           </div>

          {/* Conditional Fields */}
          {type === 'weekday' && (
            <div className="grid grid-cols-4 items-start gap-4"> {/* items-start for alignment */}
              <Label className="text-right pt-2">Days</Label> {/* Adjust padding */}
              <div className="col-span-3 grid grid-cols-4 gap-2"> {/* Grid for checkboxes */}
                {weekdays.map(day => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                       id={`cb-${day}`}
                       checked={days.includes(day)}
                       onCheckedChange={(checked) => handleDayChange(day, checked)}
                     />
                    <Label htmlFor={`cb-${day}`} className="text-sm font-normal">{day}</Label>
                  </div>
                ))}
              </div>
            </div>
           )}

          {type === 'daytype' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pattern" className="text-right">Pattern</Label>
              <RadioGroup
                value={pattern}
                onValueChange={(value) => setPattern(value as 'odd' | 'even')}
                className="col-span-3 flex space-x-4"
                >
                <div className="flex items-center space-x-2">
                   <RadioGroupItem value="odd" id="p-odd" />
                   <Label htmlFor="p-odd">Odd Days</Label>
                 </div>
                 <div className="flex items-center space-x-2">
                   <RadioGroupItem value="even" id="p-even" />
                   <Label htmlFor="p-even">Even Days</Label>
                 </div>
               </RadioGroup>
             </div>
           )}

          {type === 'once' && (
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="date" className="text-right">Date</Label>
               <Input
                 id="date"
                 type="date"
                 value={date}
                 onChange={(e) => setDate(e.target.value)}
                 className="col-span-3"
               />
             </div>
           )}

          {/* Start Time */}
           <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="start-time" className="text-right">Start Time</Label>
             <Input
               id="start-time"
               type="time"
               value={startTime}
               onChange={(e) => setStartTime(e.target.value)}
               className="col-span-3"
             />
           </div>

          {/* Duration */} 
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">Duration (min)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value, 10) || 1))} // Ensure positive integer
              min="1"
              className="col-span-3"
            />
          </div>

        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleSave}>Save Schedule</Button> {/* Changed type to button for now */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddScheduleModal;
