import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MainEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mainEventTime?: number;
  mainEventTitle?: string;
  mainEventDescription?: string;
  onSetMainEventTime: (timestamp: number) => void;
  onUpdateMainEventTitle: (title: string) => void;
  onUpdateMainEventDescription: (description: string) => void;
  darkMode: boolean;
}

export function MainEventDialog({ 
  open, 
  onOpenChange, 
  mainEventTime, 
  mainEventTitle = "Main Event", 
  mainEventDescription = "The primary event everything leads up to",
  onSetMainEventTime, 
  onUpdateMainEventTitle,
  onUpdateMainEventDescription,
  darkMode 
}: MainEventDialogProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [eventTitle, setEventTitle] = useState(mainEventTitle);
  const [eventDescription, setEventDescription] = useState(mainEventDescription);

  useEffect(() => {
    if (open) {
      if (mainEventTime) {
        const mainEventDate = new Date(mainEventTime);
        // Format date as YYYY-MM-DD for date input
        const year = mainEventDate.getFullYear();
        const month = String(mainEventDate.getMonth() + 1).padStart(2, '0');
        const day = String(mainEventDate.getDate()).padStart(2, '0');
        setSelectedDate(`${year}-${month}-${day}`);
        
        // Format time as HH:MM:SS for time input
        const hours = String(mainEventDate.getHours()).padStart(2, '0');
        const minutes = String(mainEventDate.getMinutes()).padStart(2, '0');
        const seconds = String(mainEventDate.getSeconds()).padStart(2, '0');
        setSelectedTime(`${hours}:${minutes}:${seconds}`);
      } else {
        // Default to 3 hours from now
        const defaultTime = new Date(Date.now() + 3 * 60 * 60 * 1000);
        const year = defaultTime.getFullYear();
        const month = String(defaultTime.getMonth() + 1).padStart(2, '0');
        const day = String(defaultTime.getDate()).padStart(2, '0');
        setSelectedDate(`${year}-${month}-${day}`);
        
        const hours = String(defaultTime.getHours()).padStart(2, '0');
        const minutes = String(defaultTime.getMinutes()).padStart(2, '0');
        const seconds = String(defaultTime.getSeconds()).padStart(2, '0');
        setSelectedTime(`${hours}:${minutes}:${seconds}`);
      }
      setEventTitle(mainEventTitle);
      setEventDescription(mainEventDescription);
    }
  }, [open, mainEventTime, mainEventTitle, mainEventDescription]);

  const handleSave = () => {
    if (!selectedDate || !selectedTime || !eventTitle.trim()) return;
    
    const newDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const newTimestamp = newDateTime.getTime();
    
    onSetMainEventTime(newTimestamp);
    onUpdateMainEventTitle(eventTitle);
    onUpdateMainEventDescription(eventDescription);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-slate-800 dark:text-slate-200">Edit Main Event</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Configure the main event that all other events are timed relative to
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="main-title" className="text-right">Event Title</Label>
            <Input
              id="main-title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Enter main event title"
              autoFocus={false}
              className="col-span-3 border border-slate-300 dark:border-slate-600"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="main-description" className="text-right">Description</Label>
            <Textarea
              id="main-description"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="Enter main event description"
              autoFocus={false}
              className="col-span-3 border border-slate-300 dark:border-slate-600"
              style={{ resize: 'none' }}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              autoFocus={false}
              className="col-span-3 border border-slate-300 dark:border-slate-600 h-10 pl-3 pr-3 py-2 date-input-rtl"
              style={{
                WebkitAppearance: 'none',
                MozAppearance: 'textfield'
              }}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">Time</Label>
            <Input
              id="time"
              type="time"
              step="1"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              autoFocus={false}
              className="col-span-3 border border-slate-300 dark:border-slate-600 h-10 pl-3 pr-3 py-2 time-input-rtl"
              style={{
                WebkitAppearance: 'none',
                MozAppearance: 'textfield'
              }}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedDate || !selectedTime || !eventTitle.trim()}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}