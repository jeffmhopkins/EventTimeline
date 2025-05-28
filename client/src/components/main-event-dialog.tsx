import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MainEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mainEventTime?: number;
  mainEventTitle?: string;
  onSetMainEventTime: (timestamp: number) => void;
  onUpdateMainEventTitle: (title: string) => void;
  darkMode: boolean;
}

export function MainEventDialog({ 
  open, 
  onOpenChange, 
  mainEventTime, 
  mainEventTitle = "Main Event", 
  onSetMainEventTime, 
  onUpdateMainEventTitle,
  darkMode 
}: MainEventDialogProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [eventTitle, setEventTitle] = useState(mainEventTitle);

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
    }
  }, [open, mainEventTime, mainEventTitle]);

  const handleSave = () => {
    if (!selectedDate || !selectedTime || !eventTitle.trim()) return;
    
    const newDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const newTimestamp = newDateTime.getTime();
    
    onSetMainEventTime(newTimestamp);
    onUpdateMainEventTitle(eventTitle);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-800 dark:text-slate-200">Edit Main Event</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="main-title" className="text-slate-700 dark:text-slate-300">Event Title</Label>
            <Input
              id="main-title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Enter main event title"
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date" className="text-slate-700 dark:text-slate-300">Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="time" className="text-slate-700 dark:text-slate-300">Time</Label>
            <Input
              id="time"
              type="time"
              step="1"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
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